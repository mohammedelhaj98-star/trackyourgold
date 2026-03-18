import type { PriceSource, PrismaClient } from "@prisma/client";

import { hoursFromNow } from "@trackyourgold/shared";

type RobotsGroup = {
  userAgents: string[];
  allows: string[];
  disallows: string[];
};

export type ParsedRobots = {
  groups: RobotsGroup[];
  raw: string;
};

function buildUrl(host: string, path: string) {
  const scheme = "https:";
  return new URL(path, `${scheme}//${host}`);
}

export function parseRobots(raw: string): ParsedRobots {
  const groups: RobotsGroup[] = [];
  let current: RobotsGroup | null = null;

  for (const rawLine of raw.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf(":");
    if (separatorIndex === -1) {
      throw new Error("Malformed robots line.");
    }

    const field = line.slice(0, separatorIndex).trim().toLowerCase();
    const value = line.slice(separatorIndex + 1).trim();

    if (field === "user-agent") {
      if (!current || (current.allows.length > 0 || current.disallows.length > 0)) {
        current = { userAgents: [], allows: [], disallows: [] };
        groups.push(current);
      }

      current.userAgents.push(value.toLowerCase());
      continue;
    }

    if (!current) {
      throw new Error("Robots rules without user-agent.");
    }

    if (field === "allow") {
      current.allows.push(value);
    }

    if (field === "disallow") {
      current.disallows.push(value);
    }
  }

  return { groups, raw };
}

function selectGroup(parsed: ParsedRobots, userAgent: string) {
  const normalized = userAgent.toLowerCase();
  return (
    parsed.groups.find((group) => group.userAgents.includes(normalized)) ??
    parsed.groups.find((group) => group.userAgents.includes("*")) ??
    null
  );
}

export function isPathAllowed(parsed: ParsedRobots, path: string, userAgent = "trackyourgold-bot") {
  const group = selectGroup(parsed, userAgent);
  if (!group) {
    return true;
  }

  const matchedDisallow = group.disallows
    .filter((rule) => rule && path.startsWith(rule))
    .sort((a, b) => b.length - a.length)[0];
  const matchedAllow = group.allows
    .filter((rule) => rule && path.startsWith(rule))
    .sort((a, b) => b.length - a.length)[0];

  if (!matchedDisallow) {
    return true;
  }

  if (!matchedAllow) {
    return false;
  }

  return matchedAllow.length >= matchedDisallow.length;
}

export async function fetchRobots(db: PrismaClient, source: PriceSource, ttlHours: number) {
  const cached = await db.sourceRobotsCache.findFirst({
    where: {
      sourceId: source.id,
      expiresAt: { gt: new Date() }
    },
    orderBy: { fetchedAt: "desc" }
  });

  if (cached) {
    if (!cached.parsedOk) {
      return { allowed: false, parsed: null, reason: "cached_parse_failure" as const };
    }

    const parsed = parseRobots(cached.robotsTxt);
    return { allowed: isPathAllowed(parsed, source.path), parsed, reason: "cache" as const };
  }

  const response = await fetch(buildUrl(source.host, "/robots.txt"));
  const robotsTxt = await response.text();
  let parsed: ParsedRobots | null = null;
  let allow = false;
  let notes: string | null = null;

  if (!response.ok) {
    notes = `robots status ${response.status}`;
  } else {
    try {
      parsed = parseRobots(robotsTxt);
      allow = isPathAllowed(parsed, source.path);
    } catch (error) {
      notes = error instanceof Error ? error.message : "robots_parse_error";
    }
  }

  await db.sourceRobotsCache.create({
    data: {
      sourceId: source.id,
      expiresAt: hoursFromNow(ttlHours),
      robotsTxt,
      parsedOk: Boolean(parsed),
      allowAll: allow,
      notes
    }
  });

  if (!parsed) {
    return { allowed: false, parsed: null, reason: "parse_error" as const };
  }

  return { allowed: allow, parsed, reason: "fetched" as const };
}
