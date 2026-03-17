import Link from "next/link";

import type { NavigationLink } from "@/lib/cms";

type SiteFooterProps = {
  navigation: NavigationLink[];
};

export function SiteFooter({ navigation }: SiteFooterProps) {
  return (
    <footer className="site-footer">
      <div className="shell site-footer__grid">
        <div className="stack">
          <p className="eyebrow">TrackYourGold</p>
          <h2>Modern gold intelligence with a calmer product surface.</h2>
          <p className="muted">
            The product is being rebuilt to feel like a premium financial intelligence tool: answer-first, card-led,
            and easier to trust on a daily visit.
          </p>
        </div>
        <div className="stack">
          <p className="eyebrow">Primary links</p>
          {navigation.map((item) => (
            <Link key={`${item.label}:${item.href}`} href={item.href} className="footer-link">
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
