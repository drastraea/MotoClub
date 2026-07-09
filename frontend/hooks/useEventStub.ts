"use client";

import { useCallback, useRef, useSyncExternalStore } from "react";
import { getEventStub, subscribe, type EventStub } from "@/lib/event-stubs";

// useSyncExternalStore requires getSnapshot to return a cached/stable reference —
// getEventStub builds a fresh object each call, which would loop forever
// (React error #185). Cache by serialized content and only hand back a new
// object when the stub actually changes.
export function useEventStub(eventId: string): EventStub {
  const cache = useRef<{ key: string; value: EventStub } | null>(null);

  const getSnapshot = useCallback((): EventStub => {
    const value = getEventStub(eventId);
    const key = JSON.stringify(value);
    if (!cache.current || cache.current.key !== key) {
      cache.current = { key, value };
    }
    return cache.current.value;
  }, [eventId]);

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
