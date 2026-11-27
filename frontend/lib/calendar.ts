const ymd = (d: Date) =>
  `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;

const hms = (d: Date) =>
  `${ymd(d)}T${String(d.getHours()).padStart(2, "0")}${String(d.getMinutes()).padStart(2, "0")}00`;

// Events have a start time only, so the calendar entry gets this length.
const EVENT_HOURS = 2;

/**
 * A Google Calendar "add event" link. With a HH:MM time (Asia/Jakarta) it is a
 * timed entry; without one it is all-day.
 */
export function googleCalendarUrl(
  title: string,
  date: string,
  location?: string | null,
  time?: string
): string {
  const [y, m, d] = date.split("-").map(Number);
  const params = new URLSearchParams({ action: "TEMPLATE", text: title });
  if (time) {
    // Wall-clock arithmetic only; ctz tells Google which zone the clock is in.
    const [h, min] = time.split(":").map(Number);
    const start = new Date(y, m - 1, d, h, min);
    const end = new Date(y, m - 1, d, h + EVENT_HOURS, min);
    params.set("dates", `${hms(start)}/${hms(end)}`);
    params.set("ctz", "Asia/Jakarta");
  } else {
    const end = new Date(y, m - 1, d + 1); // all-day end is exclusive
    params.set("dates", `${ymd(new Date(y, m - 1, d))}/${ymd(end)}`);
  }
  if (location) params.set("location", location);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
