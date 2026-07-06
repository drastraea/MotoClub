"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { BENEFIT_ICON_KEYS, type Benefit } from "@/lib/benefits-store";
import { benefitIconMap } from "@/lib/benefit-icons";

const benefitSchema = z.object({
  icon: z.enum(BENEFIT_ICON_KEYS),
  title: z.string().min(2, "Title is too short"),
  description: z.string().min(5, "Description is too short"),
});

export type BenefitFormValues = z.infer<typeof benefitSchema>;

export function BenefitFormDialog({
  open,
  onOpenChange,
  defaultValues,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues?: Omit<Benefit, "id">;
  onSubmit: (values: BenefitFormValues) => void;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BenefitFormValues>({
    resolver: zodResolver(benefitSchema),
    values: defaultValues,
  });

  const selectedIcon = watch("icon");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{defaultValues ? "Edit Benefit" : "New Benefit"}</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit((values) => {
            onSubmit(values);
            onOpenChange(false);
          })}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="icon">Icon</Label>
            <Select
              defaultValue={defaultValues?.icon}
              onValueChange={(v) => setValue("icon", v as BenefitFormValues["icon"])}
            >
              <SelectTrigger id="icon" className="w-full" aria-invalid={!!errors.icon}>
                <SelectValue placeholder="Select an icon">
                  {selectedIcon &&
                    (() => {
                      const Icon = benefitIconMap[selectedIcon];
                      return (
                        <span className="flex items-center gap-2">
                          <Icon className="size-4" /> {selectedIcon}
                        </span>
                      );
                    })()}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {BENEFIT_ICON_KEYS.map((key) => {
                  const Icon = benefitIconMap[key];
                  return (
                    <SelectItem key={key} value={key}>
                      <span className="flex items-center gap-2">
                        <Icon className="size-4" /> {key}
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {errors.icon && <p className="text-sm text-destructive">Required</p>}
          </div>

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

          <DialogFooter>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
