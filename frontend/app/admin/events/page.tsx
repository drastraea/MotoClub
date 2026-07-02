"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  EventFormDialog,
  type EventFormValues,
} from "@/components/shared/EventFormDialog";

type AdminEvent = EventFormValues & { id: string };

// TODO: Replace with GET /events (see api_contract.json)
const initialEvents: AdminEvent[] = [
  { id: "1", title: "Sunday Morning Ride", description: "Easy group ride ending with breakfast.", date: "2026-07-06T07:00", location: "Club HQ" },
  { id: "2", title: "Charity Run for Local Shelter", description: "Raising funds for the local animal shelter.", date: "2026-07-19T09:00", location: "City Park" },
  { id: "3", title: "Annual Members Meetup", description: "Club-wide meetup and planning session.", date: "2026-08-02T17:00", location: "Riverside Grounds" },
];

export default function AdminEventsPage() {
  const [events, setEvents] = useState(initialEvents);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminEvent | null>(null);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (event: AdminEvent) => {
    setEditing(event);
    setDialogOpen(true);
  };

  // TODO: Replace with POST /events / PUT /events/:id (see api_contract.json)
  const handleSubmit = (values: EventFormValues) => {
    if (editing) {
      setEvents((prev) => prev.map((e) => (e.id === editing.id ? { ...e, ...values } : e)));
      toast.success("Event updated");
    } else {
      setEvents((prev) => [...prev, { ...values, id: crypto.randomUUID() }]);
      toast.success("Event created");
    }
  };

  // TODO: Replace with DELETE /events/:id (see api_contract.json)
  const handleDelete = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    toast.success("Event deleted");
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

      <div className="mt-8 flex flex-col gap-4">
        {events.map((event) => (
          <Card key={event.id}>
            <CardHeader className="sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <CardTitle>{event.title}</CardTitle>
                <CardDescription className="flex flex-col gap-1">
                  <span>{event.date.replace("T", " ")}</span>
                  {event.location && <span>{event.location}</span>}
                </CardDescription>
              </div>
              <div className="mt-4 flex gap-2 sm:mt-0">
                <Button size="sm" variant="outline" onClick={() => openEdit(event)}>
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
        defaultValues={editing ?? undefined}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
