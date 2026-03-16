"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

export function SocialShareButtons({ title, path }: { title: string; path: string }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window === "undefined" ? path : new URL(path, window.location.origin).toString();

  async function onCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Button href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`} variant="secondary">
        Share on X
      </Button>
      <Button href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} variant="secondary">
        Share on Facebook
      </Button>
      <Button type="button" variant="ghost" onClick={onCopy} className="border border-white/10">
        {copied ? "Copied" : "Copy link"}
      </Button>
    </div>
  );
}
