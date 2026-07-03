"use client";

import { use, useCallback } from "react";
import { CalendarDays, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";
import { useApiData } from "@/hooks/useApiData";

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: event, loading, error } = useApiData(
    useCallback(() => api.getEvent(id), [id]),
    [id]
  );

  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (error || !event) return <p className="text-sm text-destructive">{error ?? "Event not found."}</p>;

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold tracking-wide uppercase">
        {event.title}
      </h1>

      <Card className="mt-8 max-w-2xl">
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CalendarDays className="size-4" />
            {event.date}
          </div>
          {event.location && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="size-4" />
              {event.location}
            </div>
          )}
          <p className="text-sm">{event.description}</p>
        </CardContent>
      </Card>
    </div>
  );
}
