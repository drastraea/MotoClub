"use client";

import { useSyncExternalStore } from "react";
import { getEventStub, subscribe, type EventStub } from "@/lib/event-stubs";

// ponytail: same hydration tradeoff as useBenefits - only mismatches if the
// event was stubbed in this exact browser, a rare and low-stakes case.
export function useEventStub(eventId: string): EventStub {
  return useSyncExternalStore(
    subscribe,
    () => getEventStub(eventId),
    () => getEventStub(eventId)
  );
}
