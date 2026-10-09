"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Hero } from "@/components/shared/Hero";
import { TagTicker } from "@/components/shared/TagTicker";
import { AboutSection } from "@/components/shared/AboutSection";
import { ServicesGrid } from "@/components/shared/ServicesGrid";
import { BenefitsSection } from "@/components/shared/BenefitsSection";
import { ContactSection } from "@/components/shared/ContactSection";
import { JoinCta } from "@/components/shared/JoinCta";
import { SitePreviewProvider } from "@/components/shared/LoggedOutOnly";
import { SITE_SECTIONS, type SectionId } from "@/components/shared/site-sections";
import type { SiteContent } from "@/lib/site-content";
import { cn } from "@/lib/utils";

// Desktop layout is rendered at this width, then scaled down to fit the pane.
const DESKTOP_WIDTH = 1280;

function subscribeDesktop(cb: () => void) {
  const m = window.matchMedia("(min-width: 1024px)");
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
}

// Tailwind breakpoints follow the browser viewport, so below 1024px the sections
// can only render their mobile layout; above it we render desktop and scale it.
function useIsDesktop(): boolean {
  return useSyncExternalStore(
    subscribeDesktop,
    () => window.matchMedia("(min-width: 1024px)").matches,
    () => true
  );
}

/**
 * Live preview of the real landing sections, driven by the form's current values.
 * Each section is covered by a click target that selects it for editing; the
 * active one is outlined and scrolled into view.
 */
export function SiteContentPreview({
  content,
  active,
  onSelect,
}: {
  content: SiteContent;
  active: SectionId;
  onSelect: (id: SectionId) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Partial<Record<SectionId, HTMLDivElement | null>>>({});
  const [paneWidth, setPaneWidth] = useState(0);
  const desktop = useIsDesktop();

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setPaneWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Bring the active section into view when it changes, unless it already is.
  useEffect(() => {
    const pane = scrollRef.current;
    const el = sectionRefs.current[active];
    if (!pane || !el) return;
    const p = pane.getBoundingClientRect();
    const s = el.getBoundingClientRect();
    // The pane can extend below the window (it is sticky), so only the part
    // actually on screen counts as visible. 72px leaves room for the save bar.
    const top = Math.max(p.top, 0);
    const bottom = Math.min(p.bottom, window.innerHeight - 72);
    const visible = s.top >= top && s.top <= bottom - 96;
    if (visible) return;
    pane.scrollTo({ top: s.top - p.top + pane.scrollTop - 12, behavior: "smooth" });
  }, [active]);

  const zoom = desktop ? Math.min(1, (paneWidth || DESKTOP_WIDTH * 0.5) / DESKTOP_WIDTH) : 1;

  const frame = (id: SectionId, node: React.ReactNode) => {
    const label = SITE_SECTIONS.find((s) => s.id === id)?.label ?? id;
    const isActive = active === id;
    return (
      <div
        ref={(el) => {
          sectionRefs.current[id] = el;
        }}
        className="relative min-h-8"
      >
        {node}
        <button
          type="button"
          onClick={() => onSelect(id)}
          aria-label={`Edit ${label}`}
          aria-pressed={isActive}
          className={cn(
            "group absolute inset-0 z-20 cursor-pointer outline-none transition",
            isActive
              ? "bg-primary/5 ring-[6px] ring-primary ring-inset"
              : "hover:bg-primary/5 hover:ring-[6px] hover:ring-primary/50 hover:ring-inset focus-visible:ring-[6px] focus-visible:ring-primary/70 focus-visible:ring-inset"
          )}
        >
          {/* Counter-zoom so the label stays readable at any preview scale. */}
          <span
            style={{ zoom: 1 / zoom }}
            className={cn(
              "absolute top-3 left-3 rounded-md bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground shadow transition",
              isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
            )}
          >
            {isActive ? "Editing" : "Edit"}: {label}
          </span>
        </button>
      </div>
    );
  };

  return (
    <div
      ref={scrollRef}
      className="h-full overflow-x-hidden overflow-y-auto rounded-xl bg-background ring-1 ring-border"
    >
      <SitePreviewProvider value={true}>
        <div style={desktop ? { width: DESKTOP_WIDTH, zoom } : undefined}>
          {frame("hero", <Hero data={content.hero} />)}
          {frame("ticker", <TagTicker tags={content.ticker} />)}
          {frame("about", <AboutSection data={content.about} />)}
          {frame("activities", <ServicesGrid data={content.activities} />)}
          {frame("benefits", <BenefitsSection data={content.benefits} />)}
          <div className="border-y border-border bg-muted/40 px-6 py-14 text-center text-sm text-muted-foreground">
            Photo gallery, upcoming events and announcements appear here.
            <br />
            They fill in automatically from their own admin pages.
          </div>
          {frame("contact", <ContactSection data={content.contact} />)}
          {frame("join_cta", <JoinCta data={content.join_cta} />)}
        </div>
      </SitePreviewProvider>
    </div>
  );
}
