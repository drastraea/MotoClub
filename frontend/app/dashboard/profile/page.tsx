import Link from "next/link";
import { Pencil } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockProfile } from "@/lib/mock-profile";

const fields: [string, string][] = [
  ["Full Name", mockProfile.name],
  ["Email", mockProfile.email],
  ["Phone Number", mockProfile.phoneNumber],
  ["Place of Birth", mockProfile.placeOfBirth],
  ["Date of Birth", mockProfile.dateOfBirth],
  ["Address", mockProfile.address],
  ["Instagram", mockProfile.instagramUsername],
  ["Blood Type", mockProfile.bloodType],
  ["Emergency Contact", mockProfile.emergencyContactName],
  ["Emergency Contact Phone", mockProfile.emergencyContactPhoneNumber],
  ["Motorbike", mockProfile.motorbikeName],
  ["Member Since", mockProfile.memberSince],
];

export default function ProfilePage() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-3xl font-bold tracking-wide uppercase">
          My Profile
        </h1>
        <div className="flex items-center gap-3">
          <Badge>{mockProfile.status}</Badge>
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
