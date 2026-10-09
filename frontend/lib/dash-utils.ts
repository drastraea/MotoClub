// Small helpers shared by the admin and member dashboards. Backend dates are
// YYYY-MM-DD strings (Asia/Jakarta), compared here as calendar days.

const MS_DAY = 86_400_000;

function parse(date: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

/** Whole days from today until `date` (negative when in the past). */
export function daysUntil(date: string): number {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((parse(date).getTime() - today.getTime()) / MS_DAY);
}

/** "10 Mar 2026" */
export function formatDate(date: string): string {
  return parse(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Today as YYYY-MM-DD in the browser's local time. */
export function todayISO(): string {
  const n = new Date();
  const mm = String(n.getMonth() + 1).padStart(2, "0");
  const dd = String(n.getDate()).padStart(2, "0");
  return `${n.getFullYear()}-${mm}-${dd}`;
}

export function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

/** "in 12 days" / "today" / "3 days ago" */
export function relativeDays(days: number): string {
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  if (days === -1) return "yesterday";
  return days > 0 ? `in ${days} days` : `${-days} days ago`;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

/** Memberships still count as "due for renewal" this many days before expiry. */
export const RENEWAL_WINDOW_DAYS = 60;
