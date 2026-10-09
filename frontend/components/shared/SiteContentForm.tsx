"use client";

import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChevronLeft, ChevronRight, Eye, Pencil, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageDropzone } from "@/components/shared/ImageDropzone";
import { SiteContentPreview } from "@/components/shared/SiteContentPreview";
import { SITE_SECTIONS, sectionIndex, type SectionId } from "@/components/shared/site-sections";
import {
  SITE_ICON_KEYS,
  withSiteContentDefaults,
  type SiteContent,
  type SiteIconKey,
} from "@/lib/site-content";
import { siteIconMap } from "@/lib/site-icons";
import { cn } from "@/lib/utils";

const iconEnum = z.enum(SITE_ICON_KEYS);
const nonEmpty = z.string().min(1, "Required");

const schema = z.object({
  hero: z.object({
    eyebrow: nonEmpty,
    headline_lines: z.array(nonEmpty).min(1, "Add at least one line"),
    highlight: z.string(),
    body: nonEmpty,
    value_props: z.array(nonEmpty),
    image: z.string(),
  }),
  ticker: z.array(nonEmpty).min(1, "Add at least one word"),
  about: z.object({
    eyebrow: nonEmpty,
    heading: nonEmpty,
    body: nonEmpty,
    established_year: nonEmpty,
    points: z.array(nonEmpty),
    images: z.array(z.string()),
  }),
  activities: z.object({
    eyebrow: nonEmpty,
    heading: nonEmpty,
    items: z.array(z.object({ icon: iconEnum, title: nonEmpty })).min(1, "Add at least one"),
  }),
  benefits: z.object({
    eyebrow: nonEmpty,
    heading: nonEmpty,
    items: z
      .array(
        z.object({
          id: z.string(),
          icon: iconEnum,
          title: nonEmpty,
          description: nonEmpty,
        })
      )
      .min(1, "Add at least one"),
  }),
  contact: z.object({
    eyebrow: nonEmpty,
    heading: nonEmpty,
    address: nonEmpty,
    phone: nonEmpty,
    email: nonEmpty,
  }),
  join_cta: z.object({ heading: nonEmpty, body: nonEmpty }),
});

type FormValues = z.infer<typeof schema>;

const FORM_ID = "site-content-form";

// --- small building blocks -------------------------------------------------

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      {hint && <p className="-mt-0.5 text-xs text-muted-foreground">{hint}</p>}
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

function StringList({
  label,
  hint,
  values,
  onChange,
  addLabel = "Add",
  placeholder,
  error,
}: {
  label: string;
  hint?: string;
  values: string[];
  onChange: (v: string[]) => void;
  addLabel?: string;
  placeholder?: string;
  error?: string;
}) {
  const set = (i: number, v: string) => onChange(values.map((x, j) => (j === i ? v : x)));
  const remove = (i: number) => onChange(values.filter((_, j) => j !== i));
  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      {hint && <p className="-mt-1 text-xs text-muted-foreground">{hint}</p>}
      {values.map((v, i) => (
        <div key={i} className="flex gap-2">
          <Input
            value={v}
            placeholder={placeholder}
            onChange={(e) => set(i, e.target.value)}
          />
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="Remove"
            onClick={() => remove(i)}
          >
            <X className="size-4" />
          </Button>
        </div>
      ))}
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="self-start"
        onClick={() => onChange([...values, ""])}
      >
        <Plus className="size-4" />
        {addLabel}
      </Button>
    </div>
  );
}

