"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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

const announcementSchema = z.object({
  title: z.string().min(2, "Title is too short"),
  description: z.string().min(5, "Description is too short"),
  is_public: z.boolean().default(false),
});

export type AnnouncementFormValues = z.output<typeof announcementSchema>;

export function AnnouncementFormDialog({
  open,
  onOpenChange,
  defaultValues,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues?: AnnouncementFormValues;
  onSubmit: (values: AnnouncementFormValues) => void;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<z.input<typeof announcementSchema>, unknown, AnnouncementFormValues>({
    resolver: zodResolver(announcementSchema),
    values: defaultValues,
  });

  const isPublic = watch("is_public");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{defaultValues ? "Edit Announcement" : "New Announcement"}</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit((values) => {
            onSubmit(values);
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
              rows={4}
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
          <DialogFooter>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
