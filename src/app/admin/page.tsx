import { ContentPageType, ContentStatus } from "@prisma/client";

import {
  createArticleAction,
  createCityAction,
  createContentPageAction,
  createCountryAction,
  createFaqAction,
  createStoreAction,
  deleteArticleAction,
  deleteContentPageAction,
  deleteFaqAction,
  saveHomepageAction,
  saveNavigationAction,
  saveRedirectRulesAction,
  saveSettingAction,
  updateArticleAction,
  updateContentPageAction,
  updateFaqAction
} from "@/app/admin/actions";
import { getHomepageData, getNavigationLinks, getRedirectRules } from "@/lib/cms";
import { db } from "@/lib/db";
import { hasDatabaseConfig } from "@/lib/env";

export const dynamic = "force-dynamic";

type AdminPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function readParam(
  params: Record<string, string | string[] | undefined>,
  key: string
) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

function toNavigationDraft(links: { label: string; href: string }[]) {
  return links.map((link) => `${link.label}|${link.href}`).join("\n");
}

function toRedirectDraft(rules: { fromPath: string; toPath: string; statusCode: number }[]) {
  return rules.map((rule) => `${rule.fromPath}|${rule.toPath}|${rule.statusCode}`).join("\n");
}

async function getAdminData() {
  if (!hasDatabaseConfig()) {
    return {
      countries: [],
      cities: [],
      stores: [],
      pages: [],
      articles: [],
      faqs: [],
      settings: []
    };
  }

  const [countries, cities, stores, pages, articles, faqs, settings] = await Promise.all([
    db.country.findMany({ orderBy: { name: "asc" } }),
    db.city.findMany({ orderBy: [{ countryId: "asc" }, { name: "asc" }] }),
    db.store.findMany({ orderBy: [{ countryId: "asc" }, { name: "asc" }] }),
    db.contentPage.findMany({ include: { seoMetadata: true }, orderBy: [{ updatedAt: "desc" }] }),
    db.blogArticle.findMany({ include: { seoMetadata: true }, orderBy: [{ updatedAt: "desc" }] }),
    db.faq.findMany({ include: { seoMetadata: true }, orderBy: [{ updatedAt: "desc" }] }),
    db.setting.findMany({ orderBy: [{ groupName: "asc" }, { key: "asc" }], take: 20 })
  ]);

  return { countries, cities, stores, pages, articles, faqs, settings };
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const message = readParam(resolvedSearchParams, "message");

  const [{ page: homepage, layout }, navigation, redirectRules, adminData] = await Promise.all([
    getHomepageData(),
    getNavigationLinks(),
    getRedirectRules(),
    getAdminData()
  ]);

  return (
    <>
      <section className="hero admin-hero">
        <div className="stack">
          <p className="eyebrow">Reset admin CMS</p>
          <h1>Operate the new site from one console.</h1>
          <p>
            This admin surface intentionally focuses on homepage control, content publishing, taxonomy, redirects,
            and settings first. Broader product features come back only after runtime stability is proven.
          </p>
        </div>
        {message ? <div className="notice notice--success">{message}</div> : null}
      </section>

      <section className="admin-panel stack" id="homepage">
        <p className="eyebrow">Homepage editor</p>
        <h2>Primary public surface</h2>
        <form action={saveHomepageAction} className="inline-form-grid">
          <div className="field field--inline">
            <div className="field">
              <label htmlFor="homepage-eyebrow">Eyebrow</label>
              <input id="homepage-eyebrow" name="eyebrow" defaultValue={layout.eyebrow} />
            </div>
            <div className="field">
              <label htmlFor="homepage-heroMetricLabel">Hero metric label</label>
              <input
                id="homepage-heroMetricLabel"
                name="heroMetricLabel"
                defaultValue={homepage.heroMetricLabel ?? ""}
              />
            </div>
            <div className="field">
              <label htmlFor="homepage-status">Status</label>
              <select id="homepage-status" name="status" defaultValue={homepage.status}>
                {Object.values(ContentStatus).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="field">
            <label htmlFor="homepage-title">Title</label>
            <input id="homepage-title" name="title" defaultValue={homepage.title} />
          </div>
          <div className="field">
            <label htmlFor="homepage-summary">Summary</label>
            <textarea id="homepage-summary" name="summary" defaultValue={homepage.summary ?? ""} />
          </div>
          <div className="field">
            <label htmlFor="homepage-intro">Intro</label>
            <textarea id="homepage-intro" name="intro" defaultValue={homepage.intro ?? ""} />
          </div>
          <div className="field">
            <label htmlFor="homepage-body">Body</label>
            <textarea id="homepage-body" name="body" defaultValue={homepage.body} />
          </div>
          <div className="field field--inline">
            <div className="field">
              <label htmlFor="primaryCtaLabel">Primary CTA label</label>
              <input id="primaryCtaLabel" name="primaryCtaLabel" defaultValue={layout.primaryCtaLabel} />
            </div>
            <div className="field">
              <label htmlFor="primaryCtaHref">Primary CTA href</label>
              <input id="primaryCtaHref" name="primaryCtaHref" defaultValue={layout.primaryCtaHref} />
            </div>
            <div className="field">
              <label htmlFor="secondaryCtaLabel">Secondary CTA label</label>
              <input id="secondaryCtaLabel" name="secondaryCtaLabel" defaultValue={layout.secondaryCtaLabel} />
            </div>
            <div className="field">
              <label htmlFor="secondaryCtaHref">Secondary CTA href</label>
              <input id="secondaryCtaHref" name="secondaryCtaHref" defaultValue={layout.secondaryCtaHref} />
            </div>
          </div>
          <div className="field field--inline">
            <div className="field">
              <label htmlFor="homepage-seoTitle">SEO title</label>
              <input
                id="homepage-seoTitle"
                name="seoTitle"
                defaultValue={homepage.seoMetadata?.title ?? ""}
              />
            </div>
            <div className="field">
              <label htmlFor="homepage-seoDescription">SEO description</label>
              <textarea
                id="homepage-seoDescription"
                name="seoDescription"
                defaultValue={homepage.seoMetadata?.description ?? ""}
              />
            </div>
          </div>
          <div className="button-row">
            <button className="button" type="submit">
              Save homepage
            </button>
          </div>
        </form>
      </section>

      <section className="admin-panel stack" id="navigation">
        <p className="eyebrow">Navigation</p>
        <h2>Editable primary links</h2>
        <form action={saveNavigationAction} className="inline-form-grid">
          <div className="field">
            <label htmlFor="navigation-draft">One link per line</label>
            <textarea
              id="navigation-draft"
              name="navigation"
              defaultValue={toNavigationDraft(navigation)}
            />
            <p className="field-hint">Format: Label|/path</p>
          </div>
          <button className="button" type="submit">
            Save navigation
          </button>
        </form>
      </section>

      <section className="admin-panel stack" id="redirects">
        <p className="eyebrow">Redirect rules</p>
        <h2>Slug-safe routing fallback</h2>
        <form action={saveRedirectRulesAction} className="inline-form-grid">
          <div className="field">
            <label htmlFor="redirect-draft">One rule per line</label>
            <textarea
              id="redirect-draft"
              name="redirects"
              defaultValue={toRedirectDraft(redirectRules)}
            />
            <p className="field-hint">Format: /from-path|/to-path|301</p>
          </div>
          <button className="button" type="submit">
            Save redirects
          </button>
        </form>
      </section>

      <section className="admin-panel stack" id="pages">
        <p className="eyebrow">CMS pages</p>
        <h2>Create and maintain template-driven pages</h2>
        <form action={createContentPageAction} className="inline-form-grid">
          <div className="field field--inline">
            <div className="field">
              <label htmlFor="page-type">Type</label>
              <select id="page-type" name="type" defaultValue={ContentPageType.LANDING}>
                {Object.values(ContentPageType).map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="page-status">Status</label>
              <select id="page-status" name="status" defaultValue={ContentStatus.DRAFT}>
                {Object.values(ContentStatus).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="page-slug">Slug</label>
              <input id="page-slug" name="slug" required />
            </div>
            <div className="field">
              <label htmlFor="page-title">Title</label>
              <input id="page-title" name="title" required />
            </div>
          </div>

          <div className="field field--inline">
            <div className="field">
              <label htmlFor="page-country">Country</label>
              <select id="page-country" name="countryId" defaultValue="">
                <option value="">None</option>
                {adminData.countries.map((country) => (
                  <option key={country.id} value={country.id}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="page-city">City</label>
              <select id="page-city" name="cityId" defaultValue="">
                <option value="">None</option>
                {adminData.cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="page-store">Store</label>
              <select id="page-store" name="storeId" defaultValue="">
                <option value="">None</option>
                {adminData.stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="field">
            <label htmlFor="page-summary">Summary</label>
            <textarea id="page-summary" name="summary" />
          </div>
          <div className="field">
            <label htmlFor="page-intro">Intro</label>
            <textarea id="page-intro" name="intro" />
          </div>
          <div className="field">
            <label htmlFor="page-body">Body</label>
            <textarea id="page-body" name="body" />
          </div>
          <div className="field field--inline">
            <div className="field">
              <label htmlFor="page-seoTitle">SEO title</label>
              <input id="page-seoTitle" name="seoTitle" />
            </div>
            <div className="field">
              <label htmlFor="page-seoDescription">SEO description</label>
              <textarea id="page-seoDescription" name="seoDescription" />
            </div>
          </div>
          <button className="button" type="submit">
            Create page
          </button>
        </form>

        <div className="admin-card-grid">
          {adminData.pages.map((page) => (
            <article key={page.id} className="article-panel stack">
              <form action={updateContentPageAction} className="inline-form-grid">
                <input type="hidden" name="pageId" value={page.id} />
                <input type="hidden" name="oldSlug" value={page.slug} />
                <div className="field field--inline">
                  <div className="field">
                    <label>Type</label>
                    <select name="type" defaultValue={page.type}>
                      {Object.values(ContentPageType).map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label>Status</label>
                    <select name="status" defaultValue={page.status}>
                      {Object.values(ContentStatus).map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label>Slug</label>
                    <input name="slug" defaultValue={page.slug} />
                  </div>
                  <div className="field">
                    <label>Title</label>
                    <input name="title" defaultValue={page.title} />
                  </div>
                </div>
                <div className="field">
                  <label>Summary</label>
                  <textarea name="summary" defaultValue={page.summary ?? ""} />
                </div>
                <div className="field">
                  <label>Intro</label>
                  <textarea name="intro" defaultValue={page.intro ?? ""} />
                </div>
                <div className="field">
                  <label>Body</label>
                  <textarea name="body" defaultValue={page.body} />
                </div>
                <div className="field field--inline">
                  <div className="field">
                    <label>Country</label>
                    <select name="countryId" defaultValue={page.countryId ?? ""}>
                      <option value="">None</option>
                      {adminData.countries.map((country) => (
                        <option key={country.id} value={country.id}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label>City</label>
                    <select name="cityId" defaultValue={page.cityId ?? ""}>
                      <option value="">None</option>
                      {adminData.cities.map((city) => (
                        <option key={city.id} value={city.id}>
                          {city.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label>Store</label>
                    <select name="storeId" defaultValue={page.storeId ?? ""}>
                      <option value="">None</option>
                      {adminData.stores.map((store) => (
                        <option key={store.id} value={store.id}>
                          {store.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="field field--inline">
                  <div className="field">
                    <label>SEO title</label>
                    <input name="seoTitle" defaultValue={page.seoMetadata?.title ?? ""} />
                  </div>
                  <div className="field">
                    <label>SEO description</label>
                    <textarea name="seoDescription" defaultValue={page.seoMetadata?.description ?? ""} />
                  </div>
                </div>
                <div className="mini-actions">
                  <label className="field-hint">
                    <input type="checkbox" name="createRedirect" /> Create redirect if slug changes
                  </label>
                </div>
                <div className="button-row">
                  <button className="button" type="submit">
                    Save page
                  </button>
                </div>
              </form>

              {page.slug !== "home" ? (
                <form action={deleteContentPageAction}>
                  <input type="hidden" name="pageId" value={page.id} />
                  <button className="button button--danger" type="submit">
                    Delete page
                  </button>
                </form>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section className="admin-panel stack" id="articles">
        <p className="eyebrow">Articles</p>
        <h2>Article CRUD for later public rollout</h2>
        <form action={createArticleAction} className="inline-form-grid">
          <div className="field field--inline">
            <div className="field">
              <label>Slug</label>
              <input name="slug" required />
            </div>
            <div className="field">
              <label>Title</label>
              <input name="title" required />
            </div>
            <div className="field">
              <label>Category</label>
              <input name="category" />
            </div>
            <div className="field">
              <label>Status</label>
              <select name="status" defaultValue={ContentStatus.DRAFT}>
                {Object.values(ContentStatus).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="field">
            <label>Excerpt</label>
            <textarea name="excerpt" />
          </div>
          <div className="field">
            <label>Body</label>
            <textarea name="body" />
          </div>
          <div className="field field--inline">
            <div className="field">
              <label>Country</label>
              <select name="countryId" defaultValue="">
                <option value="">None</option>
                {adminData.countries.map((country) => (
                  <option key={country.id} value={country.id}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>SEO title</label>
              <input name="seoTitle" />
            </div>
            <div className="field">
              <label>SEO description</label>
              <textarea name="seoDescription" />
            </div>
          </div>
          <button className="button" type="submit">
            Create article
          </button>
        </form>

        <div className="admin-card-grid">
          {adminData.articles.map((article) => (
            <article key={article.id} className="article-panel stack">
              <form action={updateArticleAction} className="inline-form-grid">
                <input type="hidden" name="articleId" value={article.id} />
                <div className="field field--inline">
                  <div className="field">
                    <label>Slug</label>
                    <input name="slug" defaultValue={article.slug} />
                  </div>
                  <div className="field">
                    <label>Title</label>
                    <input name="title" defaultValue={article.title} />
                  </div>
                  <div className="field">
                    <label>Category</label>
                    <input name="category" defaultValue={article.category ?? ""} />
                  </div>
                  <div className="field">
                    <label>Status</label>
                    <select name="status" defaultValue={article.status}>
                      {Object.values(ContentStatus).map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="field">
                  <label>Excerpt</label>
                  <textarea name="excerpt" defaultValue={article.excerpt} />
                </div>
                <div className="field">
                  <label>Body</label>
                  <textarea name="body" defaultValue={article.body} />
                </div>
                <div className="field field--inline">
                  <div className="field">
                    <label>Country</label>
                    <select name="countryId" defaultValue={article.countryId ?? ""}>
                      <option value="">None</option>
                      {adminData.countries.map((country) => (
                        <option key={country.id} value={country.id}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label>SEO title</label>
                    <input name="seoTitle" defaultValue={article.seoMetadata?.title ?? ""} />
                  </div>
                  <div className="field">
                    <label>SEO description</label>
                    <textarea name="seoDescription" defaultValue={article.seoMetadata?.description ?? ""} />
                  </div>
                </div>
                <div className="button-row">
                  <button className="button" type="submit">
                    Save article
                  </button>
                </div>
              </form>
              <form action={deleteArticleAction}>
                <input type="hidden" name="articleId" value={article.id} />
                <button className="button button--danger" type="submit">
                  Delete article
                </button>
              </form>
            </article>
          ))}
        </div>
      </section>

      <section className="admin-panel stack" id="faqs">
        <p className="eyebrow">FAQs</p>
        <h2>FAQ CRUD for controlled public reintroduction</h2>
        <form action={createFaqAction} className="inline-form-grid">
          <div className="field field--inline">
            <div className="field">
              <label>Slug</label>
              <input name="slug" required />
            </div>
            <div className="field">
              <label>Question</label>
              <input name="question" required />
            </div>
            <div className="field">
              <label>Category</label>
              <input name="category" />
            </div>
            <div className="field">
              <label>Sort order</label>
              <input name="sortOrder" type="number" defaultValue="0" />
            </div>
          </div>
          <div className="field">
            <label>Answer</label>
            <textarea name="answer" />
          </div>
          <div className="field field--inline">
            <div className="field">
              <label>Country</label>
              <select name="countryId" defaultValue="">
                <option value="">None</option>
                {adminData.countries.map((country) => (
                  <option key={country.id} value={country.id}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>SEO title</label>
              <input name="seoTitle" />
            </div>
            <div className="field">
              <label>SEO description</label>
              <textarea name="seoDescription" />
            </div>
          </div>
          <label className="field-hint">
            <input type="checkbox" name="isPublished" defaultChecked /> Published
          </label>
          <button className="button" type="submit">
            Create FAQ
          </button>
        </form>

        <div className="admin-card-grid">
          {adminData.faqs.map((faq) => (
            <article key={faq.id} className="article-panel stack">
              <form action={updateFaqAction} className="inline-form-grid">
                <input type="hidden" name="faqId" value={faq.id} />
                <div className="field field--inline">
                  <div className="field">
                    <label>Slug</label>
                    <input name="slug" defaultValue={faq.slug} />
                  </div>
                  <div className="field">
                    <label>Question</label>
                    <input name="question" defaultValue={faq.question} />
                  </div>
                  <div className="field">
                    <label>Category</label>
                    <input name="category" defaultValue={faq.category ?? ""} />
                  </div>
                  <div className="field">
                    <label>Sort order</label>
                    <input name="sortOrder" type="number" defaultValue={String(faq.sortOrder)} />
                  </div>
                </div>
                <div className="field">
                  <label>Answer</label>
                  <textarea name="answer" defaultValue={faq.answer} />
                </div>
                <div className="field field--inline">
                  <div className="field">
                    <label>Country</label>
                    <select name="countryId" defaultValue={faq.countryId ?? ""}>
                      <option value="">None</option>
                      {adminData.countries.map((country) => (
                        <option key={country.id} value={country.id}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label>SEO title</label>
                    <input name="seoTitle" defaultValue={faq.seoMetadata?.title ?? ""} />
                  </div>
                  <div className="field">
                    <label>SEO description</label>
                    <textarea name="seoDescription" defaultValue={faq.seoMetadata?.description ?? ""} />
                  </div>
                </div>
                <label className="field-hint">
                  <input type="checkbox" name="isPublished" defaultChecked={faq.isPublished} /> Published
                </label>
                <div className="button-row">
                  <button className="button" type="submit">
                    Save FAQ
                  </button>
                </div>
              </form>
              <form action={deleteFaqAction}>
                <input type="hidden" name="faqId" value={faq.id} />
                <button className="button button--danger" type="submit">
                  Delete FAQ
                </button>
              </form>
            </article>
          ))}
        </div>
      </section>

      <section className="admin-panel stack" id="taxonomy">
        <p className="eyebrow">Taxonomy</p>
        <h2>Countries, cities, and stores</h2>
        <div className="taxonomy-grid">
          <form action={createCountryAction} className="article-panel stack">
            <h3>Create country</h3>
            <div className="field">
              <label>Name</label>
              <input name="name" required />
            </div>
            <div className="field">
              <label>Code</label>
              <input name="code" required />
            </div>
            <div className="field">
              <label>Slug</label>
              <input name="slug" required />
            </div>
            <div className="field">
              <label>Currency code</label>
              <input name="currencyCode" defaultValue="QAR" />
            </div>
            <div className="field">
              <label>Timezone</label>
              <input name="timezone" defaultValue="Asia/Qatar" />
            </div>
            <label className="field-hint">
              <input type="checkbox" name="isActive" defaultChecked /> Active
            </label>
            <button className="button" type="submit">
              Add country
            </button>
          </form>

          <form action={createCityAction} className="article-panel stack">
            <h3>Create city</h3>
            <div className="field">
              <label>Country</label>
              <select name="countryId" required defaultValue="">
                <option value="" disabled>
                  Select country
                </option>
                {adminData.countries.map((country) => (
                  <option key={country.id} value={country.id}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Name</label>
              <input name="name" required />
            </div>
            <div className="field">
              <label>Slug</label>
              <input name="slug" required />
            </div>
            <label className="field-hint">
              <input type="checkbox" name="isActive" defaultChecked /> Active
            </label>
            <button className="button" type="submit">
              Add city
            </button>
          </form>

          <form action={createStoreAction} className="article-panel stack">
            <h3>Create store</h3>
            <div className="field">
              <label>Country</label>
              <select name="countryId" required defaultValue="">
                <option value="" disabled>
                  Select country
                </option>
                {adminData.countries.map((country) => (
                  <option key={country.id} value={country.id}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>City</label>
              <select name="cityId" defaultValue="">
                <option value="">None</option>
                {adminData.cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Name</label>
              <input name="name" required />
            </div>
            <div className="field">
              <label>Slug</label>
              <input name="slug" required />
            </div>
            <div className="field">
              <label>Brand</label>
              <input name="brand" />
            </div>
            <div className="field">
              <label>External URL</label>
              <input name="externalUrl" />
            </div>
            <div className="field">
              <label>Description</label>
              <textarea name="description" />
            </div>
            <label className="field-hint">
              <input type="checkbox" name="isPrimarySource" /> Primary source
            </label>
            <button className="button" type="submit">
              Add store
            </button>
          </form>
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>Countries</th>
              <th>Cities</th>
              <th>Stores</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div className="admin-list">
                  {adminData.countries.map((country) => (
                    <div key={country.id}>
                      {country.name} ({country.code}) - /{country.slug}
                    </div>
                  ))}
                </div>
              </td>
              <td>
                <div className="admin-list">
                  {adminData.cities.map((city) => (
                    <div key={city.id}>
                      {city.name} - /{city.slug}
                    </div>
                  ))}
                </div>
              </td>
              <td>
                <div className="admin-list">
                  {adminData.stores.map((store) => (
                    <div key={store.id}>
                      {store.name} - /{store.slug}
                    </div>
                  ))}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="admin-panel stack" id="settings">
        <p className="eyebrow">Settings</p>
        <h2>Generic key/value overrides</h2>
        <form action={saveSettingAction} className="inline-form-grid">
          <div className="field field--inline">
            <div className="field">
              <label>Key</label>
              <input name="key" required />
            </div>
            <div className="field">
              <label>Group</label>
              <input name="groupName" defaultValue="site" />
            </div>
            <div className="field">
              <label>Value type</label>
              <input name="valueType" defaultValue="string" />
            </div>
          </div>
          <div className="field">
            <label>Description</label>
            <input name="description" />
          </div>
          <div className="field">
            <label>Value</label>
            <textarea name="value" />
          </div>
          <button className="button" type="submit">
            Save setting
          </button>
        </form>

        <div className="setting-list">
          {adminData.settings.map((setting) => (
            <div key={setting.id}>
              <strong>{setting.key}</strong>
              <div className="muted">
                {setting.groupName} - {setting.valueType}
              </div>
              <div className="code-block">{setting.value}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
