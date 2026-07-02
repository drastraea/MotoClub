export function AboutSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="grid gap-8 sm:grid-cols-2 sm:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">About the Club</h2>
          <p className="mt-4 text-muted-foreground">
            Founded by riders for riders, our club brings together people who
            share a passion for the open road. From weekend rides to charity
            runs, we build lasting friendships one mile at a time.
          </p>
        </div>
        <div className="aspect-video rounded-xl border border-border bg-muted" />
      </div>
    </section>
  );
}
