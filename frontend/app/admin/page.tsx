import Link from "next/link";
import { UserCheck, Users, CalendarDays, Megaphone } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// TODO: Replace counts with real data (GET /members/registration/count,
// GET /members, GET /events, GET /announcements)
const stats = [
  { href: "/admin/members", icon: UserCheck, label: "Pending Applications", value: 4 },
  { href: "/admin/users", icon: Users, label: "Total Members", value: 128 },
  { href: "/admin/events", icon: CalendarDays, label: "Upcoming Events", value: 5 },
  { href: "/admin/announcements", icon: Megaphone, label: "Announcements", value: 3 },
];

export default function AdminHome() {
  return (
    <div>
      <h1 className="font-heading text-3xl font-bold tracking-wide uppercase">
        Admin Dashboard
      </h1>
      <p className="mt-2 text-muted-foreground">Club overview and quick actions.</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
