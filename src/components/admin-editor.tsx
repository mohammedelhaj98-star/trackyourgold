"use client";

import { type CSSProperties, useMemo, useState } from "react";

import type { LocalizedTree, LocalizedValue, UiConfig, UiHomeSectionId } from "../lib/ui-config";

type AdminEditorProps = {
  initialConfig: UiConfig;
  adminName: string;
};

type TabKey =
  | "brand-theme"
  | "navigation"
  | "home"
  | "portfolio"
  | "add-gold"
  | "holding"
  | "progress"
  | "settings"
  | "ads";

type TreeSectionKey =
  | "brand"
  | "nav"
  | "common"
  | "hero"
  | "home"
  | "portfolio"
  | "addGold"
  | "holding"
  | "progress"
  | "settings"
  | "auth"
  | "achievements"
  | "tags"
  | "categories";

type TabConfig = {
  key: TabKey;
  label: string;
  summary: string;
  hint: string;
  sections: TreeSectionKey[];
};

type StatusState = {
  tone: "success" | "warning" | "danger";
  message: string;
};

const TABS: TabConfig[] = [
  { key: "brand-theme", label: "Brand & Theme", summary: "Control visual identity, brand language, and accent tokens.", hint: "Brand line and theme tokens", sections: ["brand"] },
  { key: "navigation", label: "Navigation", summary: "Keep top-level wayfinding and auth entry labels concise.", hint: "Navigation and auth labels", sections: ["nav", "auth"] },
  { key: "home", label: "Home", summary: "Edit homepage copy, KPI wording, and home section order.", hint: "Hero, KPIs, and layout", sections: ["common", "hero", "home"] },
  { key: "portfolio", label: "Portfolio", summary: "Refine holdings list language, filters, and empty states.", hint: "List and filter wording", sections: ["portfolio"] },
  { key: "add-gold", label: "Add Gold", summary: "Shape the manual entry flow with clearer labels and validation copy.", hint: "Form copy and validation", sections: ["addGold", "tags", "categories"] },
  { key: "holding", label: "Holding", summary: "Tighten the detail-page wording around current worth and purchase basis.", hint: "Holding detail sections", sections: ["holding"] },
  { key: "progress", label: "Progress", summary: "Adjust tier and achievement language without changing the rules.", hint: "Tiers and achievements", sections: ["progress", "achievements"] },
  { key: "settings", label: "Settings", summary: "Manage defaults, disclaimers, privacy wording, and freshness labels.", hint: "Preferences and disclaimers", sections: ["settings"] },
  { key: "ads", label: "Ads", summary: "Control the approved ad placements and their clearly labeled copy.", hint: "Allowed ad slots only", sections: [] }
];

const SECTION_HELP: Record<TreeSectionKey, string> = {
  brand: "Use stable brand language that reads cleanly in English and Arabic.",
  nav: "Short labels scan better in desktop nav and mobile tabs.",
  common: "These labels appear in multiple screens. Keep them reusable.",
  hero: "This is the highest-visibility copy on the product.",
  home: "These strings shape the default landing and dashboard experience.",
  portfolio: "Support scanning, sorting, and empty-state clarity.",
  addGold: "Keep the flow encouraging and lightweight. Avoid punitive wording.",
  holding: "Explain one holding clearly without extra clutter.",
  progress: "Progress language should feel calm, not gamey.",
  settings: "Use factual, trust-building language for settings and disclosures.",
  auth: "Keep auth labels familiar and predictable.",
  achievements: "Achievement names should feel rewarding without hype.",
  tags: "Tags help organization and search. Keep them familiar.",
  categories: "Category labels should stay plain and obvious."
};

