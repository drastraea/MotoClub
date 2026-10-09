import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Compact KPI tile. `tone="attention"` tints it amber when the number needs action.
export function StatTile({
  href,
  icon: Icon,
  label,
  value,
  loading,
  tone = "default",
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  value: number | null | undefined;
  loading?: boolean;
  tone?: "default" | "attention";
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-xl bg-card p-4 shadow-xs ring-1 ring-border transition hover:ring-foreground/25"
    >
      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-lg",
          tone === "attention" ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
        )}
      >
        <Icon className="size-5" />
      </div>
      <div className="min-w-0">
        {loading ? (
          <div className="h-7 w-10 animate-pulse rounded bg-muted" />
        ) : (
          <p className="text-2xl leading-none font-semibold tabular-nums">{value ?? "—"}</p>
        )}
        <p className="mt-1 truncate text-xs text-muted-foreground">{label}</p>
      </div>
    </Link>
  );
}
