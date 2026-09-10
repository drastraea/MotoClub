"use client";

import { useState } from "react";
import { toast } from "sonner";
import { SiteContentForm } from "@/components/shared/SiteContentForm";
import { useSiteContent } from "@/hooks/useSiteContent";
import { api } from "@/lib/api";
import type { SiteContent } from "@/lib/site-content";

export default function AdminSitePage() {
  const { content, loading, error, reload } = useSiteContent();
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (values: SiteContent) => {
    setSaving(true);
    try {
      await api.updateSiteContent(values);
      toast.success("Landing page updated");
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold tracking-wide uppercase">
        Site Content
      </h1>
      <p className="mt-2 text-muted-foreground">
        Edit the text and images on the public landing page.
      </p>

      {error && (
        <p className="mt-4 text-sm text-destructive">
          Couldn&apos;t load saved content ({error}). Showing defaults — saving may
          fail until the backend endpoint exists.
        </p>
      )}

      {loading ? (
        <p className="mt-8 text-sm text-muted-foreground">Loading…</p>
      ) : (
        <SiteContentForm defaultValues={content} saving={saving} onSubmit={handleSubmit} />
      )}
    </div>
  );
}
