"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** window.location.origin, or "" during SSR / before hydration. */
export function useOrigin(): string {
  return useSyncExternalStore(
    subscribe,
    () => window.location.origin,
    () => ""
  );
}
