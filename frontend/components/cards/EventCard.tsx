import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export type EventCardProps = {
  id?: string;
  title: string;
  date: string;
  location: string;
  href?: string;
};

export function EventCard({ title, date, location, href }: EventCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {href ? (
            <Link href={href} className="hover:text-primary">
              {title}
            </Link>
          ) : (
            title
          )}
        </CardTitle>
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
