import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const body = (await request.json()) as { path?: string; routeType?: string; countrySlug?: string; referrer?: string | null };
  const user = await getCurrentUser();
  const country = body.countrySlug ? await db.country.findUnique({ where: { slug: body.countrySlug } }) : null;

  await db.internalAnalytics.create({
    data: {
      path: body.path ?? "/",
      routeType: body.routeType ?? "unknown",
      eventType: "page_view",
      countryId: country?.id,
      sourcePage: body.path ?? "/",
      referrer: body.referrer ?? null,
      userId: user?.id,
      metadataJson: {
        source: "client-beacon"
      }
    }
  });

  return NextResponse.json({ ok: true });
}
