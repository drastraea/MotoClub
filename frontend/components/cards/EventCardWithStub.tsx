"use client";

import { EventCard, type EventCardProps } from "@/components/cards/EventCard";
import { useEventStub } from "@/hooks/useEventStub";

// Merges in the localStorage-only imageLink stub (see lib/event-stubs.ts)
// until the backend has a real ImageLink field on Event.
export function EventCardWithStub(props: EventCardProps & { id: string }) {
  const stub = useEventStub(props.id);
  return <EventCard {...props} imageLink={stub.imageLink} />;
}
