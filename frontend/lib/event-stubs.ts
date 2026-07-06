// TODO: `imageLink` and `isPublic` don't exist on the backend Event model yet
// (see backend/internal/domain/model.go) - no ImageLink/IsPublic field, no
// migration, and GET /events has no way to serve a public subset to
// anonymous callers. Stored per-browser in localStorage as a stand-in so the
// admin UI is ready; swap for real fields once the backend adds them.
// NOTE: because this is per-browser, "public" here does NOT actually make
// events visible to anonymous/non-member visitors yet - it's a display-only
// flag until the backend supports it.

export type EventStub = {
  imageLink?: string;
  isPublic?: boolean;
};

const STORAGE_KEY = "moto-club-event-stubs";
const EVENT_NAME = "moto-club-event-stubs-changed";

type StubMap = Record<string, EventStub>;

function readAll(): StubMap {
  if (typeof window === "undefined") return {};
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as StubMap;
  } catch {
    return {};
  }
}

export function getEventStub(eventId: string): EventStub {
  return readAll()[eventId] ?? {};
}

export function setEventStub(eventId: string, stub: EventStub): void {
  const all = readAll();
  all[eventId] = stub;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  window.dispatchEvent(new Event(EVENT_NAME));
}

export function deleteEventStub(eventId: string): void {
  const all = readAll();
  delete all[eventId];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  window.dispatchEvent(new Event(EVENT_NAME));
}

export function subscribe(callback: () => void): () => void {
  window.addEventListener(EVENT_NAME, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT_NAME, callback);
    window.removeEventListener("storage", callback);
  };
}
