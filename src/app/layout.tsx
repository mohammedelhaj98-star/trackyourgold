import type { Metadata, Viewport } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import type { ReactNode } from "react";

import "@/app/globals.css";
import { ThemeProvider } from "@/lib/theme-provider";
import { buildMetadata } from "@/lib/seo";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });

export const metadata: Metadata = buildMetadata({
  title: "Track local gold prices and timing signals",
  description:
    "Track Malabar Gold & Diamonds Qatar rates, compare them against spot-derived benchmarks, and grow alerts, SEO traffic, and premium readiness from one platform.",
  path: "/"
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#070B14"
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${manrope.variable} ${spaceGrotesk.variable} font-body antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
