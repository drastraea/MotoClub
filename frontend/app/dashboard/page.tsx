import Link from "next/link";
import { Megaphone, CalendarDays, Users } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// TODO: Replace counts with real data from GET /announcements, GET /events, GET /members
const stats = [
  { href: "/dashboard/announcements", icon: Megaphone, label: "New Announcements", value: 3 },
  { href: "/dashboard/events", icon: CalendarDays, label: "Upcoming Events", value: 5 },
  { href: "/dashboard/members", icon: Users, label: "Club Members", value: 128 },
];

export default function DashboardHome() {
  return (
    <div>
      <h1 className="font-heading text-3xl font-bold tracking-wide uppercase">
        Dashboard
      </h1>
      <p className="mt-2 text-muted-foreground">
        Here&apos;s what&apos;s happening in the club.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        {stats.map(({ href, icon: Icon, label, value }) => (
          <Link key={href} href={href}>
            <Card>
              <CardHeader>
                <Icon className="size-6 text-primary" />
                <CardTitle className="mt-2 text-3xl">{value}</CardTitle>
                <CardDescription>{label}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
