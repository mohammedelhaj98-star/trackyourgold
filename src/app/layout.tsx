import type { Metadata } from "next";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getNavigationLinks } from "@/lib/cms";

import "./globals.css";

export const metadata: Metadata = {
  title: "TrackYourGold Reset",
  description: "Runtime-first TrackYourGold reset focused on stability, CMS ownership, and controlled rebuilding."
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const navigation = await getNavigationLinks();

  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <SiteHeader navigation={navigation} />
          <main className="app-main">{children}</main>
          <SiteFooter navigation={navigation} />
        </div>
      </body>
    </html>
  );
}
