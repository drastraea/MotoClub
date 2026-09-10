import { CheckCircle2, Clock, XCircle, CalendarX } from "lucide-react";
import type { LucideIcon } from "lucide-react";

// Effective member status as returned by the API. EXPIRED is computed backend-side
// from membership_expires_at (3-year term); it is never a stored value.
export const MEMBER_STATUSES = [
  "PENDING_APPROVAL",
  "APPROVED",
  "REJECTED",
  "EXPIRED",
] as const;

export type MemberStatus = (typeof MEMBER_STATUSES)[number];

type Meta = {
  label: string;
  icon: LucideIcon;
  /** Badge variant from components/ui/badge. */
  badge: "default" | "secondary" | "destructive" | "outline";
  /** Text colour for inline (non-badge) use. */
  className: string;
};

export const memberStatusMeta: Record<string, Meta> = {
  PENDING_APPROVAL: {
    label: "Pending Review",
    icon: Clock,
    badge: "secondary",
    className: "text-primary",
  },
  APPROVED: {
    label: "Approved",
    icon: CheckCircle2,
    badge: "default",
    className: "text-primary",
  },
  REJECTED: {
    label: "Rejected",
    icon: XCircle,
    badge: "destructive",
    className: "text-destructive",
  },
  EXPIRED: {
    label: "Expired",
    icon: CalendarX,
    badge: "outline",
    className: "text-muted-foreground",
  },
};

export function statusMeta(status: string): Meta {
  return (
    memberStatusMeta[status] ?? {
      label: status,
      icon: Clock,
      badge: "outline",
      className: "text-muted-foreground",
    }
  );
}
