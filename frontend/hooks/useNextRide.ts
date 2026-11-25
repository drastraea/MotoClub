"use client";

import { useCallback, useMemo } from "react";
import { api } from "@/lib/api";
import { useApiData } from "@/hooks/useApiData";
import { todayISO } from "@/lib/dash-utils";

/**
 * The nearest upcoming event the current visitor may see (anonymous visitors
 * get public events only), plus its location. The list endpoint has no
 * location, so the detail endpoint is fetched for the one event we show.
 */
export function useNextRide() {
  const list = useApiData(useCallback(() => api.getEvents(), []), []);

  const event = useMemo(() => {
    const today = todayISO();
    return (list.data ?? [])
      .filter((e) => e.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))[0];
  }, [list.data]);

  const id = event?.id;
  const detail = useApiData(
    useCallback(() => (id ? api.getEvent(id) : Promise.resolve(null)), [id]),
    [id]
  );

  return { event, location: detail.data?.location ?? null, loading: list.loading };
}
