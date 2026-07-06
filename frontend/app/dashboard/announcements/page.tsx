"use client";

import { useCallback } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { api } from "@/lib/api";
import { useApiData } from "@/hooks/useApiData";

export default function AnnouncementsPage() {
  const { data: announcements, loading, error } = useApiData(
    useCallback(() => api.getAnnouncements(), []),
    []
  );

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold tracking-wide uppercase">
        Announcements
      </h1>

      {loading && <p className="mt-8 text-sm text-muted-foreground">Loading…</p>}
      {error && <p className="mt-8 text-sm text-destructive">{error}</p>}

      <div className="mt-8 flex flex-col gap-4">
        {announcements?.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
              <CardDescription className="flex flex-col gap-1">
                <span>{item.last_updated_at}</span>
                <span>{item.description}</span>
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
        {announcements && announcements.length === 0 && !loading && (
          <p className="text-sm text-muted-foreground">No announcements yet.</p>
        )}
      </div>
    </div>
  );
}