const HOME_SECTION_LABELS: Record<UiHomeSectionId, string> = {
  chart: "Chart",
  market: "Market strip",
  recentHoldings: "Recent holdings",
  achievements: "Achievements"
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isLocalizedValue(value: unknown): value is LocalizedValue {
  return isObject(value) && typeof value.en === "string" && typeof value.ar === "string";
}

function isLocalizedTreeNode(value: unknown): value is LocalizedTree {
  return isObject(value) && !isLocalizedValue(value);
}

function humanize(value: string) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function setNestedValue(target: unknown, path: string[], value: unknown): unknown {
  if (!path.length) {
    return value;
  }

  const [head, ...tail] = path;
  const container = isObject(target) ? { ...target } : {};
  container[head] = setNestedValue(container[head], tail, value);
  return container;
}

function shouldUseTextarea(key: string, value: LocalizedValue) {
  return value.en.length > 72 || value.ar.length > 72 || /copy|subtitle|intro|warning|notes/i.test(key);
}

function countLocalizedFields(tree: LocalizedTree): number {
  return Object.values(tree).reduce((total, value) => {
    if (isLocalizedValue(value)) {
      return total + 1;
    }

    if (isLocalizedTreeNode(value)) {
      return total + countLocalizedFields(value);
    }

    return total;
  }, 0);
}

function formatSavedTime(timestamp: number | null) {
  if (!timestamp) {
    return "No live save yet";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(timestamp));
}

function LocalizedTreeEditor({
  tree,
  path,
  onChange
}: {
  tree: LocalizedTree;
  path: string[];
  onChange: (path: string[], localeKey: "en" | "ar", value: string) => void;
}) {
  return (
    <div className="admin-tree">
      {Object.entries(tree).map(([key, value]) => {
        const fieldPath = [...path, key];
        if (isLocalizedValue(value)) {
          const useTextarea = shouldUseTextarea(key, value);
          return (
            <section key={fieldPath.join(".")} className="admin-fieldset">
              <div className="admin-fieldset__header">
                <div>
                  <p className="eyebrow">{humanize(key)}</p>
                  <h3 className="panel-title">{humanize(key)}</h3>
                </div>
                <span className="panel-chip panel-chip--muted">{useTextarea ? "Long copy" : "Short label"}</span>
              </div>
              <p className="muted admin-locale-caption">Edit English and Arabic side by side.</p>
              <div className="admin-locale-grid">
                {(["en", "ar"] as const).map((localeKey) => (
                  <label key={localeKey} className="field">
                    <span>{localeKey.toUpperCase()}</span>
                    {useTextarea ? (
                      <textarea value={value[localeKey]} onChange={(event) => onChange(fieldPath, localeKey, event.target.value)} maxLength={600} />
                    ) : (
                      <input value={value[localeKey]} onChange={(event) => onChange(fieldPath, localeKey, event.target.value)} maxLength={240} />
                    )}
                  </label>
                ))}
              </div>
            </section>
          );
        }

        if (!isLocalizedTreeNode(value)) {
          return null;
        }

        return (
          <section key={fieldPath.join(".")} className="admin-group-card">
            <div className="section-heading">
              <div>
                <p className="eyebrow">{humanize(key)}</p>
                <h3 className="panel-title">{humanize(key)}</h3>
              </div>
            </div>
            <LocalizedTreeEditor tree={value} path={fieldPath} onChange={onChange} />
          </section>
        );
      })}
    </div>
  );
}

export function AdminEditor({ initialConfig, adminName }: AdminEditorProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("brand-theme");
  const [config, setConfig] = useState<UiConfig>(initialConfig);
  const [savedConfig, setSavedConfig] = useState<UiConfig>(initialConfig);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<StatusState | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);

  const activeTabConfig = useMemo(() => TABS.find((tab) => tab.key === activeTab) ?? TABS[0], [activeTab]);
  const isDirty = useMemo(() => JSON.stringify(config) !== JSON.stringify(savedConfig), [config, savedConfig]);
  const brandTagline = config.brand.brandTagline as LocalizedValue;

  const activeFieldCount = useMemo(() => {
    if (activeTab === "brand-theme") {
      return countLocalizedFields(config.brand) + 4;
    }

    if (activeTab === "home") {
      return activeTabConfig.sections.reduce((total, section) => total + countLocalizedFields(config[section]), 0) + config.homeLayout.sectionOrder.length;
    }

    if (activeTab === "ads") {
      return 7;
    }

    return activeTabConfig.sections.reduce((total, section) => total + countLocalizedFields(config[section]), 0);
  }, [activeTab, activeTabConfig.sections, config]);

  const saveToneClass = status?.tone === "danger" ? "panel-chip--danger" : isDirty ? "panel-chip--warning" : "panel-chip--success";
  const saveMessage = status?.message ?? (isDirty ? "Unsaved changes" : lastSavedAt ? `Saved ${formatSavedTime(lastSavedAt)}` : "All changes saved");

  function applyConfig(updater: (current: UiConfig) => UiConfig) {
    setConfig((current) => updater(current));
    setStatus(null);
  }

  function updateLocalizedField(path: string[], localeKey: "en" | "ar", value: string) {
    applyConfig((current) => setNestedValue(current, [...path, localeKey], value) as UiConfig);
  }

  function updateThemeField(key: keyof UiConfig["theme"], value: string) {
    applyConfig((current) => ({ ...current, theme: { ...current.theme, [key]: value } }));
  }

  function toggleHomeSection(section: UiHomeSectionId) {
    applyConfig((current) => ({
      ...current,
      homeLayout: {
        ...current.homeLayout,
        sectionVisibility: {
          ...current.homeLayout.sectionVisibility,
          [section]: !current.homeLayout.sectionVisibility[section]
        }
      }
    }));
  }

  function moveHomeSection(section: UiHomeSectionId, direction: -1 | 1) {
    applyConfig((current) => {
      const nextOrder = [...current.homeLayout.sectionOrder];
      const index = nextOrder.indexOf(section);
      const swapIndex = index + direction;
      if (index < 0 || swapIndex < 0 || swapIndex >= nextOrder.length) {
        return current;
      }

      [nextOrder[index], nextOrder[swapIndex]] = [nextOrder[swapIndex], nextOrder[index]];
      return { ...current, homeLayout: { ...current.homeLayout, sectionOrder: nextOrder } };
    });
  }

  function updateAdToggle(slot: "home" | "portfolio" | "settings", value: boolean) {
    applyConfig((current) => ({ ...current, ads: { ...current.ads, [slot]: { ...current.ads[slot], enabled: value } } }));
  }

  function updateAdText(slot: "label" | "home" | "portfolio" | "settings", path: string[], localeKey: "en" | "ar", value: string) {
    if (slot === "label") {
      applyConfig((current) => ({ ...current, ads: { ...current.ads, label: { ...current.ads.label, [localeKey]: value } } }));
      return;
    }

    applyConfig((current) => setNestedValue(current, ["ads", slot, ...path, localeKey], value) as UiConfig);
  }

  function discardChanges() {
    setConfig(savedConfig);
    setStatus({ tone: "warning", message: "Changes discarded." });
  }

  async function saveConfig() {
    if (!isDirty) {
      return;
    }

    setIsSaving(true);
    setStatus(null);

    try {
      const response = await fetch("/api/admin/ui-config", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(config)
      });

      const payload = (await response.json()) as { config?: UiConfig; error?: { message?: string } };
      if (!response.ok) {
        throw new Error(payload.error?.message ?? "Unable to save admin config.");
      }

      const nextConfig = payload.config ?? config;
      setConfig(nextConfig);
      setSavedConfig(nextConfig);
      setLastSavedAt(Date.now());
      setStatus({ tone: "success", message: "Changes published live." });
    } catch (error) {
      setStatus({ tone: "danger", message: error instanceof Error ? error.message : "Unable to save admin config." });
    } finally {
      setIsSaving(false);
    }
  }

  function renderTreeSection(sectionKey: TreeSectionKey) {
    return (
      <section key={sectionKey} className="admin-section-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{humanize(sectionKey)}</p>
            <h3 className="panel-title">{humanize(sectionKey)}</h3>
            <p className="muted admin-section-copy">{SECTION_HELP[sectionKey]}</p>
          </div>
          <span className="panel-chip panel-chip--muted">{countLocalizedFields(config[sectionKey])} fields</span>
        </div>
        <LocalizedTreeEditor tree={config[sectionKey]} path={[sectionKey]} onChange={updateLocalizedField} />
      </section>
    );
  }

  function renderPreviewCard() {
    if (activeTab === "brand-theme") {
      return (
        <section className="admin-preview-card">
          <p className="eyebrow">Preview</p>
          <h3 className="panel-title">Theme preview</h3>
          <div className="admin-theme-preview" style={{ "--preview-accent": config.theme.accentColor, "--preview-start": config.theme.heroGradientStart, "--preview-end": config.theme.heroGradientEnd } as CSSProperties}>
            <div className="admin-theme-preview__hero">
              <span className="panel-chip">Hero</span>
              <strong>{brandTagline.en}</strong>
            </div>
            <div className="admin-swatch-list">
              {([["Accent", config.theme.accentColor], ["Soft", config.theme.softAccentColor], ["Start", config.theme.heroGradientStart], ["End", config.theme.heroGradientEnd]] as const).map(([label, value]) => (
                <div key={label} className="admin-swatch">
                  <span className="admin-swatch__dot" style={{ backgroundColor: value }} />
                  <div>
                    <strong>{label}</strong>
                    <span>{value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }

    if (activeTab === "home") {
      return (
        <section className="admin-preview-card">
          <p className="eyebrow">Preview</p>
          <h3 className="panel-title">Home section order</h3>
          <div className="admin-layout-preview">
            {config.homeLayout.sectionOrder.map((section) => (
              <div key={section} className={`admin-layout-preview__item ${config.homeLayout.sectionVisibility[section] ? "" : "admin-layout-preview__item--muted"}`}>
                <strong>{HOME_SECTION_LABELS[section]}</strong>
                <span>{config.homeLayout.sectionVisibility[section] ? "Visible" : "Hidden"}</span>
              </div>
            ))}
          </div>
        </section>
      );
    }

    if (activeTab === "ads") {
      return (
        <section className="admin-preview-card">
          <p className="eyebrow">Preview</p>
          <h3 className="panel-title">Placement policy</h3>
          <div className="admin-layout-preview">
            {(["home", "portfolio", "settings"] as const).map((slot) => (
              <div key={slot} className={`admin-layout-preview__item ${config.ads[slot].enabled ? "" : "admin-layout-preview__item--muted"}`}>
                <strong>{humanize(slot)}</strong>
                <span>{config.ads[slot].enabled ? "Enabled" : "Disabled"}</span>
              </div>
            ))}
          </div>
        </section>
      );
    }

    return (
      <section className="admin-preview-card">
        <p className="eyebrow">Guidance</p>
        <h3 className="panel-title">Editing standard</h3>
        <div className="admin-note-list">
          <div className="admin-note-item"><strong>Keep labels short</strong><span>Navigation and settings labels should stay compact.</span></div>
          <div className="admin-note-item"><strong>Lead with clarity</strong><span>Use plain language first, then supporting tone.</span></div>
          <div className="admin-note-item"><strong>Save deliberately</strong><span>All changes publish live after a successful save.</span></div>
        </div>
      </section>
    );
  }

  return (
    <div className="admin-shell">
      <aside className="content-card admin-sidebar">
        <div className="admin-sidebar__meta">
          <p className="eyebrow">Admin</p>
          <h2 className="section-title">UI editor</h2>
          <p className="muted">Signed in as {adminName}. This workspace updates the live customer-facing UI.</p>
          <span className={`panel-chip ${saveToneClass}`}>{saveMessage}</span>
        </div>

        <div className="admin-overview-grid">
          <article className="admin-overview-card"><span>Current section</span><strong>{activeTabConfig.label}</strong><p>{activeTabConfig.hint}</p></article>
          <article className="admin-overview-card"><span>Editable fields</span><strong>{activeFieldCount}</strong><p>English and Arabic stay paired.</p></article>
          <article className="admin-overview-card"><span>Last saved</span><strong>{formatSavedTime(lastSavedAt)}</strong><p>Changes publish immediately after save.</p></article>
        </div>

        <nav className="admin-tab-list" aria-label="Admin sections">
          {TABS.map((tab) => (
            <button key={tab.key} type="button" className={`admin-tab ${activeTab === tab.key ? "admin-tab--active" : ""}`} onClick={() => setActiveTab(tab.key)}>
              <span className="admin-tab__label">{tab.label}</span>
              <span className="admin-tab__meta">{tab.hint}</span>
            </button>
          ))}
        </nav>

        {renderPreviewCard()}
      </aside>

      <section className="content-card admin-panel">
        <div className="admin-panel__hero">
          <div>
            <p className="eyebrow">Currently editing</p>
            <h2 className="section-title">{activeTabConfig.label}</h2>
            <p className="muted admin-section-copy">{activeTabConfig.summary}</p>
          </div>
          <span className={`panel-chip ${saveToneClass}`}>{saveMessage}</span>
        </div>

        <div className="admin-summary-grid">
          <article className="admin-summary-card"><span>Workflow</span><strong>Contextual save</strong><p>Review several changes, then publish them together.</p></article>
          <article className="admin-summary-card"><span>Live impact</span><strong>Customer-facing UI</strong><p>Copy and theme changes update the shipped web experience.</p></article>
          <article className="admin-summary-card"><span>Guardrail</span><strong>Structured editing</strong><p>No arbitrary HTML or CSS injection through this workspace.</p></article>
        </div>

        {activeTab === "brand-theme" ? (
          <div className="stack">
            <section className="admin-section-card">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Theme tokens</p>
                  <h3 className="panel-title">Theme tokens</h3>
                  <p className="muted admin-section-copy">Use stable, high-contrast colors that hold up across the whole product.</p>
                </div>
                <span className="panel-chip panel-chip--muted">4 tokens</span>
              </div>
              <div className="admin-color-grid">
                {([["accentColor", "Accent color"], ["softAccentColor", "Soft accent"], ["heroGradientStart", "Hero gradient start"], ["heroGradientEnd", "Hero gradient end"]] as const).map(([key, label]) => (
                  <label key={key} className="field">
                    <span>{label}</span>
                    <div className="color-input-row">
                      <input type="color" value={config.theme[key]} onChange={(event) => updateThemeField(key, event.target.value)} />
                      <input value={config.theme[key]} onChange={(event) => updateThemeField(key, event.target.value)} maxLength={7} />
                    </div>
                  </label>
                ))}
              </div>
            </section>
            {renderTreeSection("brand")}
          </div>
        ) : null}

        {activeTab === "home" ? (
          <div className="stack">
            <section className="admin-section-card">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Home layout</p>
                  <h3 className="panel-title">Home layout</h3>
                  <p className="muted admin-section-copy">Reorder the approved sections and hide only the ones you do not want on the live page.</p>
                </div>
                <span className="panel-chip panel-chip--muted">{config.homeLayout.sectionOrder.length} sections</span>
              </div>
              <div className="admin-layout-list">
                {config.homeLayout.sectionOrder.map((section, index) => (
                  <div key={section} className="item-card item-card--row">
                    <div className="row-main">
                      <strong>{HOME_SECTION_LABELS[section]}</strong>
                      <label className="toggle-row">
                        <span>Visible</span>
                        <input type="checkbox" checked={config.homeLayout.sectionVisibility[section]} onChange={() => toggleHomeSection(section)} />
                      </label>
                    </div>
                    <div className="button-row">
                      <button type="button" className="button button--ghost button--compact" onClick={() => moveHomeSection(section, -1)} disabled={index === 0}>Up</button>
                      <button type="button" className="button button--ghost button--compact" onClick={() => moveHomeSection(section, 1)} disabled={index === config.homeLayout.sectionOrder.length - 1}>Down</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
            {activeTabConfig.sections.map(renderTreeSection)}
          </div>
        ) : null}

        {activeTab !== "brand-theme" && activeTab !== "home" && activeTab !== "ads" ? <div className="stack">{activeTabConfig.sections.map(renderTreeSection)}</div> : null}

        {activeTab === "ads" ? (
          <div className="stack">
            <section className="admin-section-card">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Ad label</p>
                  <h3 className="panel-title">Ad label</h3>
                  <p className="muted admin-section-copy">This label must always remain obvious and must never look like navigation.</p>
                </div>
                <span className="panel-chip panel-chip--muted">Required</span>
              </div>
              <div className="admin-locale-grid">
                {(["en", "ar"] as const).map((localeKey) => (
                  <label key={localeKey} className="field">
                    <span>{localeKey.toUpperCase()}</span>
                    <input value={config.ads.label[localeKey]} onChange={(event) => updateAdText("label", [], localeKey, event.target.value)} />
                  </label>
                ))}
              </div>
            </section>

            {(["home", "portfolio", "settings"] as const).map((slot) => (
              <section key={slot} className="admin-section-card">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">{humanize(slot)}</p>
                    <h3 className="panel-title">{humanize(slot)} placement</h3>
                    <p className="muted admin-section-copy">These are the only approved ad slots. Keep the copy clearly marked and low-distraction.</p>
                  </div>
                  <label className="toggle-row">
                    <span>Enabled</span>
                    <input type="checkbox" checked={config.ads[slot].enabled} onChange={(event) => updateAdToggle(slot, event.target.checked)} />
                  </label>
                </div>
                {(["title", "copy"] as const).map((fieldKey) => (
                  <div key={fieldKey} className="admin-locale-grid">
                    {(["en", "ar"] as const).map((localeKey) => (
                      <label key={localeKey} className="field">
                        <span>{`${humanize(fieldKey)} ${localeKey.toUpperCase()}`}</span>
                        {fieldKey === "copy" ? (
                          <textarea value={config.ads[slot][fieldKey][localeKey]} onChange={(event) => updateAdText(slot, [fieldKey], localeKey, event.target.value)} />
                        ) : (
                          <input value={config.ads[slot][fieldKey][localeKey]} onChange={(event) => updateAdText(slot, [fieldKey], localeKey, event.target.value)} />
                        )}
                      </label>
                    ))}
                  </div>
                ))}
              </section>
            ))}
          </div>
        ) : null}

        <div className={`admin-savebar ${isDirty ? "admin-savebar--active" : ""}`}>
          <div className="admin-savebar__meta">
            <strong>{isDirty ? "Unsaved changes" : "Everything is up to date"}</strong>
            <span>{isDirty ? "Review your edits, then publish or discard them." : "Changes publish immediately after a successful save."}</span>
          </div>
          <div className="button-row">
            <button type="button" className="button button--ghost" onClick={discardChanges} disabled={!isDirty || isSaving}>Discard</button>
            <button type="button" className="button" onClick={() => void saveConfig()} disabled={!isDirty || isSaving}>{isSaving ? "Saving..." : "Save live"}</button>
          </div>
        </div>
      </section>
    </div>
  );
}
