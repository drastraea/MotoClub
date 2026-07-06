import { ImagePlaceholder } from "@/components/shared/ImagePlaceholder";

const points = [
  "Founded by riders, for riders - not a business, a brotherhood.",
  "Weekend rides, charity runs, and yearly gatherings that keep the club close.",
  "Safety, respect for the road, and giving back to every community we pass through.",
];

export function AboutSection() {
  return (
    <section id="about" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-16 sm:px-6">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <div className="grid grid-cols-5 gap-4">
          <div className="col-span-3">
            <ImagePlaceholder className="aspect-[3/4] h-full" />
          </div>
          <div className="col-span-2 flex flex-col gap-4">
            <div className="shape-corner-sm flex flex-col items-center justify-center bg-primary py-6 text-primary-foreground">
              <span className="text-sm font-medium">Est.</span>
              <span className="font-heading text-3xl font-bold">2024</span>
            </div>
            <ImagePlaceholder className="aspect-square flex-1" />
          </div>
        </div>

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
          <ul className="mt-6 flex flex-col">
            {points.map((point, i) => (
              <li
                key={point}
                className="flex gap-3 border-b border-border py-3 first:pt-0 last:border-0 last:pb-0"
              >
                <span className="font-heading font-bold text-primary">0{i + 1}.</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
