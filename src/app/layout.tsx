import type { Metadata } from "next";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

import "./globals.css";

export const metadata: Metadata = {
  title: "TrackYourGold Reset",
  description: "Runtime-first TrackYourGold reset focused on stability, CMS ownership, and controlled rebuilding."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <SiteHeader />
          <main className="app-main">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
