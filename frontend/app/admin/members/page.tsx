"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

type Registration = {
  id: string;
  name: string;
  email: string;
  motorbikeName: string;
  submittedAt: string;
};

// TODO: Replace with GET /members/registration (see api_contract.json)
const initialRegistrations: Registration[] = [
  { id: "1", name: "Morgan Lee", email: "morgan.lee@example.com", motorbikeName: "Desert Hawk", submittedAt: "2026-06-28" },
  { id: "2", name: "Taylor Reed", email: "taylor.reed@example.com", motorbikeName: "Black Comet", submittedAt: "2026-06-29" },
  { id: "3", name: "Jamie Fox", email: "jamie.fox@example.com", motorbikeName: "Steel Wolf", submittedAt: "2026-07-01" },
  { id: "4", name: "Drew Ashford", email: "drew.ashford@example.com", motorbikeName: "Iron Comet", submittedAt: "2026-07-02" },
];

export default function AdminMembersPage() {
  const [registrations, setRegistrations] = useState(initialRegistrations);

  // TODO: Replace with POST /members/registration/:id { action, remarks }
  // (see api_contract.json)
  const respond = (id: string, name: string, action: "ACCEPT" | "REJECT") => {
    setRegistrations((prev) => prev.filter((r) => r.id !== id));
    toast.success(action === "ACCEPT" ? `${name} approved` : `${name} rejected`);
  };

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold tracking-wide uppercase">
        Membership Approval
      </h1>
      <p className="mt-2 text-muted-foreground">
        {registrations.length} pending application{registrations.length === 1 ? "" : "s"}
      </p>

      <div className="mt-8 flex flex-col gap-4">
        {registrations.length === 0 && (
          <p className="text-sm text-muted-foreground">No pending applications.</p>
        )}
        {registrations.map((r) => (
          <Card key={r.id}>
            <CardHeader className="sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <CardTitle>{r.name}</CardTitle>
                <CardDescription className="flex flex-col gap-1">
                  <span>{r.email}</span>
                  <span>Motorbike: {r.motorbikeName}</span>
                  <span>Submitted {r.submittedAt}</span>
                </CardDescription>
              </div>
              <div className="mt-4 flex gap-2 sm:mt-0">
                <Button size="sm" onClick={() => respond(r.id, r.name, "ACCEPT")}>
                  <Check className="size-4" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => respond(r.id, r.name, "REJECT")}
                >
                  <X className="size-4" />
                  Reject
                </Button>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
