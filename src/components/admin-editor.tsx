"use client";

import { useMemo, useState } from "react";

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

const TABS: Array<{ key: TabKey; label: string; sections: TreeSectionKey[] }> = [
  { key: "brand-theme", label: "Brand & Theme", sections: ["brand"] },
  { key: "navigation", label: "Navigation", sections: ["nav", "auth"] },
  { key: "home", label: "Home", sections: ["common", "hero", "home"] },
  { key: "portfolio", label: "Portfolio", sections: ["portfolio"] },
  { key: "add-gold", label: "Add Gold", sections: ["addGold", "tags", "categories"] },
  { key: "holding", label: "Holding", sections: ["holding"] },
  { key: "progress", label: "Progress", sections: ["progress", "achievements"] },
  { key: "settings", label: "Settings", sections: ["settings"] },
  { key: "ads", label: "Ads", sections: [] }
];

const HOME_SECTION_LABELS: Record<UiHomeSectionId, string> = {
  chart: "Chart",
  market: "Market Strip",
  recentHoldings: "Recent Holdings",
  achievements: "Achievements"
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isLocalizedValue(value: unknown): value is LocalizedValue {
  return isObject(value) && typeof value.en === "string" && typeof value.ar === "string";
}

function humanize(value: string) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function isLocalizedTreeNode(value: unknown): value is LocalizedTree {
  return isObject(value) && !isLocalizedValue(value);
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
              <div className="section-heading">
                <div>
                  <p className="eyebrow">{humanize(key)}</p>
                  <h3 className="panel-title">{humanize(key)}</h3>
                </div>
              </div>
              <div className="admin-locale-grid">
                {(["en", "ar"] as const).map((localeKey) => (
                  <label key={localeKey} className="field">
                    <span>{localeKey.toUpperCase()}</span>
                    {useTextarea ? (
                      <textarea
                        value={value[localeKey]}
                        onChange={(event) => onChange(fieldPath, localeKey, event.target.value)}
                        maxLength={600}
                      />
                    ) : (
                      <input
                        value={value[localeKey]}
                        onChange={(event) => onChange(fieldPath, localeKey, event.target.value)}
                        maxLength={240}
                      />
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
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const activeTabConfig = useMemo(() => TABS.find((tab) => tab.key === activeTab) ?? TABS[0], [activeTab]);

  function updateLocalizedField(path: string[], localeKey: "en" | "ar", value: string) {
    setConfig((current) => setNestedValue(current, [...path, localeKey], value) as UiConfig);
  }

  function updateThemeField(key: keyof UiConfig["theme"], value: string) {
    setConfig((current) => ({
      ...current,
      theme: {
        ...current.theme,
        [key]: value
      }
    }));
  }

  function toggleHomeSection(section: UiHomeSectionId) {
    setConfig((current) => ({
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
    setConfig((current) => {
      const nextOrder = [...current.homeLayout.sectionOrder];
      const index = nextOrder.indexOf(section);
      const swapIndex = index + direction;
      if (index < 0 || swapIndex < 0 || swapIndex >= nextOrder.length) {
        return current;
      }

      [nextOrder[index], nextOrder[swapIndex]] = [nextOrder[swapIndex], nextOrder[index]];

      return {
        ...current,
        homeLayout: {
          ...current.homeLayout,
          sectionOrder: nextOrder
        }
      };
    });
  }

  function updateAdToggle(slot: "home" | "portfolio" | "settings", value: boolean) {
    setConfig((current) => ({
      ...current,
      ads: {
        ...current.ads,
        [slot]: {
          ...current.ads[slot],
          enabled: value
        }
      }
    }));
  }

  function updateAdText(slot: "label" | "home" | "portfolio" | "settings", path: string[], localeKey: "en" | "ar", value: string) {
    if (slot === "label") {
      setConfig((current) => ({
        ...current,
        ads: {
          ...current.ads,
          label: {
            ...current.ads.label,
            [localeKey]: value
          }
        }
      }));
      return;
    }

    setConfig((current) => setNestedValue(current, ["ads", slot, ...path, localeKey], value) as UiConfig);
  }

  async function saveConfig() {
    setIsSaving(true);
    setStatus(null);

    try {
      const response = await fetch("/api/admin/ui-config", {
        method: "PUT",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify(config)
      });

      const payload = (await response.json()) as { config?: UiConfig; error?: { message?: string } };
      if (!response.ok) {
        throw new Error(payload.error?.message ?? "Unable to save admin config.");
      }

      if (payload.config) {
        setConfig(payload.config);
      }
      setStatus("Saved live");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to save admin config.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="admin-shell">
      <aside className="content-card admin-sidebar">
        <div className="stack">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Admin</p>
              <h1 className="section-title">UI Editor</h1>
            </div>
          </div>
          <p className="muted">Signed in as {adminName}. Changes publish live.</p>
        </div>

        <nav className="admin-tab-list" aria-label="Admin sections">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`admin-tab ${activeTab === tab.key ? "admin-tab--active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      <section className="content-card admin-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Editing</p>
            <h2 className="section-title">{activeTabConfig.label}</h2>
          </div>
          <div className="button-row">
            {status ? <span className="panel-chip panel-chip--muted">{status}</span> : null}
            <button type="button" className="button" onClick={() => void saveConfig()} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save live"}
            </button>
          </div>
        </div>

        {activeTab === "brand-theme" ? (
          <div className="stack">
            <section className="admin-group-card">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Theme</p>
                  <h3 className="panel-title">Theme</h3>
                </div>
              </div>
              <div className="admin-color-grid">
                {([
                  ["accentColor", "Accent Color"],
                  ["softAccentColor", "Soft Accent"],
                  ["heroGradientStart", "Hero Gradient Start"],
                  ["heroGradientEnd", "Hero Gradient End"]
                ] as const).map(([key, label]) => (
                  <label key={key} className="field">
                    <span>{label}</span>
                    <div className="color-input-row">
                      <input
                        type="color"
                        value={config.theme[key]}
                        onChange={(event) => updateThemeField(key, event.target.value)}
                      />
                      <input
                        value={config.theme[key]}
                        onChange={(event) => updateThemeField(key, event.target.value)}
                        maxLength={7}
                      />
                    </div>
                  </label>
                ))}
              </div>
            </section>

            <LocalizedTreeEditor tree={config.brand} path={["brand"]} onChange={updateLocalizedField} />
          </div>
        ) : null}

        {activeTab === "navigation" ? (
          <div className="stack">
            <LocalizedTreeEditor tree={config.nav} path={["nav"]} onChange={updateLocalizedField} />
            <LocalizedTreeEditor tree={config.auth} path={["auth"]} onChange={updateLocalizedField} />
          </div>
        ) : null}

        {activeTab === "home" ? (
          <div className="stack">
            <section className="admin-group-card">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Home Layout</p>
                  <h3 className="panel-title">Home Layout</h3>
                </div>
              </div>
              <div className="admin-layout-list">
                {config.homeLayout.sectionOrder.map((section, index) => (
                  <div key={section} className="item-card item-card--row">
                    <div className="row-main">
                      <strong>{HOME_SECTION_LABELS[section]}</strong>
                      <label className="toggle-row">
                        <span>Visible</span>
                        <input
                          type="checkbox"
                          checked={config.homeLayout.sectionVisibility[section]}
                          onChange={() => toggleHomeSection(section)}
                        />
                      </label>
                    </div>
                    <div className="button-row">
                      <button type="button" className="button button--ghost button--compact" onClick={() => moveHomeSection(section, -1)} disabled={index === 0}>
                        Up
                      </button>
                      <button
                        type="button"
                        className="button button--ghost button--compact"
                        onClick={() => moveHomeSection(section, 1)}
                        disabled={index === config.homeLayout.sectionOrder.length - 1}
                      >
                        Down
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <LocalizedTreeEditor tree={config.common} path={["common"]} onChange={updateLocalizedField} />
            <LocalizedTreeEditor tree={config.hero} path={["hero"]} onChange={updateLocalizedField} />
            <LocalizedTreeEditor tree={config.home} path={["home"]} onChange={updateLocalizedField} />
          </div>
        ) : null}

        {activeTab === "portfolio" ? (
          <LocalizedTreeEditor tree={config.portfolio} path={["portfolio"]} onChange={updateLocalizedField} />
        ) : null}

        {activeTab === "add-gold" ? (
          <div className="stack">
            <LocalizedTreeEditor tree={config.addGold} path={["addGold"]} onChange={updateLocalizedField} />
            <LocalizedTreeEditor tree={config.tags} path={["tags"]} onChange={updateLocalizedField} />
            <LocalizedTreeEditor tree={config.categories} path={["categories"]} onChange={updateLocalizedField} />
          </div>
        ) : null}

        {activeTab === "holding" ? (
          <LocalizedTreeEditor tree={config.holding} path={["holding"]} onChange={updateLocalizedField} />
        ) : null}

        {activeTab === "progress" ? (
          <div className="stack">
            <LocalizedTreeEditor tree={config.progress} path={["progress"]} onChange={updateLocalizedField} />
            <LocalizedTreeEditor tree={config.achievements} path={["achievements"]} onChange={updateLocalizedField} />
          </div>
        ) : null}

        {activeTab === "settings" ? (
          <LocalizedTreeEditor tree={config.settings} path={["settings"]} onChange={updateLocalizedField} />
        ) : null}

        {activeTab === "ads" ? (
          <div className="stack">
            <section className="admin-group-card">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Ad Label</p>
                  <h3 className="panel-title">Ad Label</h3>
                </div>
              </div>
              <div className="admin-locale-grid">
                {(["en", "ar"] as const).map((localeKey) => (
                  <label key={localeKey} className="field">
                    <span>{localeKey.toUpperCase()}</span>
                    <input
                      value={config.ads.label[localeKey]}
                      onChange={(event) => updateAdText("label", [], localeKey, event.target.value)}
                    />
                  </label>
                ))}
              </div>
            </section>

            {(["home", "portfolio", "settings"] as const).map((slot) => (
              <section key={slot} className="admin-group-card">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">{humanize(slot)}</p>
                    <h3 className="panel-title">{humanize(slot)} Ad</h3>
                  </div>
                  <label className="toggle-row">
                    <span>Enabled</span>
                    <input
                      type="checkbox"
                      checked={config.ads[slot].enabled}
                      onChange={(event) => updateAdToggle(slot, event.target.checked)}
                    />
                  </label>
                </div>
                {(["title", "copy"] as const).map((fieldKey) => (
                  <div key={fieldKey} className="admin-locale-grid">
                    {(["en", "ar"] as const).map((localeKey) => (
                      <label key={localeKey} className="field">
                        <span>{`${humanize(fieldKey)} ${localeKey.toUpperCase()}`}</span>
                        {fieldKey === "copy" ? (
                          <textarea
                            value={config.ads[slot][fieldKey][localeKey]}
                            onChange={(event) => updateAdText(slot, [fieldKey], localeKey, event.target.value)}
                          />
                        ) : (
                          <input
                            value={config.ads[slot][fieldKey][localeKey]}
                            onChange={(event) => updateAdText(slot, [fieldKey], localeKey, event.target.value)}
                          />
                        )}
                      </label>
                    ))}
                  </div>
                ))}
              </section>
            ))}
          </div>
        ) : null}

        <div className="notice notice--inline">
          <strong>Live publishing</strong>
          <span>This editor updates the live UI copy and theme for the current shipped screens.</span>
        </div>
      </section>
    </div>
  );
}
