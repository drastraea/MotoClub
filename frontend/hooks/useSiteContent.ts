"use client";

import { useCallback } from "react";
import { api } from "@/lib/api";
import { useApiData } from "@/hooks/useApiData";
import {
  defaultSiteContent,
  withSiteContentDefaults,
  type SiteContent,
} from "@/lib/site-content";

/**
 * Loads the editable landing-page content. Renders `defaultSiteContent`
 * immediately (no spinner, no flash) and swaps in the API payload once it
 * resolves; a 404 (endpoint not built yet) just keeps the defaults.
 */
export function useSiteContent(): {
  content: SiteContent;
  loading: boolean;
  error: string | null;
  reload: () => Promise<unknown>;
} {
  const { data, loading, error, reload } = useApiData(
    useCallback(() => api.getSiteContent(), []),
    []
  );
  return {
    content: data ? withSiteContentDefaults(data) : defaultSiteContent,
    loading,
    error,
    reload,
  };
}
