import { ImageResponse } from "@vercel/og";

import { db } from "@/lib/db";
import { decimalToNumber } from "@/lib/utils";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const countrySlug = searchParams.get("country") ?? "qatar";
  const karat = searchParams.get("karat") ?? "22K";

  const country = await db.country.findUnique({ where: { slug: countrySlug } });
  const latest = country
    ? await db.goldPriceSnapshot.findFirst({
        where: { countryId: country.id, karatLabel: karat },
        orderBy: { capturedAt: "desc" }
      })
    : null;

  const price = latest ? decimalToNumber(latest.pricePerGram).toFixed(2) : "n/a";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #070B14 0%, #101828 55%, #1B2336 100%)",
          color: "white",
          padding: 48
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 64, height: 64, borderRadius: 18, background: "linear-gradient(135deg, #FBD96A, #B9891E)", color: "#070B14", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700 }}>TG</div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 16, letterSpacing: 4, textTransform: "uppercase", color: "#FBD96A" }}>TrackYourGold</div>
              <div style={{ fontSize: 18, color: "rgba(255,255,255,0.72)" }}>trackyourgold.com</div>
            </div>
          </div>
          <div style={{ fontSize: 18, color: "rgba(255,255,255,0.62)" }}>Shareable chart image</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 72, fontWeight: 700 }}>{karat} in {country?.name ?? countrySlug}</div>
          <div style={{ fontSize: 28, color: "rgba(255,255,255,0.76)" }}>Latest tracked price per gram</div>
          <div style={{ fontSize: 96, fontWeight: 700, color: "#FBD96A" }}>QAR {price}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 22, color: "rgba(255,255,255,0.72)" }}>Malabar Gold & Diamonds Qatar tracking + spot-derived premium context</div>
          <div style={{ fontSize: 18, color: "rgba(255,255,255,0.58)" }}>Brand-ready for social sharing</div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630
    }
  );
}