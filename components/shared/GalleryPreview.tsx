import Link from "next/link";
import { Button } from "@/components/ui/button";

// TODO: Replace with GET /api/gallery?featured=true
const previewCount = 6;

export function GalleryPreview() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold tracking-[0.3em] text-primary uppercase">
            The Road So Far
          </span>
          <h2 className="font-heading mt-2 text-3xl font-bold tracking-wide uppercase">
            Gallery
          </h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={<Link href="/gallery" />}
        >
          View all
        </Button>
      </div>
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {Array.from({ length: previewCount }).map((_, i) => (
          <div
            key={i}
            className="aspect-square rounded-lg border border-border bg-muted"
          />
        ))}
      </div>
    </section>
  );
}
