"use client";

import Link from "next/link";
import { UserCheck, Users, CalendarDays, Megaphone, type LucideIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { api } from "@/lib/api";
import { useApiData } from "@/hooks/useApiData";

// Each card owns a dedicated count endpoint and its own loading state, so a
// number never renders until it's real — no misleading 0 while fetching.
function StatCard({
  href,
  icon: Icon,
  label,
  fetcher,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  fetcher: () => Promise<number>;
}) {
  const { data, loading, error } = useApiData(fetcher, []);

  return (
    <Link href={href}>
      <Card>
        <CardHeader>
          <Icon className="size-6 text-primary" />
          <CardTitle className="mt-2 text-3xl">
            {loading ? (
              <span className="inline-block h-8 w-12 animate-pulse rounded bg-muted align-middle" />
            ) : error ? (
              "—"
            ) : (
              data
            )}
          </CardTitle>
          <CardDescription>{label}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}

export default function AdminHome() {
  return (
    <div>
      <h1 className="font-heading text-3xl font-bold tracking-wide uppercase">
        Admin Dashboard
      </h1>
      <p className="mt-2 text-muted-foreground">Club overview and quick actions.</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          href="/admin/members"
          icon={UserCheck}
          label="Pending Applications"
          fetcher={api.getRegistrationCount}
        />
        <StatCard href="/admin/users" icon={Users} label="Total Members" fetcher={api.getMemberCount} />
        <StatCard
          href="/admin/events"
          icon={CalendarDays}
          label="Upcoming Events"
          fetcher={api.getEventCount}
        />
        <StatCard
          href="/admin/announcements"
          icon={Megaphone}
          label="Announcements"
          fetcher={api.getAnnouncementCount}
        />
      </div>
    </div>
  );
}
