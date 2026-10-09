"use client";

import { useEffect } from "react";

/**
 * Runs `open` once on mount when the URL has `?new=1` (set by the dashboard's
 * quick-action links, e.g. /admin/events?new=1). Reads window.location directly
 * instead of useSearchParams so static pages need no Suspense boundary.
 */
export function useOpenOnNewParam(open: () => void) {
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("new")) open();
    // Mount-only on purpose.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
