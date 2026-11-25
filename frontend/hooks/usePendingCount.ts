"use client";

import { useEffect, useSyncExternalStore } from "react";
import { api } from "@/lib/api";

// One shared count of applications waiting for review, so the sidebar, the phone
// tab bar and the pages that approve or reject all agree without refetching three
// times. Call refreshPendingCount() after approving or rejecting.
let count: number | null = null;
let inflight = false;
const subs = new Set<() => void>();

const subscribe = (cb: () => void) => {
  subs.add(cb);
  return () => subs.delete(cb);
};

export async function refreshPendingCount(): Promise<void> {
  try {
    count = await api.getRegistrationCount();
  } catch {
    // Leave the previous value; the badge just may be stale.
  }
  subs.forEach((f) => f());
}

export function usePendingCount(): number {
  const value = useSyncExternalStore(subscribe, () => count, () => null);
  useEffect(() => {
    if (count !== null || inflight) return;
    inflight = true;
    void refreshPendingCount().finally(() => {
      inflight = false;
    });
  }, []);
  return value ?? 0;
}
