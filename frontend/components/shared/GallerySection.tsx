"use client";

import { useCallback } from "react";
import { ImagePlaceholder } from "@/components/shared/ImagePlaceholder";
import { api } from "@/lib/api";
import { useApiData } from "@/hooks/useApiData";

// Fallback preview shown to logged-out visitors, since GET /gallery currently
// requires a member+ session. Real photos replace this once loaded.
const placeholderCount = 10;

function GalleryRow({
  items,
  ariaHidden,
}: {
  items: { id: string; link?: string }[];
  ariaHidden?: boolean;
}) {
  return (
    <div aria-hidden={ariaHidden} className="flex shrink-0 gap-4 pr-4">
      {items.map((item) =>
        item.link ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={item.id}
            src={item.link}
            alt=""
            className="img-mono shape-corner h-64 w-64 shrink-0 border border-border object-cover sm:h-80 sm:w-80"
          />
        ) : (
          <ImagePlaceholder key={item.id} className="h-64 w-64 shrink-0 sm:h-80 sm:w-80" />
        )
      )}
    </div>
  );
}

export function GallerySection() {
  const { data } = useApiData(useCallback(() => api.getGallery(), []), []);

  const items =
    data && data.length > 0
      ? data.map((item) => ({ id: item.id, link: item.link }))
      : Array.from({ length: placeholderCount }, (_, i) => ({ id: `placeholder-${i}` }));

  return (
    <section id="gallery" className="scroll-mt-24 py-16">
      <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
        <span className="text-xs font-semibold tracking-[0.3em] text-primary uppercase">
          The Road So Far
        </span>
        <h2 className="font-heading mt-2 text-3xl font-bold tracking-wide uppercase">
          Gallery
        </h2>
      </div>
      <div className="mt-8 overflow-hidden">
        <div className="flex w-max animate-marquee-slow">
          <GalleryRow items={items} />
          <GalleryRow items={items} ariaHidden />
        </div>
      </div>
    </section>
  );
}
