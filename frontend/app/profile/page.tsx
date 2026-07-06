"use client";

import { useCallback } from "react";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

  const fields: [string, string][] = [
    ["Full Name", profile.name],
    ["Email", profile.email],
    ["Phone Number", profile.phoneNumber],
    ["Place of Birth", profile.placeOfBirth],
    ["Date of Birth", profile.dateofBirth],
    ["Address", profile.address],
    ["Instagram", profile.instagramUsername],
    ["Blood Type", profile.bloodType],
    ["Emergency Contact", profile.emergencyContactName],
    ["Emergency Contact Phone", profile.emergencyContactPhoneNumber],
    ["Motorbike", profile.motorbikeName],
    ["Member Since", profile.created_at],
  ];

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

      <Card className="mt-8">
        <CardContent>
          <dl className="grid gap-6 sm:grid-cols-2">
            {fields.map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                  {label}
                </dt>
                <dd className="mt-1 text-sm">{value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
