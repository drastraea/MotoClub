"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  BenefitFormDialog,
  type BenefitFormValues,
} from "@/components/shared/BenefitFormDialog";
import { useBenefits } from "@/hooks/useBenefits";
import { benefitIconMap } from "@/lib/benefit-icons";
import { createBenefit, updateBenefit, deleteBenefit, type Benefit } from "@/lib/benefits-store";

export default function AdminBenefitsPage() {
  const benefits = useBenefits();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Benefit | null>(null);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (benefit: Benefit) => {
    setEditing(benefit);
    setDialogOpen(true);
  };

  const handleSubmit = (values: BenefitFormValues) => {
    if (editing) {
      updateBenefit(editing.id, values);
      toast.success("Benefit updated");
    } else {
      createBenefit(values);
      toast.success("Benefit created");
    }
  };

  const handleDelete = (id: string) => {
    deleteBenefit(id);
    toast.success("Benefit deleted");
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-3xl font-bold tracking-wide uppercase">
          Membership Benefits
        </h1>
        <Button size="sm" onClick={openCreate}>
          <Plus className="size-4" />
          New Benefit
        </Button>
      </div>
      <p className="mt-2 text-muted-foreground">
        Shown on the homepage&apos;s &quot;Why Join&quot; section.
      </p>

      <div className="mt-8 flex flex-col gap-4">
        {benefits.map((benefit) => {
          const Icon = benefitIconMap[benefit.icon];
          return (
            <Card key={benefit.id}>
              <CardHeader className="sm:grid-cols-[auto_1fr_auto] sm:items-center">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/30">
                  <Icon className="size-5 text-primary" />
                </div>
                <div>
                  <CardTitle>{benefit.title}</CardTitle>
                  <CardDescription>{benefit.description}</CardDescription>
                </div>
                <div className="mt-4 flex gap-2 sm:mt-0">
                  <Button size="sm" variant="outline" onClick={() => openEdit(benefit)}>
                    <Pencil className="size-4" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(benefit.id)}>
                    <Trash2 className="size-4" />
                    Delete
                  </Button>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      <BenefitFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        defaultValues={editing ?? undefined}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
