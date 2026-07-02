import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// TODO: Replace with GET /members/:id/profile (see api_contract.json)
const profile = {
  name: "Alex Rider",
  email: "alex.rider@example.com",
  phoneNumber: "+62 812-3456-7890",
  placeOfBirth: "Jakarta",
  dateOfBirth: "1995-04-12",
  address: "Jl. Rider No. 12, Jakarta",
  instagramUsername: "@alex.rides",
  bloodType: "O",
  emergencyContactName: "Sam Rider",
  emergencyContactPhoneNumber: "+62 813-9876-5432",
  motorbikeName: "Iron Horse",
  memberSince: "2024-03-01",
  status: "Active",
};

const fields: [string, string][] = [
  ["Full Name", profile.name],
  ["Email", profile.email],
  ["Phone Number", profile.phoneNumber],
  ["Place of Birth", profile.placeOfBirth],
  ["Date of Birth", profile.dateOfBirth],
  ["Address", profile.address],
  ["Instagram", profile.instagramUsername],
  ["Blood Type", profile.bloodType],
  ["Emergency Contact", profile.emergencyContactName],
  ["Emergency Contact Phone", profile.emergencyContactPhoneNumber],
  ["Motorbike", profile.motorbikeName],
  ["Member Since", profile.memberSince],
];

export default function ProfilePage() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-3xl font-bold tracking-wide uppercase">
          My Profile
        </h1>
        <Badge>{profile.status}</Badge>
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
