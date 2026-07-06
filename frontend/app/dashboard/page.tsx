"use client";

import { useCallback } from "react";
import Link from "next/link";
import { Megaphone, CalendarDays, User } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { api } from "@/lib/api";
import { useApiData } from "@/hooks/useApiData";

export default function DashboardHome() {
  const { data } = useApiData(
    useCallback(async () => {
      const [events, announcements] = await Promise.all([
        api.getEvents().catch(() => []),
        api.getAnnouncements().catch(() => []),
      ]);
      return { events: events.length, announcements: announcements.length };
    }, []),
    []
  );

  const stats = [
    {
      href: "/dashboard/announcements",
      icon: Megaphone,
      label: "Announcements",
      value: data?.announcements ?? "—",
    },
    {
      href: "/dashboard/events",
      icon: CalendarDays,
      label: "Upcoming Events",
      value: data?.events ?? "—",
    },
    { href: "/dashboard/profile", icon: User, label: "My Profile", value: "View" },
  ];

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
