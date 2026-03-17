import Link from "next/link";

import { logoutAction } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requireAdmin("/admin");

  return (
    <div className="shell admin-layout">
      <aside className="admin-sidebar">
        <div className="stack">
          <p className="eyebrow">Signed in</p>
          <h2>{user.name ?? user.email}</h2>
          <p className="muted">Reset admin console</p>
        </div>

        <nav>
          <Link href="#homepage">Homepage</Link>
          <Link href="#navigation">Navigation</Link>
          <Link href="#redirects">Redirects</Link>
          <Link href="#pages">Pages</Link>
          <Link href="#articles">Articles</Link>
          <Link href="#faqs">FAQs</Link>
          <Link href="#taxonomy">Taxonomy</Link>
          <Link href="#settings">Settings</Link>
        </nav>

        <form action={logoutAction}>
          <button className="button button--ghost" type="submit">
            Log out
          </button>
        </form>
      </aside>

      <div className="admin-content">{children}</div>
    </div>
  );
}
