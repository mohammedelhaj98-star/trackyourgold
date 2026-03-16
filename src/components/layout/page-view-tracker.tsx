"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function PageViewTracker({ routeType, countrySlug }: { routeType: string; countrySlug?: string }) {
  const pathname = usePathname();

  useEffect(() => {
    void fetch("/api/analytics/pageview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: pathname,
        routeType,
        countrySlug,
        referrer: document.referrer || null
      })
    });
  }, [countrySlug, pathname, routeType]);

  return null;
}
