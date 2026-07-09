"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const eventSchema = z.object({
  title: z.string().min(2, "Title is too short"),
  description: z.string().min(5, "Description is too short"),
  date: z.string().min(1, "Required"),
  location: z.string().optional(),
  is_public: z.boolean().default(false),
});

export type EventFormValues = z.output<typeof eventSchema>;

// imageLink (banner) is still a browser-only stub — the backend Event model has
// no image field yet. See lib/event-stubs.ts.
export type EventStubValues = {
  imageLink?: string;
};

export function EventFormDialog({
  open,
  onOpenChange,
  defaultValues,
  defaultStubValues,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues?: EventFormValues;
  defaultStubValues?: EventStubValues;
  onSubmit: (values: EventFormValues, stub: EventStubValues) => void;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<z.input<typeof eventSchema> & EventStubValues, unknown, EventFormValues & EventStubValues>({
    resolver: zodResolver(eventSchema),
    values: defaultValues && { ...defaultValues, ...defaultStubValues },
  });

  const isPublic = watch("is_public");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{defaultValues ? "Edit Event" : "New Event"}</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(({ imageLink, ...values }) => {
            onSubmit(values, { imageLink });
            onOpenChange(false);
          })}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? "title-error" : undefined}
              {...register("title")}
            />
            {errors.title && (
              <p id="title-error" className="text-sm text-destructive">
                {errors.title.message}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={3}
              aria-invalid={!!errors.description}
              aria-describedby={errors.description ? "description-error" : undefined}
              {...register("description")}
            />
            {errors.description && (
              <p id="description-error" className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            {/* Backend stores date-only (YYYY-MM-DD, Asia/Jakarta) - see
                backend/internal/util/datetime.go. No time-of-day field
                exists yet on the real Event model. */}
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              aria-invalid={!!errors.date}
              aria-describedby={errors.date ? "date-error" : undefined}
              {...register("date")}
            />
            {errors.date && (
              <p id="date-error" className="text-sm text-destructive">
                {errors.date.message}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="location">Location</Label>
            <Input id="location" {...register("location")} />
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="is_public"
              checked={!!isPublic}
              onCheckedChange={(checked) => setValue("is_public", checked)}
            />
            <Label htmlFor="is_public" className="font-normal">
              Public (visible to non-members on the landing page)
            </Label>
          </div>

          <div className="flex flex-col gap-1.5 rounded-lg border border-dashed border-border p-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Info className="size-3.5" />
              Banner image is stored in this browser only (not on the server yet)
            </div>
            <Label htmlFor="imageLink">Banner Image URL</Label>
            <Input id="imageLink" placeholder="https://..." {...register("imageLink")} />
          </div>

          <DialogFooter>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
