import {
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  CalendarX,
  AtSign,
  Droplet,
  Home,
  Siren,
  Bike,
  Factory,
  Cog,
  Hash,
  User,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MembershipCardQrs } from "@/components/shared/MembershipCardQrs";
import type { Profile } from "@/lib/api";

type Field = { icon: React.ElementType; label: string; value: string };

function FieldRow({ icon: Icon, label, value }: Field) {
  return (
    <div className="flex items-start gap-3">
      <div className="shape-corner-sm mt-0.5 flex size-9 shrink-0 items-center justify-center bg-primary/10 text-primary">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <dt className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          {label}
        </dt>
        <dd className="mt-0.5 truncate text-sm font-medium">{value || "—"}</dd>
      </div>
    </div>
  );
}

function Section({ title, fields }: { title: string; fields: Field[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xs tracking-widest uppercase">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-5 sm:grid-cols-2">
          {fields.map((f) => (
            <FieldRow key={f.label} {...f} />
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}

// Read-only, sectioned view of a member's profile. Shared by the member's own
// profile page and the admin application-review page.
export function ProfileDetails({
  profile,
  memberId,
}: {
  profile: Profile;
  memberId?: string;
}) {
  const personal: Field[] = [
    { icon: Mail, label: "Email", value: profile.email },
    { icon: Phone, label: "Phone Number", value: profile.phoneNumber },
    { icon: MapPin, label: "Place of Birth", value: profile.placeOfBirth },
    { icon: CalendarDays, label: "Date of Birth", value: profile.dateofBirth },
    { icon: AtSign, label: "Instagram", value: profile.instagramUsername },
    { icon: Droplet, label: "Blood Type", value: profile.bloodType },
    { icon: Home, label: "Address", value: profile.address },
  ];

  const emergency: Field[] = [
    { icon: Siren, label: "Emergency Contact", value: profile.emergencyContactName },
    {
      icon: Phone,
      label: "Emergency Contact Phone",
      value: profile.emergencyContactPhoneNumber,
    },
  ];

  const motorbike: Field[] = [
    { icon: Bike, label: "Motorbike", value: profile.motorbikeName },
    { icon: Factory, label: "Brand", value: profile.motorbikeBrand },
    { icon: Cog, label: "Type", value: profile.motorbikeType },
    { icon: Hash, label: "Plate Number", value: profile.plateNumber },
    { icon: CalendarDays, label: "Member Since", value: profile.created_at },
    {
      icon: CalendarX,
      label: "Membership Expires",
      value: profile.membershipExpiresAt ?? "",
    },
  ];

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-2">
      <Section title="Personal Information" fields={personal} />
      <div className="flex flex-col gap-6">
        <Section title="Emergency Contact" fields={emergency} />
        <Card>
          <CardHeader>
            <CardTitle className="text-xs tracking-widest uppercase">Motorbike</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <dl className="grid gap-5 sm:grid-cols-2">
              {motorbike.map((f) => (
                <FieldRow key={f.label} {...f} />
              ))}
            </dl>
            <div className="grid gap-4 sm:grid-cols-2">
              {profile.motorbikeSelfieLinkPath && (
                <a
                  href={profile.motorbikeSelfieLinkPath}
                  target="_blank"
                  rel="noreferrer"
                  className="block"
                >
                  <span className="mb-1 flex items-center gap-1.5 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                    <Bike className="size-3.5" /> Motorbike Selfie
                  </span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={profile.motorbikeSelfieLinkPath}
                    alt="Motorbike selfie"
                    className="shape-corner-sm max-h-56 w-full border border-border object-cover"
                  />
                </a>
              )}
              {profile.riderPhotoLinkPath && (
                <a
                  href={profile.riderPhotoLinkPath}
                  target="_blank"
                  rel="noreferrer"
                  className="block"
                >
                  <span className="mb-1 flex items-center gap-1.5 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                    <User className="size-3.5" /> Rider Photo
                  </span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={profile.riderPhotoLinkPath}
                    alt="Rider closeup"
                    className="shape-corner-sm max-h-56 w-full border border-border object-cover"
                  />
                </a>
              )}
            </div>
          </CardContent>
        </Card>
        {memberId && <MembershipCardQrs memberId={memberId} />}
      </div>
    </div>
  );
}
