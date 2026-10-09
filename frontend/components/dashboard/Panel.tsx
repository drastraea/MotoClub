import { cn } from "@/lib/utils";

// Flat dashboard surface. Matches the Card override scoped to [data-dashboard]
// in globals.css so old Card-based pages and new Panel-based ones look alike.
export function Panel({ className, ...props }: React.ComponentProps<"section">) {
  return (
    <section
      className={cn(
        "rounded-xl bg-card text-card-foreground shadow-xs ring-1 ring-border",
        className
      )}
      {...props}
    />
  );
}

export function PanelHeader({
  title,
  description,
  action,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 border-b border-border px-5 py-4",
        className
      )}
    >
      <div className="min-w-0">
        <h2 className="text-sm font-semibold">{title}</h2>
        {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

/** Divided list inside a Panel; rows are direct children. */
export function PanelList({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("divide-y divide-border", className)} {...props} />;
}
