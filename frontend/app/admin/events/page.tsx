"use client";

import { useCallback, useState } from "react";
import { CalendarDays, ImageIcon, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashHeader } from "@/components/dashboard/DashHeader";
import { EmptyState, ListSkeleton } from "@/components/dashboard/EmptyState";
import { Panel, PanelList } from "@/components/dashboard/Panel";
import { EventFormDialog, type EventFormValues } from "@/components/shared/EventFormDialog";
import { api, type EventSummary } from "@/lib/api";
import { useApiData } from "@/hooks/useApiData";
import { useOpenOnNewParam } from "@/hooks/useOpenOnNewParam";
import { formatDate, todayISO } from "@/lib/dash-utils";

function DateBlock({ date }: { date: string }) {
  const [, month, day] = date.split("-");
  const monthName = new Date(2000, Number(month) - 1, 1).toLocaleString("en-GB", {
    month: "short",
  });
  return (
    <div className="flex size-12 shrink-0 flex-col items-center justify-center rounded-lg bg-muted leading-none">
      <span className="text-base font-semibold tabular-nums">{Number(day)}</span>
      <span className="mt-0.5 text-[10px] text-muted-foreground uppercase">{monthName}</span>
    </div>
  );
}

function EventBadges({ event, past }: { event: EventSummary; past: boolean }) {
  return (
    <div className="mt-1.5 flex flex-wrap gap-1.5">
      {past && <Badge variant="outline">Past</Badge>}
      {event.is_public && <Badge variant="secondary">Public</Badge>}
      {event.image_link && (
        <Badge variant="secondary">
          <ImageIcon /> Has banner
        </Badge>
      )}
    </div>
  );
}

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
  useOpenOnNewParam(openCreate);

  const openEdit = async (id: string) => {
    try {
      const detail = await api.getEvent(id);
      setEditingId(id);
      setEditingValues({
        title: detail.title,
        description: detail.description,
        date: detail.date,
        location: detail.location ?? undefined,
        image_link: detail.image_link ?? undefined,
        is_public: detail.is_public,
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

  const handleDelete = async (event: EventSummary) => {
    if (!window.confirm(`Delete "${event.title}"?`)) return;
    try {
      await api.deleteEvent(event.id);
      toast.success("Event deleted");
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const today = todayISO();

  return (
    <div className="flex flex-col gap-6">
      <DashHeader
        title="Events"
        description="Rides, meetups and gatherings shown on the landing page and member home."
        actions={
          <Button size="sm" onClick={openCreate}>
            <Plus className="size-4" />
            New event
          </Button>
        }
      />

      <Panel>
        {loading && <ListSkeleton rows={4} />}
        {error && <p className="px-5 py-4 text-sm text-destructive">{error}</p>}
        {events && events.length === 0 && (
          <EmptyState
            icon={CalendarDays}
            title="No events yet"
            description="Create the first ride or meetup for members."
            action={
              <Button size="sm" onClick={openCreate}>
                <Plus className="size-4" />
                New event
              </Button>
            }
          />
        )}
        <PanelList>
          {events?.map((event) => (
            <div
              key={event.id}
              className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-center gap-4">
                <DateBlock date={event.date} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{event.title}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(event.date)}</p>
                  <EventBadges event={event} past={event.date < today} />
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button size="sm" variant="outline" onClick={() => openEdit(event.id)}>
                  <Pencil className="size-4" />
                  Edit
                </Button>
                <Button
                  size="icon-sm"
                  variant="outline"
                  aria-label={`Delete ${event.title}`}
                  onClick={() => handleDelete(event)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </PanelList>
      </Panel>

      <EventFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        defaultValues={editingValues}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
