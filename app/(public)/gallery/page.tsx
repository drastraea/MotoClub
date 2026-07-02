import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { ImagePlaceholder } from "@/components/shared/ImagePlaceholder";

export const metadata: Metadata = {
  title: "Gallery - Motorcycle Club",
};

// TODO: Replace with GET /gallery (see api_contract.json)
const galleryItems = Array.from({ length: 12 }, (_, i) => ({ id: i }));

export default function GalleryPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <PageHeader
        title="Gallery"
        description="Moments from our rides, events, and gatherings."
      />

      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {galleryItems.map((item) => (
          <ImagePlaceholder key={item.id} className="aspect-square" />
        ))}
      </div>
    </section>
  );
}
