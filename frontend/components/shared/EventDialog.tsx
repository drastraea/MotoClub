"use client";

import { useCallback } from "react";
import { CalendarDays, CalendarPlus, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useApiData } from "@/hooks/useApiData";
import { api } from "@/lib/api";
import { googleCalendarUrl } from "@/lib/calendar";
import { daysUntil, formatEventDate, relativeDays, todayISO } from "@/lib/dash-utils";

// Event details in a popup. Pass the id of the event to show, or null to close.
export function EventDialog({ id, onClose }: { id: string | null; onClose: () => void }) {
  return (
    <Dialog open={id !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        {id !== null && <EventDetails key={id} id={id} />}
      </DialogContent>
    </Dialog>
  );
}

function EventDetails({ id }: { id: string }) {
  const { data: event, loading, error } = useApiData(
    useCallback(() => api.getEvent(id), [id]),
    [id]
  );

  if (loading || !event) {
    return (
      <>
        <DialogTitle className="pr-8">{error ? "Event unavailable" : "Loading event…"}</DialogTitle>
        {error ? (
          <p className="text-destructive">{error}</p>
        ) : (
          <div className="h-40 animate-pulse rounded-lg bg-muted" />
        )}
      </>
    );
  }

  const upcoming = event.date >= todayISO();

  return (
    <>
      {/* Right padding keeps a long title clear of the close button. */}
      <DialogTitle className="pr-8 text-2xl leading-tight font-bold tracking-wide uppercase">
        {event.title}
      </DialogTitle>
      {event.image_link && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={event.image_link}
          alt=""
          className="max-h-[45vh] w-full rounded-lg bg-muted object-contain"
        />
      )}
      <div className="flex flex-col gap-2 text-muted-foreground">
        <span className="flex items-center gap-2">
          <CalendarDays className="size-4 shrink-0" />
          <span>
            {formatEventDate(event.date, event.time)}
            {upcoming && <span className="text-foreground/70"> · {relativeDays(daysUntil(event.date))}</span>}
          </span>
        </span>
        {event.location && (
          <span className="flex items-center gap-2">
            <MapPin className="size-4 shrink-0" />
            {event.location}
          </span>
        )}
      </div>
      {event.description && <p className="break-words whitespace-pre-line">{event.description}</p>}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Badge variant="secondary">{event.is_public ? "Open to all" : "Members only"}</Badge>
        {upcoming && (
          <Button
            nativeButton={false}
            render={
              <a
                href={googleCalendarUrl(event.title, event.date, event.location, event.time)}
                target="_blank"
                rel="noreferrer"
              />
            }
          >
            <CalendarPlus className="size-4" />
            Add to calendar
          </Button>
        )}
      </div>
    </>
  );
}
