"use client";

import { useCallback } from "react";
import Link from "next/link";
import { UserCheck, Users, CalendarDays, Megaphone } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { api } from "@/lib/api";
import { useApiData } from "@/hooks/useApiData";

export default function AdminHome() {
  const { data } = useApiData(
    useCallback(async () => {
      const [pending, members, events, announcements] = await Promise.all([
        api.getRegistrationCount().catch(() => 0),
        api.getMembers().catch(() => []),
        api.getEvents().catch(() => []),
        api.getAnnouncements().catch(() => []),
      ]);
      return {
        pending,
        members: members.length,
        events: events.length,
        announcements: announcements.length,
      };
    }, []),
    []
  );

  const stats = [
    {
      href: "/admin/members",
      icon: UserCheck,
      label: "Pending Applications",
      value: data?.pending ?? "—",
    },
    { href: "/admin/users", icon: Users, label: "Total Members", value: data?.members ?? "—" },
    {
      href: "/admin/events",
      icon: CalendarDays,
      label: "Upcoming Events",
      value: data?.events ?? "—",
    },
    {
      href: "/admin/announcements",
      icon: Megaphone,
      label: "Announcements",
      value: data?.announcements ?? "—",
    },
  ];

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
