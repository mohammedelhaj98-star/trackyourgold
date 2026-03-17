import { Button } from "@/components/ui/button";
import { FinancialDisclaimer } from "@/components/ui/disclaimer";
import { InternalLinksGrid } from "@/components/ui/internal-links-grid";
import { MetricCard } from "@/components/ui/metric-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { siteConfig } from "@/lib/constants";

export default function HomePage() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-20 px-6 py-10 lg:px-8 lg:py-16">
      <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <div className="space-y-8">
          <div className="space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold-200">TrackYourGold</p>
            <h1 className="max-w-4xl font-display text-5xl font-semibold tracking-tight text-white md:text-7xl">
              One homepage first. Everything else gets rebuilt properly from there.
            </h1>
            <p className="max-w-3xl text-base leading-8 text-white/72 md:text-lg">
              TrackYourGold is shifting to a homepage-first product shell. The homepage becomes the stable front door for
              users, accounts, alerts, and operator workflows, while the older market pages stay published quietly in the
              background for SEO until each one is rebuilt page by page.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button href="/register">Create account</Button>
            <Button href="/dashboard" variant="secondary">Open dashboard</Button>
            <Button href="/#platform" variant="ghost">See platform</Button>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard
              label="Homepage-first UX"
              value="1 shell"
              detail="A single stable front door keeps the product understandable while the deeper pages are rebuilt in order."
            />
            <MetricCard
              label="Account system"
              value="Ready"
              detail="Registration, login, dashboard access, and admin controls stay part of the main product experience."
            />
            <MetricCard
              label="SEO background"
              value="Kept"
              detail="Older public routes remain online and crawlable, but they stop defining the main navigation."
            />
          </div>
        </div>

        <div className="space-y-4 rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-panel">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-200">Product reset</p>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-white/55">Current direction</p>
              <p className="mt-2 font-display text-4xl font-semibold text-white">Build cleanly, page by page</p>
              <p className="mt-2 text-sm text-white/65">
                Start with the homepage as the stable product surface, then rebuild admin, dashboard, live pages, and
                analysis pages in sequence instead of carrying all legacy complexity at once.
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-white/45">First rebuilt area</p>
                <p className="mt-2 text-xl font-semibold text-white">Homepage</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-white/45">Next rebuild target</p>
                <p className="mt-2 text-xl font-semibold text-white">Admin side</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="platform" className="space-y-8 scroll-mt-28">
        <SectionHeading
          eyebrow="Platform"
          title="The new front door is about product clarity, not route count"
          description="The main site should explain the product, capture accounts, and guide users into the right tools. Deep public routes can stay online for search while we redesign them with a cleaner standard."
        />
        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard
            label="Public layer"
            value="Homepage"
            detail="The homepage becomes the product narrative, trust surface, and conversion layer for new visitors."
          />
          <MetricCard
            label="Private layer"
            value="Accounts"
            detail="Dashboard, alerts, saved analysis, and admin stay product-led instead of feeling bolted onto SEO pages."
          />
          <MetricCard
            label="Content layer"
            value="SEO kept"
            detail="Existing deep routes remain available in the background so search equity is not thrown away."
          />
        </div>
      </section>

      <section id="workflow" className="space-y-8 scroll-mt-28">
        <SectionHeading
          eyebrow="Workflow"
          title="Rebuild order stays intentional"
          description="We keep the homepage live as the stable shell, then rebuild one section at a time so each area lands finished instead of spreading effort across dozens of half-working pages."
        />
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-panel">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-200">Step 1</p>
            <h3 className="mt-4 font-display text-2xl font-semibold text-white">Stable homepage shell</h3>
            <p className="mt-3 text-sm leading-7 text-white/68">
              Clean narrative, clear account CTAs, reliable brand surface, and minimal dependency on deeper routes.
            </p>
          </div>
          <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-panel">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-200">Step 2</p>
            <h3 className="mt-4 font-display text-2xl font-semibold text-white">Admin and dashboard</h3>
            <p className="mt-3 text-sm leading-7 text-white/68">
              Build operator and user tools with a cleaner data model and less fragile page rendering.
            </p>
          </div>
          <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-panel">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-200">Step 3</p>
            <h3 className="mt-4 font-display text-2xl font-semibold text-white">Public pages one by one</h3>
            <p className="mt-3 text-sm leading-7 text-white/68">
              Reintroduce live, history, calculators, and guides only when each page is stable enough to deserve main-nav attention.
            </p>
          </div>
        </div>
      </section>

      <section id="seo-index" className="space-y-8 scroll-mt-28">
        <SectionHeading
          eyebrow="Background SEO"
          title="Keep the older public routes alive, but out of the way"
          description="These routes remain published as search-entry pages while the main product experience focuses on the homepage. They still matter, but they no longer define the primary navigation."
        />
        <InternalLinksGrid
          items={siteConfig.seoNav.map((item) => ({
            href: item.href,
            title: item.label,
            description: "Legacy public route kept published for background SEO and future rebuild sequencing."
          }))}
        />
      </section>

      <FinancialDisclaimer />
    </div>
  );
}
