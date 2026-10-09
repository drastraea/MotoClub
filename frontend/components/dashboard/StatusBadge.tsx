import { Badge } from "@/components/ui/badge";
import { statusMeta } from "@/lib/member-status";
import { cn } from "@/lib/utils";

// Status pill for dashboard lists. Approved is a soft green instead of the
// solid brand amber so a long list of active members stays calm.
export function StatusBadge({ status }: { status: string }) {
  const meta = statusMeta(status);
  const Icon = meta.icon;
  const approved = status === "APPROVED";
  return (
    <Badge
      variant={approved ? "secondary" : meta.badge}
      className={cn(
        approved && "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
      )}
    >
      <Icon />
      {meta.label}
    </Badge>
  );
}
