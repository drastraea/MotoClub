"use client";

import { useEffect } from "react";

/**
 * Keeps the screen on while the component is mounted, so a member's card does
 * not dim while an admin is scanning it. Browsers without the Screen Wake Lock
 * API just ignore this.
 */
export function useWakeLock() {
  useEffect(() => {
    let lock: WakeLockSentinel | null = null;
    let cancelled = false;

    const acquire = async () => {
      try {
        if (!("wakeLock" in navigator) || document.visibilityState !== "visible") return;
        const l = await navigator.wakeLock.request("screen");
        if (cancelled) void l.release();
        else lock = l;
      } catch {
        // Denied (battery saver, unsupported): nothing to do.
      }
    };

    void acquire();
    // The lock is dropped whenever the tab is hidden, so take it again on return.
    const onVisible = () => void acquire();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
      void lock?.release();
    };
  }, []);
}
