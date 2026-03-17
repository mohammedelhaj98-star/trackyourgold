import Link from "next/link";

import { getNavigationLinks } from "@/lib/cms";

export async function SiteFooter() {
  const navigation = await getNavigationLinks();

  return (
    <footer className="site-footer">
      <div className="shell site-footer__grid">
        <div className="stack">
          <p className="eyebrow">Reset status</p>
          <h2>Built to prove deployment stability first.</h2>
          <p className="muted">
            The old TrackYourGold implementation is archived. This branch now exists to validate runtime stability,
            homepage control, and a smaller admin-operated CMS before any larger feature returns.
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
