"use client";

import { useCallback } from "react";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProfileDetails } from "@/components/shared/ProfileDetails";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useApiData } from "@/hooks/useApiData";

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
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-3xl font-bold tracking-wide uppercase">
          My Profile
        </h1>
        <div className="flex items-center gap-3">
          <Badge>{profile.status}</Badge>
          <Button
            size="sm"
            variant="outline"
            nativeButton={false}
            render={<Link href="/profile/edit" />}
          >
            <Pencil className="size-4" />
            Edit
          </Button>
        </div>
      </div>

      <ProfileDetails profile={profile} />
    </div>
  );
}
