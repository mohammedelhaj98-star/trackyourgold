import { createArticleAction, createContentPageAction, updateAdSlotAction, updateSettingAction } from "@/server/actions/admin";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";

export function SettingEditor() {
  return (
    <Panel>
      <h3 className="font-display text-2xl font-semibold text-white">Update setting</h3>
      <form action={updateSettingAction} className="mt-5 grid gap-4 md:grid-cols-2">
        <input name="key" placeholder="premium.enabled" className="rounded-3xl border border-white/12 bg-white/5 px-4 py-3 text-white" />
        <input name="groupName" placeholder="premium" className="rounded-3xl border border-white/12 bg-white/5 px-4 py-3 text-white" />
        <input name="valueType" placeholder="boolean" className="rounded-3xl border border-white/12 bg-white/5 px-4 py-3 text-white" />
        <textarea name="value" placeholder="true" className="min-h-28 rounded-[24px] border border-white/12 bg-white/5 px-4 py-3 text-white md:col-span-2" />
        <textarea name="description" placeholder="Setting description" className="min-h-28 rounded-[24px] border border-white/12 bg-white/5 px-4 py-3 text-white md:col-span-2" />
        <Button type="submit" className="md:col-span-2 md:w-fit">Save setting</Button>
      </form>
    </Panel>
  );
}

export function ArticleEditor() {
  return (
    <Panel>
      <h3 className="font-display text-2xl font-semibold text-white">Create article</h3>
      <form action={createArticleAction} className="mt-5 grid gap-4 md:grid-cols-2">
        <input name="title" placeholder="Article title" className="rounded-3xl border border-white/12 bg-white/5 px-4 py-3 text-white md:col-span-2" />
        <input name="slug" placeholder="article-slug" className="rounded-3xl border border-white/12 bg-white/5 px-4 py-3 text-white" />
        <input name="category" placeholder="Analysis" className="rounded-3xl border border-white/12 bg-white/5 px-4 py-3 text-white" />
        <textarea name="excerpt" placeholder="Excerpt" className="min-h-28 rounded-[24px] border border-white/12 bg-white/5 px-4 py-3 text-white md:col-span-2" />
        <textarea name="body" placeholder="Body" className="min-h-40 rounded-[24px] border border-white/12 bg-white/5 px-4 py-3 text-white md:col-span-2" />
        <input name="tags" placeholder="tag1, tag2" className="rounded-3xl border border-white/12 bg-white/5 px-4 py-3 text-white" />
        <select name="status" className="rounded-3xl border border-white/12 bg-white/5 px-4 py-3 text-white">
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="SCHEDULED">Scheduled</option>
        </select>
        <input name="publishedAt" type="datetime-local" className="rounded-3xl border border-white/12 bg-white/5 px-4 py-3 text-white md:col-span-2" />
        <Button type="submit" className="md:col-span-2 md:w-fit">Create article</Button>
      </form>
    </Panel>
  );
}

export function ContentPageEditor() {
  return (
    <Panel>
      <h3 className="font-display text-2xl font-semibold text-white">Create content page</h3>
      <form action={createContentPageAction} className="mt-5 grid gap-4 md:grid-cols-2">
        <select name="type" className="rounded-3xl border border-white/12 bg-white/5 px-4 py-3 text-white">
          <option value="LANDING">Landing</option>
          <option value="GUIDE">Guide</option>
          <option value="MARKET_ANALYSIS">Market analysis</option>
          <option value="CALCULATOR">Calculator</option>
          <option value="KARAT">Karat</option>
        </select>
        <select name="status" className="rounded-3xl border border-white/12 bg-white/5 px-4 py-3 text-white">
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="SCHEDULED">Scheduled</option>
        </select>
        <input name="slug" placeholder="content-slug" className="rounded-3xl border border-white/12 bg-white/5 px-4 py-3 text-white md:col-span-2" />
        <input name="title" placeholder="Title" className="rounded-3xl border border-white/12 bg-white/5 px-4 py-3 text-white md:col-span-2" />
        <input name="localeKey" placeholder="qa-en" className="rounded-3xl border border-white/12 bg-white/5 px-4 py-3 text-white" />
        <input name="heroMetricLabel" placeholder="Hero metric label" className="rounded-3xl border border-white/12 bg-white/5 px-4 py-3 text-white" />
        <textarea name="summary" placeholder="Summary" className="min-h-28 rounded-[24px] border border-white/12 bg-white/5 px-4 py-3 text-white md:col-span-2" />
        <textarea name="intro" placeholder="Intro" className="min-h-28 rounded-[24px] border border-white/12 bg-white/5 px-4 py-3 text-white md:col-span-2" />
        <textarea name="body" placeholder="Body" className="min-h-40 rounded-[24px] border border-white/12 bg-white/5 px-4 py-3 text-white md:col-span-2" />
        <input name="publishAt" type="datetime-local" className="rounded-3xl border border-white/12 bg-white/5 px-4 py-3 text-white md:col-span-2" />
        <Button type="submit" className="md:col-span-2 md:w-fit">Create content page</Button>
      </form>
    </Panel>
  );
}

