import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gallery - Motorcycle Club",
};

// TODO: Replace with GET /gallery (see api_contract.json)
const galleryItems = Array.from({ length: 12 }, (_, i) => ({ id: i }));

export default function GalleryPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h1 className="text-4xl font-bold tracking-tight">Gallery</h1>
      <p className="mt-2 text-muted-foreground">
        Moments from our rides, events, and gatherings.
      </p>

      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {galleryItems.map((item) => (
          <div
            key={item.id}
            className="aspect-square rounded-lg border border-border bg-muted"
          />
        ))}
      </div>
    </section>
  );
}
