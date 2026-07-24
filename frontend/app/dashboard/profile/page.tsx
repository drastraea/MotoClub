"use client";

import { useCallback } from "react";
import Link from "next/link";
import { Pencil, CalendarDays } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProfileDetails } from "@/components/shared/ProfileDetails";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useApiData } from "@/hooks/useApiData";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

export default function ProfilePage() {
  const { user } = useAuth();
  const memberId = user?.id;

  const { data: profile, loading, error } = useApiData(
    useCallback(() => {
      if (!memberId) return Promise.reject(new Error("Not signed in"));
      return api.getProfile(memberId);
    }, [memberId]),
    [memberId]
  );

  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (error || !profile) return <p className="text-sm text-destructive">{error ?? "Profile not found."}</p>;

  return (
    <div>
      <Card>
        <CardContent className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:text-left">
          <Avatar className="size-16 shrink-0 sm:size-20">
            <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary sm:text-xl">
              {initials(profile.name)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <h1 className="font-heading truncate text-2xl font-bold tracking-wide uppercase sm:text-3xl">
              {profile.name}
            </h1>
            <div className="mt-1 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-muted-foreground sm:justify-start">
              <span className="truncate">{profile.email}</span>
              <span className="flex items-center gap-1.5">
                <CalendarDays className="size-3.5" />
                Member since {profile.created_at}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <Badge>{profile.status}</Badge>
            <Button
              size="sm"
              variant="outline"
              nativeButton={false}
              render={<Link href="/dashboard/profile/edit" />}
            >
              <Pencil className="size-4" />
              Edit
            </Button>
          </div>
        </CardContent>
      </Card>

      <ProfileDetails profile={profile} />
    </div>
  );
}
