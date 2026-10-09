"use client";

import { useState } from "react";
import { toast } from "sonner";
import { DashHeader } from "@/components/dashboard/DashHeader";
import { SiteContentForm } from "@/components/shared/SiteContentForm";
import { useSiteContent } from "@/hooks/useSiteContent";
import { api } from "@/lib/api";
import type { SiteContent } from "@/lib/site-content";

export default function AdminSitePage() {
  const { content, loading, error, reload } = useSiteContent();
  const [saving, setSaving] = useState(false);

  // Resolves true on success so the form can mark itself as saved.
  const handleSubmit = async (values: SiteContent): Promise<boolean> => {
    setSaving(true);
    try {
      await api.updateSiteContent(values);
      toast.success("Landing page updated");
      await reload();
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
      return false;
    } finally {
      setSaving(false);
    }
  };

  // A 404 just means nothing has been saved yet: the page is using its defaults.
  const nothingSaved = !!error && /not found|404/i.test(error);

  return (
    <div>
      <DashHeader
        title="Site Content"
        description="Edit the landing page section by section and watch the preview update."
      />

      {nothingSaved && (
        <p className="mt-4 rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground">
          Nothing has been saved yet, so this starts from the built-in text. Save once to make
          your changes live.
        </p>
      )}
      {error && !nothingSaved && (
        <p className="mt-4 text-sm text-destructive">
          Couldn&apos;t load the saved content ({error}). Showing the built-in text instead.
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
