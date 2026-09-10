"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode } from "@/components/shared/QrCode";

// The two QR codes printed on the physical member ID card:
//  - Benefits: static, points at the public "why join / benefits" section
//  - Member:   points at this member's detail page (scanned to verify at events)
export function MembershipCardQrs({ memberId }: { memberId: string }) {
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);

  const benefitsUrl = `${origin}/#benefits`;
  const memberUrl = `${origin}/admin/members/${memberId}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xs tracking-widest uppercase">Membership Card</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-8">
          <figure className="flex flex-col items-center gap-2">
            <QrCode value={benefitsUrl} size={140} className="shape-corner-sm border border-border" />
            <figcaption className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Benefits Info
            </figcaption>
          </figure>
          <figure className="flex flex-col items-center gap-2">
            <QrCode value={memberUrl} size={140} className="shape-corner-sm border border-border" />
            <figcaption className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Member Info
            </figcaption>
          </figure>
        </div>
      </CardContent>
    </Card>
  );
}
