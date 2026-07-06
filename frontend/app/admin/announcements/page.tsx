"use client";

import { useCallback, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  AnnouncementFormDialog,
  type AnnouncementFormValues,
} from "@/components/shared/AnnouncementFormDialog";
import { api, type Announcement } from "@/lib/api";
import { useApiData } from "@/hooks/useApiData";

export default function AdminAnnouncementsPage() {
  const { data: announcements, loading, error, reload } = useApiData(
    useCallback(() => api.getAnnouncements(), []),
    []
  );
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

  const handleSubmit = async (values: AnnouncementFormValues) => {
    try {
      if (editing) {
        await api.updateAnnouncement(editing.id, values.title, values.description);
        toast.success("Announcement updated");
      } else {
        await api.createAnnouncement(values.title, values.description);
        toast.success("Announcement created");
      }
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteAnnouncement(id);
      toast.success("Announcement deleted");
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
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

      {loading && <p className="mt-4 text-sm text-muted-foreground">Loading…</p>}
      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      <div className="mt-8 flex flex-col gap-4">
        {announcements?.map((a) => (
          <Card key={a.id}>
            <CardHeader className="sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <CardTitle>{a.title}</CardTitle>
                <CardDescription className="flex flex-col gap-1">
                  <span>{a.last_updated_at}</span>
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
        defaultValues={
          editing ? { title: editing.title, description: editing.description } : undefined
        }
        onSubmit={handleSubmit}
      />
    </div>
  );
}
