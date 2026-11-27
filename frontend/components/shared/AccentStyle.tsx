"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useSiteContent } from "@/hooks/useSiteContent";
import { accentCss } from "@/lib/accent";

// The last known accent is cached in the browser so a returning visitor does not
// see the default colour flash before the saved one loads.
const KEY = "moto-club-accent";
let current: string | null = null;
const subs = new Set<() => void>();

const subscribe = (cb: () => void) => {
  subs.add(cb);
  return () => subs.delete(cb);
};

function read(): string {
  if (current === null) {
    try {
      current = localStorage.getItem(KEY) ?? "";
    } catch {
      current = "";
    }
  }
  return current;
}

/** Applies an accent colour right away; call after saving a new one. */
export function storeAccent(accent: string) {
  current = accent;
  try {
    localStorage.setItem(KEY, accent);
  } catch {
    // Private mode: the colour still applies, it just is not remembered.
  }
  subs.forEach((f) => f());
}

export function AccentStyle() {
  const { content, loading, error } = useSiteContent();

  useEffect(() => {
    if (!loading && !error) storeAccent(content.accent);
  }, [loading, error, content.accent]);

  const css = accentCss(useSyncExternalStore(subscribe, read, () => ""));
  return css ? <style>{css}</style> : null;
}
