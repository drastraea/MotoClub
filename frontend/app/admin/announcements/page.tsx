"use client";

import { useCallback, useState } from "react";
import { Megaphone, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashHeader } from "@/components/dashboard/DashHeader";
import { EmptyState, ListSkeleton } from "@/components/dashboard/EmptyState";
import { Panel, PanelList } from "@/components/dashboard/Panel";
import {
  AnnouncementFormDialog,
  type AnnouncementFormValues,
} from "@/components/shared/AnnouncementFormDialog";
import { api, type Announcement } from "@/lib/api";
import { useApiData } from "@/hooks/useApiData";
import { useOpenOnNewParam } from "@/hooks/useOpenOnNewParam";

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
  useOpenOnNewParam(openCreate);

  const openEdit = (announcement: Announcement) => {
    setEditing(announcement);
    setDialogOpen(true);
  };

  const handleSubmit = async (values: AnnouncementFormValues) => {
    try {
      if (editing) {
        await api.updateAnnouncement(editing.id, values.title, values.description, values.is_public);
        toast.success("Announcement updated");
      } else {
        await api.createAnnouncement(values.title, values.description, values.is_public);
        toast.success("Announcement created");
      }
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    }
  };

  const handleDelete = async (a: Announcement) => {
    if (!window.confirm(`Delete "${a.title}"?`)) return;
    try {
      await api.deleteAnnouncement(a.id);
      toast.success("Announcement deleted");
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <DashHeader
        title="Announcements"
        description="News for members. Mark one public to also show it on the landing page."
        actions={
          <Button size="sm" onClick={openCreate}>
            <Plus className="size-4" />
            New announcement
          </Button>
        }
      />

      <Panel>
        {loading && <ListSkeleton rows={3} />}
        {error && <p className="px-5 py-4 text-sm text-destructive">{error}</p>}
        {announcements && announcements.length === 0 && (
          <EmptyState
            icon={Megaphone}
            title="No announcements yet"
            description="Post the first update for the club."
            action={
              <Button size="sm" onClick={openCreate}>
                <Plus className="size-4" />
                New announcement
              </Button>
            }
          />
        )}
        <PanelList>
          {announcements?.map((a) => (
            <div
              key={a.id}
              className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium">{a.title}</p>
                  {a.is_public && <Badge variant="secondary">Public</Badge>}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{a.last_updated_at}</p>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{a.description}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button size="sm" variant="outline" onClick={() => openEdit(a)}>
                  <Pencil className="size-4" />
                  Edit
                </Button>
                <Button
                  size="icon-sm"
                  variant="outline"
                  aria-label={`Delete ${a.title}`}
                  onClick={() => handleDelete(a)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </PanelList>
      </Panel>

      <AnnouncementFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        defaultValues={
          editing
            ? {
                title: editing.title,
                description: editing.description,
                is_public: editing.is_public,
              }
            : undefined
        }
        onSubmit={handleSubmit}
      />
    </div>
  );
}
