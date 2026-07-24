"use client";

import Link from "next/link";
import {
  UserCheck,
  Users,
  CalendarDays,
  Megaphone,
  Image as ImageIcon,
  Award,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";
import { useApiData } from "@/hooks/useApiData";
import { useBenefits } from "@/hooks/useBenefits";

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
  return <StatCardView href={href} icon={Icon} label={label} loading={loading} error={!!error} value={data} />;
}

function StatCardView({
  href,
  icon: Icon,
  label,
  value,
  loading,
  error,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  value: number | null | undefined;
  loading: boolean;
  error: boolean;
}) {
  return (
    <Link href={href} className="group">
      <Card className="h-full transition-colors group-hover:border-primary/40">
        <CardContent className="flex items-center gap-4">
          <div className="shape-corner-sm flex size-12 shrink-0 items-center justify-center bg-primary/10 text-primary">
            <Icon className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-heading text-2xl font-bold">
              {loading ? (
                <span className="inline-block h-7 w-10 animate-pulse rounded bg-muted align-middle" />
              ) : error ? (
                "—"
              ) : (
                value
              )}
            </p>
            <p className="truncate text-sm text-muted-foreground">{label}</p>
          </div>
          <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
        </CardContent>
      </Card>
    </Link>
  );
}

export default function AdminHome() {
  const benefits = useBenefits();

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold tracking-wide uppercase">
        Admin Dashboard
      </h1>
      <p className="mt-2 text-muted-foreground">Club overview — tap a card to manage that section.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
        <StatCard
          href="/admin/gallery"
          icon={ImageIcon}
          label="Gallery Photos"
          fetcher={() => api.getGallery().then((items) => items.length)}
        />
        <StatCardView
          href="/admin/benefits"
          icon={Award}
          label="Membership Benefits"
          value={benefits.length}
          loading={false}
          error={false}
        />
      </div>
    </div>
  );
}
