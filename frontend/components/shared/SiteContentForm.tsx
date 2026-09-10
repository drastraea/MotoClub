"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, X } from "lucide-react";
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
import { SITE_ICON_KEYS, type SiteContent, type SiteIconKey } from "@/lib/site-content";
import { siteIconMap } from "@/lib/site-icons";

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
  ticker: z.array(nonEmpty).min(1, "Add at least one tag"),
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

// --- small building blocks -------------------------------------------------

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details
      open
      className="shape-corner-sm border border-border p-4 [&_summary]:cursor-pointer"
    >
      <summary className="font-heading text-lg font-semibold tracking-wide uppercase">
        {title}
      </summary>
      <div className="mt-4 flex flex-col gap-4">{children}</div>
    </details>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

function StringList({
  label,
  values,
  onChange,
  addLabel = "Add",
  placeholder,
  error,
}: {
  label: string;
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
  onSubmit: (values: SiteContent) => void;
}) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as FormValues,
  });

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

  return (
    <form
      onSubmit={handleSubmit((values) => onSubmit(values as SiteContent))}
      className="mt-8 flex flex-col gap-5"
    >
      <Section title="Hero">
        <Field label="Eyebrow" error={errors.hero?.eyebrow?.message}>
          <Input {...register("hero.eyebrow")} />
        </Field>
        <StringList
          label="Headline lines"
          values={v.hero.headline_lines}
          onChange={(val) => bind("hero.headline_lines", val)}
          addLabel="Add line"
          error={errors.hero?.headline_lines?.message}
        />
        <Field
          label="Highlighted word (drawn in the accent colour, if present in a headline line)"
          error={errors.hero?.highlight?.message}
        >
          <Input {...register("hero.highlight")} />
        </Field>
        <Field label="Body" error={errors.hero?.body?.message}>
          <Textarea rows={3} {...register("hero.body")} />
        </Field>
        <StringList
          label="Value props"
          values={v.hero.value_props}
          onChange={(val) => bind("hero.value_props", val)}
          addLabel="Add value prop"
        />
        <Field label="Hero image">
          <ImageDropzone
            value={v.hero.image}
            onChange={(url) => bind("hero.image", url)}
          />
        </Field>
      </Section>

      <Section title="Tag ticker">
        <StringList
          label="Scrolling tags"
          values={v.ticker}
          onChange={(val) => bind("ticker", val)}
          addLabel="Add tag"
          error={errors.ticker?.message}
        />
      </Section>

      <Section title="About">
        <Field label="Eyebrow" error={errors.about?.eyebrow?.message}>
          <Input {...register("about.eyebrow")} />
        </Field>
        <Field label="Heading" error={errors.about?.heading?.message}>
          <Input {...register("about.heading")} />
        </Field>
        <Field label="Body" error={errors.about?.body?.message}>
          <Textarea rows={4} {...register("about.body")} />
        </Field>
        <Field label="Established year" error={errors.about?.established_year?.message}>
          <Input {...register("about.established_year")} />
        </Field>
        <StringList
          label="Points"
          values={v.about.points}
          onChange={(val) => bind("about.points", val)}
          addLabel="Add point"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Image 1">
            <ImageDropzone
              value={v.about.images[0] ?? ""}
              onChange={(url) =>
                bind("about.images", [url, v.about.images[1] ?? ""])
              }
            />
          </Field>
          <Field label="Image 2">
            <ImageDropzone
              value={v.about.images[1] ?? ""}
              onChange={(url) =>
                bind("about.images", [v.about.images[0] ?? "", url])
              }
            />
          </Field>
        </div>
      </Section>

      <Section title="Activities">
        <Field label="Eyebrow" error={errors.activities?.eyebrow?.message}>
          <Input {...register("activities.eyebrow")} />
        </Field>
        <Field label="Heading" error={errors.activities?.heading?.message}>
          <Input {...register("activities.heading")} />
        </Field>
        <div className="flex flex-col gap-2">
          <Label>Items</Label>
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
                placeholder="Title"
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
      </Section>

      <Section title="Benefits">
        <Field label="Eyebrow" error={errors.benefits?.eyebrow?.message}>
          <Input {...register("benefits.eyebrow")} />
        </Field>
        <Field label="Heading" error={errors.benefits?.heading?.message}>
          <Input {...register("benefits.heading")} />
        </Field>
        <div className="flex flex-col gap-3">
          <Label>Items</Label>
          {v.benefits.items.map((item, i) => {
            const update = (patch: Partial<(typeof v.benefits.items)[number]>) =>
              bind(
                "benefits.items",
                v.benefits.items.map((it, j) => (j === i ? { ...it, ...patch } : it))
              );
            return (
              <div key={item.id} className="flex flex-col gap-2 border border-border p-3">
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
      </Section>

      <Section title="Contact">
        <Field label="Eyebrow" error={errors.contact?.eyebrow?.message}>
          <Input {...register("contact.eyebrow")} />
        </Field>
        <Field label="Heading" error={errors.contact?.heading?.message}>
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
      </Section>

      <Section title="Join call-to-action">
        <Field label="Heading" error={errors.join_cta?.heading?.message}>
          <Input {...register("join_cta.heading")} />
        </Field>
        <Field label="Body" error={errors.join_cta?.body?.message}>
          <Textarea rows={2} {...register("join_cta.body")} />
        </Field>
      </Section>

      <div className="sticky bottom-0 -mx-4 border-t border-border bg-background/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
