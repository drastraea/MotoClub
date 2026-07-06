"use client";

import { useSyncExternalStore } from "react";
import { getBenefits, subscribe, type Benefit } from "@/lib/benefits-store";

// ponytail: getServerSnapshot only differs from the client snapshot if an
// admin has customized benefits in this same browser profile (localStorage)
// - a rare edge case where React just re-renders after a dev-only hydration
// warning. Not worth a mounted-gate (and its content flash) for this.
export function useBenefits(): Benefit[] {
  return useSyncExternalStore(subscribe, getBenefits, getBenefits);
}
