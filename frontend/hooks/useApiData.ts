"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Small client-side data loader for API calls: tracks loading/error and exposes
 * a reload(). `fetcher` is re-created by the caller (usually via useCallback)
 * and passed in `deps` so the effect re-runs when inputs change.
 */
export function useApiData<T>(fetcher: () => Promise<T>, deps: React.DependencyList = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    return fetcher()
      .then((d) => setData(d))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Something went wrong"))
      .finally(() => setLoading(false));
  }, deps);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, reload: load };
}
