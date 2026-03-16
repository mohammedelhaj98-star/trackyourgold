import "server-only";

import { AlertType, ContentStatus } from "@prisma/client";

import { db } from "@/lib/db";
import { decimalToNumber, percentChange } from "@/lib/utils";
import { sendEmail } from "@/server/services/alerts/mailer";
import { evaluateRecommendation } from "@/server/services/pricing/recommendation";
import { buildWeeklySummary } from "@/server/services/pricing/summaries";

function withinCooldown(deliveredAt: Date | null, cooldownMinutes: number) {
  if (!deliveredAt) return false;
  return Date.now() - deliveredAt.getTime() < cooldownMinutes * 60 * 1000;
}

export async function evaluateAlertRules(countrySlug = "qatar") {
  const country = await db.country.findUnique({ where: { slug: countrySlug } });
  if (!country) throw new Error("Country not found.");

  const rules = await db.alertRule.findMany({
    where: { countryId: country.id, isActive: true },
    include: {
      user: true,
      events: { orderBy: { createdAt: "desc" }, take: 1 }
    }
  });

  const global = await db.globalGoldPrice.findFirst({ where: { countryId: country.id }, orderBy: { capturedAt: "desc" } });
  const sent: Array<{ email: string; type: AlertType; karatLabel: string | null }> = [];

  for (const rule of rules) {
    const karatLabel = rule.karatLabel ?? "22K";
    const series = await db.goldPriceSnapshot.findMany({
      where: { countryId: country.id, karatLabel },
      orderBy: { capturedAt: "desc" },
      take: 180
    });

    if (series.length < 3) continue;

    const current = series[0];
    const baseline = series[2];
    const currentPrice = decimalToNumber(current.pricePerGram);
    const baselinePrice = decimalToNumber(baseline.pricePerGram);
    const dropPct = percentChange(currentPrice, baselinePrice);
    const low90d = Math.min(...series.map((item) => decimalToNumber(item.pricePerGram)));
    const lastEvent = rule.events[0] ?? null;

    if (withinCooldown(lastEvent?.deliveredAt ?? null, rule.cooldownMinutes)) {
      continue;
    }

    let shouldTrigger = false;
    let title = "";
    let body = "";

    if (rule.type === AlertType.PRICE_DROP && rule.percentThreshold && dropPct <= rule.percentThreshold * -1) {
      shouldTrigger = true;
      title = `${karatLabel} price drop alert`;
      body = `${karatLabel} in ${country.name} is down ${Math.abs(dropPct).toFixed(2)}% over the monitored window.`;
    }

    if (rule.type === AlertType.NEW_90_DAY_LOW && currentPrice <= low90d) {
      shouldTrigger = true;
      title = `${karatLabel} hit a new 90-day low`;
      body = `${karatLabel} has moved into a fresh 90-day low zone in ${country.name}.`;
    }

    if (!shouldTrigger) continue;

    const created = await db.alertEvent.create({
      data: {
        userId: rule.userId,
        ruleId: rule.id,
        countryId: country.id,
        karatLabel,
        type: rule.type,
        title,
        body,
        status: "queued",
        dedupeKey: `${rule.id}:${current.id}`
      }
    });

    if (rule.emailEnabled) {
      await sendEmail({
        to: rule.user.email,
        subject: title,
        html: `<p>${body}</p><p>Track the latest price and recommendation on TrackYourGold.</p>`,
        text: body
      });
      await db.alertEvent.update({ where: { id: created.id }, data: { status: "sent", deliveredAt: new Date() } });
      sent.push({ email: rule.user.email, type: rule.type, karatLabel });
    }

    if (rule.dashboardEnabled && !rule.emailEnabled) {
      await db.alertEvent.update({ where: { id: created.id }, data: { status: "ready", deliveredAt: new Date() } });
    }
  }

  const degradedMode = !global;
  if (degradedMode) {
    await db.systemLog.create({
      data: {
        level: "WARN",
        category: "alerts",
        message: "Alerts evaluated without global spot data; local trend mode remained active.",
        metadataJson: { country: country.slug }
      }
    });
  }

  return { ok: true, sent, degradedMode };
}

export async function sendWeeklySummaryEmails(countrySlug = "qatar") {
  const country = await db.country.findUnique({ where: { slug: countrySlug } });
  if (!country) throw new Error("Country not found.");

  const rules = await db.alertRule.findMany({
    where: {
      countryId: country.id,
      type: AlertType.WEEKLY_SUMMARY,
      isActive: true,
      emailEnabled: true
    },
    include: { user: true }
  });

  for (const rule of rules) {
    const karatLabel = rule.karatLabel ?? "22K";
    const series = await db.goldPriceSnapshot.findMany({
      where: { countryId: country.id, karatLabel },
      orderBy: { capturedAt: "desc" },
      take: 180
    });

    if (!series.length) continue;

    const latestRate = series[0];
    const global = await db.globalGoldPrice.findFirst({ where: { countryId: country.id }, orderBy: { capturedAt: "desc" } });
    const recommendation = await evaluateRecommendation({
      countryId: country.id,
      karatLabel,
      snapshots: series.map((item) => ({ id: item.id, pricePerGram: item.pricePerGram, capturedAt: item.capturedAt })).reverse(),
      spotEstimateQarPerGram: global ? decimalToNumber(global.qarPerGramEstimate) : null
    });

    const summary = buildWeeklySummary({
      karatLabel,
      latestRate,
      change7d: percentChange(decimalToNumber(series[0].pricePerGram), decimalToNumber(series[14]?.pricePerGram ?? series[0].pricePerGram)),
      change30d: percentChange(decimalToNumber(series[0].pricePerGram), decimalToNumber(series[60]?.pricePerGram ?? series[0].pricePerGram)),
      premiumVsSpot: recommendation?.metrics.premiumVsSpot ?? null,
      recommendationLabel: recommendation?.label.replaceAll("_", " ") ?? "WAIT"
    });

    const sent = await sendEmail({
      to: rule.user.email,
      subject: summary.subject,
      html: `<p>${summary.body}</p><p>See the full weekly breakdown on TrackYourGold.</p>`,
      text: summary.preview
    });

    await db.alertEvent.create({
      data: {
        userId: rule.userId,
        ruleId: rule.id,
        countryId: country.id,
        karatLabel,
        type: AlertType.WEEKLY_SUMMARY,
        title: summary.subject,
        body: summary.body,
        status: "messageId" in (sent as object) ? "sent" : "queued",
        deliveredAt: new Date()
      }
    });
  }

  return { ok: true, processed: rules.length };
}

export async function bootstrapWeeklySummaryRules() {
  const existing = await db.alertRule.count({ where: { type: AlertType.WEEKLY_SUMMARY } });
  if (existing) return;

  const demoUser = await db.user.findFirst({ where: { email: "demo@trackyourgold.com" } });
  const qatar = await db.country.findUnique({ where: { slug: "qatar" } });
  if (!demoUser || !qatar) return;

  await db.alertRule.create({
    data: {
      userId: demoUser.id,
      countryId: qatar.id,
      karatLabel: "22K",
      type: AlertType.WEEKLY_SUMMARY,
      summaryFrequency: "weekly",
      emailEnabled: true,
      dashboardEnabled: true,
      cooldownMinutes: 10080,
      isActive: true,
      settingsJson: { weekday: "MONDAY" }
    }
  });
}
