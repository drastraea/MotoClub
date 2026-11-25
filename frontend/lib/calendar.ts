const ymd = (d: Date) =>
  `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;

/**
 * A Google Calendar "add event" link for an all-day event on a YYYY-MM-DD date.
 * (The backend stores dates only, no time of day.)
 */
export function googleCalendarUrl(title: string, date: string, location?: string | null): string {
  const [y, m, d] = date.split("-").map(Number);
  const start = new Date(y, m - 1, d);
  const end = new Date(y, m - 1, d + 1); // all-day end is exclusive
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${ymd(start)}/${ymd(end)}`,
  });
  if (location) params.set("location", location);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
