import { ImagePlaceholder } from "@/components/shared/ImagePlaceholder";

// TODO: Replace with GET /gallery (see api_contract.json)
const galleryItems = Array.from({ length: 12 }, (_, i) => ({ id: i }));

export function GallerySection() {
  return (
    <section id="gallery" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-16 sm:px-6">
      <div className="text-center">
        <span className="text-xs font-semibold tracking-[0.3em] text-primary uppercase">
          The Road So Far
        </span>
        <h2 className="font-heading mt-2 text-3xl font-bold tracking-wide uppercase">
          Gallery
        </h2>
      </div>
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {galleryItems.map((item) => (
          <ImagePlaceholder key={item.id} className="aspect-square" />
        ))}
      </div>
    </section>
  );
}