export function AdSlotEditor({ slot }: { slot: { id: string; name: string; locationPath: string | null; provider: string | null; adsenseClient: string | null; adsenseSlot: string | null; customCode: string | null; placeholderMode: boolean; isEnabled: boolean; placeholderTitle: string | null; placeholderDescription: string | null; adminNotes: string | null; } }) {
  return (
    <Panel>
      <h3 className="font-display text-2xl font-semibold text-white">{slot.name}</h3>
      <form action={updateAdSlotAction} className="mt-5 grid gap-4 md:grid-cols-2">
        <input type="hidden" name="id" value={slot.id} />
        <input name="name" defaultValue={slot.name} className="rounded-3xl border border-white/12 bg-white/5 px-4 py-3 text-white" />
        <input name="locationPath" defaultValue={slot.locationPath ?? ""} className="rounded-3xl border border-white/12 bg-white/5 px-4 py-3 text-white" />
        <select name="isEnabled" defaultValue={String(slot.isEnabled)} className="rounded-3xl border border-white/12 bg-white/5 px-4 py-3 text-white">
          <option value="true">Enabled</option>
          <option value="false">Disabled</option>
        </select>
        <select name="placeholderMode" defaultValue={String(slot.placeholderMode)} className="rounded-3xl border border-white/12 bg-white/5 px-4 py-3 text-white">
          <option value="true">Placeholder mode</option>
          <option value="false">Custom code live</option>
        </select>
        <input name="provider" defaultValue={slot.provider ?? ""} placeholder="adsense" className="rounded-3xl border border-white/12 bg-white/5 px-4 py-3 text-white" />
        <input name="adsenseClient" defaultValue={slot.adsenseClient ?? ""} placeholder="ca-pub-..." className="rounded-3xl border border-white/12 bg-white/5 px-4 py-3 text-white" />
        <input name="adsenseSlot" defaultValue={slot.adsenseSlot ?? ""} placeholder="123456789" className="rounded-3xl border border-white/12 bg-white/5 px-4 py-3 text-white" />
        <input name="placeholderTitle" defaultValue={slot.placeholderTitle ?? ""} className="rounded-3xl border border-white/12 bg-white/5 px-4 py-3 text-white" />
        <textarea name="placeholderDescription" defaultValue={slot.placeholderDescription ?? ""} className="min-h-28 rounded-[24px] border border-white/12 bg-white/5 px-4 py-3 text-white md:col-span-2" />
        <textarea name="customCode" defaultValue={slot.customCode ?? ""} className="min-h-32 rounded-[24px] border border-white/12 bg-white/5 px-4 py-3 font-mono text-sm text-white md:col-span-2" />
        <textarea name="adminNotes" defaultValue={slot.adminNotes ?? ""} className="min-h-28 rounded-[24px] border border-white/12 bg-white/5 px-4 py-3 text-white md:col-span-2" />
        <Button type="submit" className="md:col-span-2 md:w-fit">Update ad slot</Button>
      </form>
    </Panel>
  );
}
