import { CalendarDays, MapPin } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export type EventCardProps = {
  title: string;
  date: string;
  location: string;
};

export function EventCard({ title, date, location }: EventCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription className="mt-2 flex flex-col gap-1">
          <span className="flex items-center gap-2">
            <CalendarDays className="size-4" />
            {date}
          </span>
          <span className="flex items-center gap-2">
            <MapPin className="size-4" />
            {location}
          </span>
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
