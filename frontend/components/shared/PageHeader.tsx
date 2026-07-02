export function PageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div>
      <h1 className="font-heading text-4xl font-bold tracking-wide uppercase sm:text-5xl">
        {title}
      </h1>
      <div className="mt-3 h-1 w-16 bg-primary" />
      {description && (
        <p className="mt-4 text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
