"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  AnnouncementFormDialog,
  type AnnouncementFormValues,
} from "@/components/shared/AnnouncementFormDialog";

type Announcement = AnnouncementFormValues & { id: string; date: string };

// TODO: Replace with GET /announcements (see api_contract.json)
const initialAnnouncements: Announcement[] = [
  { id: "1", title: "New Merch Drop", description: "Club jackets and patches are back in stock at HQ.", date: "Jun 28, 2026" },
  { id: "2", title: "Road Safety Briefing", description: "Mandatory briefing before the charity run this month.", date: "Jun 20, 2026" },
  { id: "3", title: "Membership Dues Reminder", description: "Annual dues are due by the end of the month.", date: "Jun 10, 2026" },
];

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (announcement: Announcement) => {
    setEditing(announcement);
    setDialogOpen(true);
  };

  // TODO: Replace with POST /announcements / PUT /announcements/:id
  const handleSubmit = (values: AnnouncementFormValues) => {
    if (editing) {
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === editing.id ? { ...a, ...values } : a))
      );
      toast.success("Announcement updated");
    } else {
      setAnnouncements((prev) => [
        { ...values, id: crypto.randomUUID(), date: new Date().toLocaleDateString() },
        ...prev,
      ]);
      toast.success("Announcement created");
    }
  };

  // TODO: Replace with DELETE /announcements/:id
  const handleDelete = (id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    toast.success("Announcement deleted");
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-3xl font-bold tracking-wide uppercase">
          Announcement Management
        </h1>
        <Button size="sm" onClick={openCreate}>
          <Plus className="size-4" />
          New Announcement
        </Button>
      </div>

      <div className="mt-8 flex flex-col gap-4">
        {announcements.map((a) => (
          <Card key={a.id}>
            <CardHeader className="sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <CardTitle>{a.title}</CardTitle>
                <CardDescription className="flex flex-col gap-1">
                  <span>{a.date}</span>
                  <span>{a.description}</span>
                </CardDescription>
              </div>
              <div className="mt-4 flex gap-2 sm:mt-0">
                <Button size="sm" variant="outline" onClick={() => openEdit(a)}>
                  <Pencil className="size-4" />
                  Edit
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDelete(a.id)}>
                  <Trash2 className="size-4" />
                  Delete
                </Button>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      <AnnouncementFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        defaultValues={editing ?? undefined}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
