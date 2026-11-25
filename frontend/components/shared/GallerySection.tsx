"use client";

import { useCallback, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ImagePlaceholder } from "@/components/shared/ImagePlaceholder";
import { api } from "@/lib/api";
import { useApiData } from "@/hooks/useApiData";
import { cn } from "@/lib/utils";

// Shown while the gallery is empty or still loading.
const PLACEHOLDERS = 8;
const MAX_SHOWN = 8;

// With 8 photos the grid gets an editorial rhythm (one tall, three wide);
// with fewer, a plain square grid so no gaps appear.
const FEATURE_SLOT = [
  "row-span-2", // 0
  "", // 1
  "col-span-2", // 2
  "", // 3
  "", // 4
  "", // 5
  "col-span-2", // 6
  "col-span-2", // 7
];

export function GallerySection() {
  const { data } = useApiData(useCallback(() => api.getGallery(), []), []);
  const [open, setOpen] = useState<string | null>(null);

  const photos = (data ?? []).slice(0, MAX_SHOWN);
  const featured = photos.length === MAX_SHOWN;
  const shown = photos.length > 0 ? photos : null;

  const cell = (i: number) =>
    shown && featured ? FEATURE_SLOT[i] : shown ? "aspect-square" : FEATURE_SLOT[i];

  return (
    <section id="gallery" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-16 sm:px-6">
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold tracking-[0.3em] text-primary uppercase">
          The Road So Far
        </span>
        <h2 className="font-heading text-3xl font-bold tracking-wide uppercase sm:text-4xl">
          Gallery
        </h2>
      </div>

      <div
        className={cn(
          "mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4",
          (!shown || featured) && "auto-rows-[150px] sm:auto-rows-[170px]"
        )}
      >
        {shown
          ? shown.map((p, i) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setOpen(p.link)}
                aria-label="Open photo"
                className={cn(
                  "group relative overflow-hidden rounded-xl border border-border",
                  cell(i)
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.link}
                  alt=""
                  loading="lazy"
                  className="img-mono size-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </button>
            ))
          : Array.from({ length: PLACEHOLDERS }, (_, i) => (
              <ImagePlaceholder
                key={i}
                className={cn("size-full rounded-xl", FEATURE_SLOT[i])}
              />
            ))}
      </div>

      <Dialog open={open !== null} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-[calc(100%-2rem)] overflow-hidden bg-neutral-950 p-0 sm:max-w-4xl">
          <DialogTitle className="sr-only">Gallery photo</DialogTitle>
          {open && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={open} alt="" className="max-h-[85vh] w-full object-contain" />
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
