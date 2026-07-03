"use client";

import { useCallback, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  EventFormDialog,
  type EventFormValues,
} from "@/components/shared/EventFormDialog";
import { api } from "@/lib/api";
import { useApiData } from "@/hooks/useApiData";

export default function AdminEventsPage() {
  const { data: events, loading, error, reload } = useApiData(
    useCallback(() => api.getEvents(), []),
    []
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValues, setEditingValues] = useState<EventFormValues | undefined>(undefined);

  const openCreate = () => {
    setEditingId(null);
    setEditingValues(undefined);
    setDialogOpen(true);
  };

  const openEdit = async (id: string) => {
    try {
      const detail = await api.getEvent(id);
      setEditingId(id);
      setEditingValues({
        title: detail.title,
        description: detail.description,
        date: detail.date,
        location: detail.location ?? undefined,
      });
      setDialogOpen(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load event");
    }
  };

  const handleSubmit = async (values: EventFormValues) => {
    try {
      if (editingId) {
        await api.updateEvent(editingId, values);
        toast.success("Event updated");
      } else {
        await api.createEvent(values);
        toast.success("Event created");
      }
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteEvent(id);
      toast.success("Event deleted");
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-3xl font-bold tracking-wide uppercase">
          Event Management
        </h1>
        <Button size="sm" onClick={openCreate}>
          <Plus className="size-4" />
          New Event
        </Button>
      </div>

      {loading && <p className="mt-4 text-sm text-muted-foreground">Loading…</p>}
      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      <div className="mt-8 flex flex-col gap-4">
        {events?.map((event) => (
          <Card key={event.id}>
            <CardHeader className="sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <CardTitle>{event.title}</CardTitle>
                <CardDescription>{event.date}</CardDescription>
              </div>
              <div className="mt-4 flex gap-2 sm:mt-0">
                <Button size="sm" variant="outline" onClick={() => openEdit(event.id)}>
                  <Pencil className="size-4" />
                  Edit
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDelete(event.id)}>
                  <Trash2 className="size-4" />
                  Delete
                </Button>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      <EventFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        defaultValues={editingValues}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
