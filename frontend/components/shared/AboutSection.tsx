import { ImagePlaceholder } from "@/components/shared/ImagePlaceholder";

export function AboutSection() {
  return (
    <section id="about" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-16 sm:px-6">
      <div className="grid gap-8 sm:grid-cols-2 sm:items-center">
        <div>
          <span className="text-xs font-semibold tracking-[0.3em] text-primary uppercase">
            Who We Are
          </span>
          <h2 className="font-heading mt-2 text-3xl font-bold tracking-wide uppercase">
            About the Club
          </h2>
          <div className="mt-3 h-1 w-16 bg-primary" />
          <p className="mt-4 text-muted-foreground">
            Founded by riders for riders, our club brings together people who
            share a passion for the open road. From weekend rides to charity
            runs, we build lasting friendships one mile at a time.
          </p>
        </div>
        <ImagePlaceholder className="aspect-video" />
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        <div>
          <h3 className="font-heading text-xl font-semibold tracking-wide uppercase">
            Our Mission
          </h3>
          <p className="mt-2 text-muted-foreground">
            To support our members, give back to the community, and keep the
            spirit of riding alive across generations.
          </p>
        </div>
        <div>
          <h3 className="font-heading text-xl font-semibold tracking-wide uppercase">
            Our Values
          </h3>
          <p className="mt-2 text-muted-foreground">
            Brotherhood, safety, respect for the road, and giving back to the
            communities we ride through.
          </p>
        </div>
      </div>
    </section>
  );
}
