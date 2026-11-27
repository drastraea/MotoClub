"use client";

import { useEffect } from "react";

// Next's <Link> does nothing when the URL already ends in the clicked #section,
// so a second click on e.g. "All upcoming events" would not scroll. This handles
// that repeat click for every in-page link on the site.
export function HashScroll() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as Element).closest?.<HTMLAnchorElement>('a[href*="#"]');
      if (!link || link.target === "_blank") return;
      const url = new URL(link.href);
      if (url.origin !== location.origin || url.pathname !== location.pathname) return;
      if (!url.hash || url.hash !== location.hash) return; // a new hash already scrolls
      document.getElementById(decodeURIComponent(url.hash.slice(1)))?.scrollIntoView();
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  return null;
}
