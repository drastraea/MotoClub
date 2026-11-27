"use client";

import { useState } from "react";
import { Check, Pipette } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DashHeader } from "@/components/dashboard/DashHeader";
import { Panel, PanelHeader } from "@/components/dashboard/Panel";
import { storeAccent } from "@/components/shared/AccentStyle";
import { useSiteContent } from "@/hooks/useSiteContent";
import { ACCENT_PRESETS, CLUB_GREY, accentColors, isAccent } from "@/lib/accent";
import { ApiError, api } from "@/lib/api";
import { defaultSiteContent, withSiteContentDefaults } from "@/lib/site-content";
import { cn } from "@/lib/utils";

/** Saves only the colour: the rest of the stored content is read back first. */
async function saveAccent(accent: string) {
  let stored = defaultSiteContent;
  try {
    stored = withSiteContentDefaults(await api.getSiteContent());
  } catch (err) {
    // 404 means nothing saved yet. Anything else must not overwrite real content.
    if (!(err instanceof ApiError && err.status === 404)) throw err;
  }
  await api.updateSiteContent({ ...stored, accent });
}

export default function AdminThemePage() {
  const { content, loading, error, reload } = useSiteContent();
  const [draft, setDraft] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const saved = isAccent(content.accent) ? content.accent : "";
  const accent = draft ?? saved;
  const dirty = accent !== saved;
  const custom = accent !== "" && !ACCENT_PRESETS.some((p) => p.value === accent);
  const colors = accentColors(accent);
  const loadFailed = !!error && !/not found|404/i.test(error);

  const save = async () => {
    setSaving(true);
    try {
      await saveAccent(accent);
      storeAccent(accent);
      await reload();
      setDraft(null);
      toast.success("Theme updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      <DashHeader title="Theme" description="The accent colour used across the whole website." />

      {loadFailed && (
        <p className="text-sm text-destructive">Couldn&apos;t load the saved theme ({error}).</p>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <>
          <Panel>
            <PanelHeader title="Accent colour" description="Buttons, links and highlights." />
            <div className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-3">
              {ACCENT_PRESETS.map((p) => {
                const on = accent === p.value;
                return (
                  <button
                    key={p.label}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setDraft(p.value)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl p-3 text-left text-sm font-medium ring-1 ring-border transition hover:bg-muted/60",
                      on && "ring-2 ring-foreground"
                    )}
                  >
                    <span
                      className="flex size-8 shrink-0 items-center justify-center rounded-full"
                      style={{ background: p.value || CLUB_GREY }}
                    >
                      {on && <Check className="size-4 text-black" />}
                    </span>
                    {p.label}
                  </button>
                );
              })}
              <label
                className={cn(
                  "relative flex cursor-pointer items-center gap-3 rounded-xl p-3 text-sm font-medium ring-1 ring-border transition focus-within:ring-2 focus-within:ring-ring hover:bg-muted/60",
                  custom && "ring-2 ring-foreground"
                )}
              >
                <span
                  className="flex size-8 shrink-0 items-center justify-center rounded-full ring-1 ring-border"
                  style={custom ? { background: accent } : undefined}
                >
                  <Pipette className={cn("size-4", custom && "text-white mix-blend-difference")} />
                </span>
                <span>
                  Custom
                  {custom && <span className="block text-xs text-muted-foreground uppercase">{accent}</span>}
                </span>
                <input
                  type="color"
                  value={accent || CLUB_GREY}
                  onChange={(e) => setDraft(e.target.value)}
                  aria-label="Custom colour"
                  className="absolute inset-0 size-full cursor-pointer opacity-0"
                />
              </label>
            </div>
          </Panel>

          <Panel>
            <PanelHeader
              title="Preview"
              description="Very light or dark colours are adjusted so text stays readable."
            />
            <div className="grid gap-3 p-4 sm:grid-cols-2">
              <Sample name="Light mode" surface="bg-white text-neutral-900" color={colors.light} text={colors.lightText} />
              <Sample name="Dark mode" surface="bg-neutral-950 text-neutral-50" color={colors.dark} text={colors.darkText} />
            </div>
          </Panel>

          <div className="flex justify-end gap-2">
            <Button variant="outline" disabled={!dirty || saving} onClick={() => setDraft(null)}>
              Discard
            </Button>
            <Button disabled={!dirty || saving || loadFailed} onClick={save}>
              {saving ? "Saving…" : "Save theme"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

function Sample({
  name,
  surface,
  color,
  text,
}: {
  name: string;
  surface: string;
  color: string;
  text: string;
}) {
  return (
    <div className={cn("flex flex-col items-start gap-3 rounded-xl p-4 ring-1 ring-border", surface)}>
      <span className="text-[11px] font-semibold tracking-[0.2em] uppercase" style={{ color }}>
        {name}
      </span>
      <p className="font-heading text-2xl font-bold tracking-wide uppercase">
        Stay <span style={{ color }}>Family</span>.
      </p>
      <span className="rounded-lg px-4 py-2 text-sm font-semibold" style={{ background: color, color: text }}>
        Join the club
      </span>
      <span className="text-sm underline" style={{ color }}>
        View all events
      </span>
    </div>
  );
}