function IconSelect({
  value,
  onChange,
}: {
  value: SiteIconKey;
  onChange: (v: SiteIconKey) => void;
}) {
  const Selected = value ? siteIconMap[value] : null;
  return (
    <Select value={value} onValueChange={(v) => onChange(v as SiteIconKey)}>
      <SelectTrigger className="w-40 shrink-0">
        <SelectValue placeholder="Icon">
          {Selected && (
            <span className="flex items-center gap-2">
              <Selected className="size-4" />
              {value}
            </span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {SITE_ICON_KEYS.map((k) => {
          const Icon = siteIconMap[k];
          return (
            <SelectItem key={k} value={k}>
              <span className="flex items-center gap-2">
                <Icon className="size-4" />
                {k}
              </span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}

// --- form ----------------------------------------------------------------

export function SiteContentForm({
  defaultValues,
  saving,
  onSubmit,
}: {
  defaultValues: SiteContent;
  saving?: boolean;
  /** Return false when the save failed so the form stays marked as unsaved. */
  onSubmit: (values: SiteContent) => Promise<boolean | void> | boolean | void;
}) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    control,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as FormValues,
  });

  const [active, setActive] = useState<SectionId>("hero");
  // Below the xl breakpoint the editor and preview share one column.
  const [view, setView] = useState<"edit" | "preview">("edit");

  // Everything the preview needs, merged over defaults so half-typed values
  // never leave a section unrenderable.
  const live = useWatch({ control });
  const previewContent = withSiteContentDefaults(live as Partial<SiteContent>);

  // Targeted watches for the list/image fields we edit through setValue; the
  // plain <input> fields are left to register().
  const v = {
    hero: {
      headline_lines: watch("hero.headline_lines"),
      value_props: watch("hero.value_props"),
      image: watch("hero.image"),
    },
    ticker: watch("ticker"),
    about: {
      points: watch("about.points"),
      images: watch("about.images"),
    },
    activities: { items: watch("activities.items") },
    benefits: { items: watch("benefits.items") },
  };
  const bind = <K extends string>(name: K, val: unknown) =>
    setValue(name as never, val as never, { shouldDirty: true });

  // Warn before leaving with unsaved edits.
  useEffect(() => {
    if (!isDirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isDirty]);

  const submit = handleSubmit(
    async (values) => {
      const ok = await onSubmit(values as SiteContent);
      if (ok !== false) reset(values);
    },
    (errs) => {
      const first = SITE_SECTIONS.find((s) => errs[s.id]);
      if (first) {
        setActive(first.id);
        setView("edit");
      }
      toast.error("Some fields need attention. The tabs with a red dot have problems.");
    }
  );

  const idx = sectionIndex(active);
  const current = SITE_SECTIONS[idx];
  const prev = SITE_SECTIONS[idx - 1];
  const next = SITE_SECTIONS[idx + 1];
  const show = (id: SectionId) => active !== id;

  const selectFromPreview = (id: SectionId) => {
    setActive(id);
    setView("edit");
  };

  // The <form> wraps only the editor column. The preview renders the real landing
  // sections, one of which contains its own <form>, and forms cannot nest.
  return (
    <div className="mt-6 flex flex-col gap-5">
      {/* Edit / Preview toggle for narrower screens */}
      <div className="flex gap-1 rounded-lg bg-muted p-1 xl:hidden" role="tablist" aria-label="View">
        {(
          [
            ["edit", "Edit", Pencil],
            ["preview", "Preview", Eye],
          ] as const
        ).map(([id, label, Icon]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={view === id}
            onClick={() => setView(id)}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition",
              view === id && "bg-background text-foreground shadow-xs"
            )}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </div>

      {/* minmax(0, ...) keeps the wide marquee strip in the preview from stretching the column */}
      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 xl:grid-cols-[minmax(0,480px)_minmax(0,1fr)]">
        {/* ---- editor ---- */}
        <form
          id={FORM_ID}
          onSubmit={submit}
          className={cn("flex-col gap-5", view === "edit" ? "flex" : "hidden", "xl:flex")}
        >
          <div role="tablist" aria-label="Page sections" className="flex flex-wrap gap-1.5">
            {SITE_SECTIONS.map((s, i) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={active === s.id}
                onClick={() => setActive(s.id)}
                className={cn(
                  "relative rounded-full px-3 py-1.5 text-xs font-medium ring-1 ring-border transition hover:bg-muted",
                  active === s.id &&
                    "bg-primary text-primary-foreground ring-primary hover:bg-primary"
                )}
              >
                <span className="mr-1 tabular-nums opacity-60">{i + 1}</span>
                {s.label}
                {errors[s.id] && (
                  <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-destructive ring-2 ring-background" />
                )}
              </button>
            ))}
          </div>

          <div className="rounded-xl bg-muted/50 p-4">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Section {idx + 1} of {SITE_SECTIONS.length} · {current.where}
            </p>
            <h2 className="mt-1 text-lg font-semibold">{current.label}</h2>
            <p className="text-sm text-muted-foreground">{current.hint}</p>
          </div>

          {/* Banner */}
          <div hidden={show("hero")} className="flex flex-col gap-4">
            <Field
              label="Small text above the headline"
              error={errors.hero?.eyebrow?.message}
            >
              <Input {...register("hero.eyebrow")} />
            </Field>
            <StringList
              label="Headline"
              hint="One row per line of the big headline."
              values={v.hero.headline_lines}
              onChange={(val) => bind("hero.headline_lines", val)}
              addLabel="Add line"
              error={errors.hero?.headline_lines?.message}
            />
            <Field
              label="Word to highlight"
              hint="Shown in amber. It must appear in one of the headline lines."
              error={errors.hero?.highlight?.message}
            >
              <Input {...register("hero.highlight")} />
            </Field>
            <Field label="Intro paragraph" error={errors.hero?.body?.message}>
              <Textarea rows={3} {...register("hero.body")} />
            </Field>
            <StringList
              label="Short points under the intro"
              values={v.hero.value_props}
              onChange={(val) => bind("hero.value_props", val)}
              addLabel="Add point"
            />
            <Field label="Banner photo" hint="Shown next to the headline.">
              <ImageDropzone
                value={v.hero.image}
                onChange={(url) => bind("hero.image", url)}
              />
            </Field>
          </div>

          {/* Scrolling strip */}
          <div hidden={show("ticker")} className="flex flex-col gap-4">
            <StringList
              label="Words in the strip"
              hint="Keep them short, for example RIDES or TOURING."
              values={v.ticker}
              onChange={(val) => bind("ticker", val)}
              addLabel="Add word"
              error={errors.ticker?.message}
            />
          </div>

          {/* About */}
          <div hidden={show("about")} className="flex flex-col gap-4">
            <Field label="Small label above the title" error={errors.about?.eyebrow?.message}>
              <Input {...register("about.eyebrow")} />
            </Field>
            <Field label="Section title" error={errors.about?.heading?.message}>
              <Input {...register("about.heading")} />
            </Field>
            <Field label="Main paragraph" error={errors.about?.body?.message}>
              <Textarea rows={4} {...register("about.body")} />
            </Field>
            <Field
              label="Year the club was founded"
              error={errors.about?.established_year?.message}
            >
              <Input {...register("about.established_year")} />
            </Field>
            <StringList
              label="Key points"
              hint="Shown as a numbered list."
              values={v.about.points}
              onChange={(val) => bind("about.points", val)}
              addLabel="Add point"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Large photo">
                <ImageDropzone
                  value={v.about.images[0] ?? ""}
                  onChange={(url) => bind("about.images", [url, v.about.images[1] ?? ""])}
                />
              </Field>
              <Field label="Small photo">
                <ImageDropzone
                  value={v.about.images[1] ?? ""}
                  onChange={(url) => bind("about.images", [v.about.images[0] ?? "", url])}
                />
              </Field>
            </div>
          </div>

          {/* Activities */}
          <div hidden={show("activities")} className="flex flex-col gap-4">
            <Field label="Small label above the title" error={errors.activities?.eyebrow?.message}>
              <Input {...register("activities.eyebrow")} />
            </Field>
            <Field label="Section title" error={errors.activities?.heading?.message}>
              <Input {...register("activities.heading")} />
            </Field>
            <div className="flex flex-col gap-2">
              <Label>Activities</Label>
              {v.activities.items.map((item, i) => (
                <div key={i} className="flex gap-2">
                  <IconSelect
                    value={item.icon}
                    onChange={(icon) =>
                      bind(
                        "activities.items",
                        v.activities.items.map((it, j) => (j === i ? { ...it, icon } : it))
                      )
                    }
                  />
                  <Input
                    value={item.title}
                    placeholder="Name"
                    onChange={(e) =>
                      bind(
                        "activities.items",
                        v.activities.items.map((it, j) =>
                          j === i ? { ...it, title: e.target.value } : it
                        )
                      )
                    }
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    aria-label="Remove"
                    onClick={() =>
                      bind(
                        "activities.items",
                        v.activities.items.filter((_, j) => j !== i)
                      )
                    }
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ))}
              {errors.activities?.items?.message && (
                <p className="text-sm text-destructive">{errors.activities.items.message}</p>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="self-start"
                onClick={() =>
                  bind("activities.items", [
                    ...v.activities.items,
                    { icon: SITE_ICON_KEYS[0], title: "" },
                  ])
                }
              >
                <Plus className="size-4" />
                Add activity
              </Button>
            </div>
          </div>

          {/* Benefits */}
          <div hidden={show("benefits")} className="flex flex-col gap-4">
            <Field label="Small label above the title" error={errors.benefits?.eyebrow?.message}>
              <Input {...register("benefits.eyebrow")} />
            </Field>
            <Field label="Section title" error={errors.benefits?.heading?.message}>
              <Input {...register("benefits.heading")} />
            </Field>
            <div className="flex flex-col gap-3">
              <Label>Benefits</Label>
              {v.benefits.items.map((item, i) => {
                const update = (patch: Partial<(typeof v.benefits.items)[number]>) =>
                  bind(
                    "benefits.items",
                    v.benefits.items.map((it, j) => (j === i ? { ...it, ...patch } : it))
                  );
                return (
                  <div key={item.id} className="flex flex-col gap-2 rounded-lg border border-border p-3">
                    <div className="flex gap-2">
                      <IconSelect value={item.icon} onChange={(icon) => update({ icon })} />
                      <Input
                        value={item.title}
                        placeholder="Title"
                        onChange={(e) => update({ title: e.target.value })}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        aria-label="Remove"
                        onClick={() =>
                          bind(
                            "benefits.items",
                            v.benefits.items.filter((_, j) => j !== i)
                          )
                        }
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                    <Textarea
                      rows={2}
                      value={item.description}
                      placeholder="Description"
                      onChange={(e) => update({ description: e.target.value })}
                    />
                  </div>
                );
              })}
              {errors.benefits?.items?.message && (
                <p className="text-sm text-destructive">{errors.benefits.items.message}</p>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="self-start"
                onClick={() =>
                  bind("benefits.items", [
                    ...v.benefits.items,
                    {
                      id: crypto.randomUUID(),
                      icon: SITE_ICON_KEYS[0],
                      title: "",
                      description: "",
                    },
                  ])
                }
              >
                <Plus className="size-4" />
                Add benefit
              </Button>
            </div>
          </div>

          {/* Contact */}
          <div hidden={show("contact")} className="flex flex-col gap-4">
            <Field label="Small label above the title" error={errors.contact?.eyebrow?.message}>
              <Input {...register("contact.eyebrow")} />
            </Field>
            <Field label="Section title" error={errors.contact?.heading?.message}>
              <Input {...register("contact.heading")} />
            </Field>
            <Field label="Address" error={errors.contact?.address?.message}>
              <Input {...register("contact.address")} />
            </Field>
            <Field label="Phone" error={errors.contact?.phone?.message}>
              <Input {...register("contact.phone")} />
            </Field>
            <Field label="Email" error={errors.contact?.email?.message}>
              <Input {...register("contact.email")} />
            </Field>
          </div>

          {/* Join banner */}
          <div hidden={show("join_cta")} className="flex flex-col gap-4">
            <Field label="Headline" error={errors.join_cta?.heading?.message}>
              <Input {...register("join_cta.heading")} />
            </Field>
            <Field label="Text under the headline" error={errors.join_cta?.body?.message}>
              <Textarea rows={2} {...register("join_cta.body")} />
            </Field>
          </div>

          <div className="flex items-center justify-between border-t border-border pt-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={!prev}
              onClick={() => prev && setActive(prev.id)}
            >
              <ChevronLeft className="size-4" />
              {prev ? prev.label : "Previous"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={!next}
              onClick={() => next && setActive(next.id)}
            >
              {next ? next.label : "Next"}
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </form>

        {/* ---- live preview ---- */}
        <div
          className={cn(
            "flex flex-col gap-2 xl:sticky xl:top-20 xl:flex xl:self-start",
            view === "preview" ? "flex" : "hidden"
          )}
        >
          <div className="flex items-baseline justify-between gap-3 px-1">
            <p className="text-sm font-semibold">Live preview</p>
            <p className="text-xs text-muted-foreground">
              Updates as you type. Click a section to edit it.
            </p>
          </div>
          <div className="h-[70vh] xl:h-[calc(100vh-10rem)]">
            <SiteContentPreview
              content={previewContent}
              active={active}
              onSelect={selectFromPreview}
            />
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 z-10 -mx-4 flex items-center justify-between gap-3 border-t border-border bg-background/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <p
          className={cn(
            "flex items-center gap-2 text-sm",
            isDirty ? "text-foreground" : "text-muted-foreground"
          )}
        >
          <span
            className={cn("size-2 rounded-full", isDirty ? "bg-primary" : "bg-muted-foreground/40")}
          />
          {isDirty ? "You have unsaved changes" : "All changes saved"}
        </p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={!isDirty || saving}
            onClick={() => reset()}
          >
            Discard
          </Button>
          <Button type="submit" form={FORM_ID} disabled={saving || !isDirty}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
