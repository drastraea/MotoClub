"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// TODO: There is no landing-page-content endpoint in api_contract.json
// yet — this only edits local state. Wire up a real CMS endpoint once
// one exists.
export default function AdminLandingPage() {
  const [heading, setHeading] = useState("Ride Together. Stay Family.");
  const [subheading, setSubheading] = useState(
    "A community of riders sharing the road, the events, and the brotherhood. Join the club and be part of every ride."
  );

  const handleSave = () => {
    toast.success("Landing page content saved (local only)");
  };

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold tracking-wide uppercase">
        Landing Page Editor
      </h1>
      <p className="mt-2 text-muted-foreground">
        Edit the hero section shown on the homepage.
      </p>

      <div className="mt-8 flex max-w-2xl flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="heading">Hero Heading</Label>
          <Input id="heading" value={heading} onChange={(e) => setHeading(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="subheading">Hero Subheading</Label>
          <Textarea
            id="subheading"
            rows={3}
            value={subheading}
            onChange={(e) => setSubheading(e.target.value)}
          />
        </div>
        <Button className="self-start" onClick={handleSave}>
          Save Changes
        </Button>
      </div>
    </div>
  );
}
