import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    affiliateLinkId?: string;
    storeId?: string;
    pagePath?: string;
    localeCode?: string;
    outboundUrl?: string;
    countrySlug?: string;
  };
  const user = await getCurrentUser();
  const country = body.countrySlug ? await db.country.findUnique({ where: { slug: body.countrySlug } }) : null;

  await db.affiliateClick.create({
    data: {
      affiliateLinkId: body.affiliateLinkId ?? null,
      storeId: body.storeId ?? null,
      pagePath: body.pagePath ?? "/",
      localeCode: body.localeCode ?? null,
      userId: user?.id,
      countryId: country?.id,
      outboundUrl: body.outboundUrl ?? "/",
      metadataJson: { source: "client-event" }
    }
  });

  return NextResponse.json({ ok: true });
}
