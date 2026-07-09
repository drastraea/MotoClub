import { Card, CardContent } from "@/components/ui/card";
import type { Profile } from "@/lib/api";

// Read-only grid of a member's profile fields. Shared by the member's own
// profile pages and the admin application-review page.
export function ProfileDetails({ profile }: { profile: Profile }) {
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

        {profile.motorbikeSelfieLinkPath && (
          <div className="mt-6">
            <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Motorbike Photo
            </p>
            <a
              href={profile.motorbikeSelfieLinkPath}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={profile.motorbikeSelfieLinkPath}
                alt="Motorbike"
                className="max-h-80 rounded-lg border border-border object-contain"
              />
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
