"use client";

import { useActionState } from "react";

import { subscribeLeadAction } from "@/server/actions/leads";
import { Button } from "@/components/ui/button";

const initialState = { ok: false, message: "" };

export function LeadCaptureForm({ sourcePage, countrySlug = "qatar", compact = false }: { sourcePage: string; countrySlug?: string; compact?: boolean }) {
  const [state, formAction, pending] = useActionState(subscribeLeadAction, initialState);

  return (
    <form action={formAction} className={compact ? "flex flex-col gap-3 md:flex-row" : "space-y-4"}>
      <input type="hidden" name="sourcePage" value={sourcePage} />
      <input type="hidden" name="countrySlug" value={countrySlug} />
      <input
        type="email"
        name="email"
        required
        placeholder="Enter email for price drop alerts"
        className="min-h-12 flex-1 rounded-full border border-white/12 bg-white/5 px-5 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-gold-300/50"
      />
      <Button type="submit" disabled={pending} className="min-h-12">
        {pending ? "Joining..." : "Get alerts"}
      </Button>
      {state.message ? <p className="text-sm text-white/70">{state.message}</p> : null}
    </form>
  );
}
