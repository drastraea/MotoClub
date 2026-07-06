"use client";

import { useCallback } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { api } from "@/lib/api";
import { useApiData } from "@/hooks/useApiData";

export function AnnouncementsSection() {
  // Login-gated: only rendered when a logged-in member+ successfully loads data;
  // logged-out / visitor users (401/403) get nothing.
  const { data } = useApiData(useCallback(() => api.getAnnouncements(), []), []);
  if (!data || data.length === 0) return null;

  return (
    <section id="announcements" className="scroll-mt-24 py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="text-center">
          <span className="text-xs font-semibold tracking-[0.3em] text-primary uppercase">
            From the Club
          </span>
          <h2 className="font-heading mt-2 text-3xl font-bold tracking-wide uppercase">
            Announcements
          </h2>
        </div>

        <div className="mt-8 flex flex-col gap-4">
          {data.map((item) => (
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
        </div>
      </div>
    </section>
  );
}
