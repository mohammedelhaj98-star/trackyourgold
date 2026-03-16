import Link from "next/link";

import { Panel } from "@/components/ui/panel";

export function InternalLinksGrid({ items }: { items: Array<{ href: string; title: string; description: string }> }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <Link key={item.href} href={item.href}>
          <Panel className="h-full transition hover:border-gold-300/40 hover:bg-white/[0.06]">
            <h3 className="font-display text-xl font-semibold text-white">{item.title}</h3>
            <p className="mt-3 text-sm leading-7 text-white/65">{item.description}</p>
          </Panel>
        </Link>
      ))}
    </div>
  );
}
