"use client";

import { useCallback } from "react";
import { api } from "@/lib/api";
import { useApiData } from "@/hooks/useApiData";

/**
 * Locations for a set of events, keyed by event id. The list endpoint does not
 * include the location, so each event's detail is fetched (in parallel). A
 * failed lookup just leaves that event without a location.
 */
export function useEventLocations(ids: string[]): Record<string, string | null> {
  const key = ids.join(",");
  const { data } = useApiData(
    useCallback(async () => {
      const list = key ? key.split(",") : [];
      const details = await Promise.all(list.map((id) => api.getEvent(id).catch(() => null)));
      return Object.fromEntries(list.map((id, i) => [id, details[i]?.location ?? null]));
    }, [key]),
    [key]
  );
  return data ?? {};
}
