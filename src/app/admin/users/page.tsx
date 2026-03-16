import { buildMetadata } from "@/lib/seo";
import { db } from "@/lib/db";

export const metadata = buildMetadata({
  title: "Users",
  description: "Manage users and roles.",
  path: "/admin/users",
  noIndex: true
});

export default async function AdminUsersPage() {
  const users = await db.user.findMany({ orderBy: { createdAt: "desc" }, take: 50 });

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-200">Users</p>
        <h1 className="font-display text-4xl font-semibold text-white">User management</h1>
      </section>
      <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-panel">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-white/70">
            <thead>
              <tr className="border-b border-white/10 text-white/45">
                <th className="pb-3 pr-4">Email</th>
                <th className="pb-3 pr-4">Role</th>
                <th className="pb-3 pr-4">Plan</th>
                <th className="pb-3 pr-4">Ads suppressed</th>
                <th className="pb-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-white/5">
                  <td className="py-4 pr-4">{user.email}</td>
                  <td className="py-4 pr-4">{user.role}</td>
                  <td className="py-4 pr-4">{user.plan}</td>
                  <td className="py-4 pr-4">{user.adsSuppressed ? "Yes" : "No"}</td>
                  <td className="py-4">{user.createdAt.toISOString().slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
