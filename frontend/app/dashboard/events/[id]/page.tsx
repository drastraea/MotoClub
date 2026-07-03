import { notFound } from "next/navigation";
import { CalendarDays, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { mockEvents } from "@/lib/mock-events";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = mockEvents.find((e) => e.id === id);

  if (!event) notFound();

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold tracking-wide uppercase">
        {event.title}
      </h1>

      <Card className="mt-8 max-w-2xl">
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CalendarDays className="size-4" />
            {event.dateLabel}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="size-4" />
            {event.location}
          </div>
          <p className="text-sm">{event.description}</p>
        </CardContent>
      </Card>
    </div>
  );
}
