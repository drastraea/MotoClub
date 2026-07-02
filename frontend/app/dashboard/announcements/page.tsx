import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// TODO: Replace with GET /announcements?startFrom= (see api_contract.json)
const announcements = [
  {
    id: "1",
    title: "New Merch Drop",
    date: "Jun 28, 2026",
    body: "Club jackets and patches are back in stock at HQ.",
  },
  {
    id: "2",
    title: "Road Safety Briefing",
    date: "Jun 20, 2026",
    body: "Mandatory briefing before the charity run this month.",
  },
  {
    id: "3",
    title: "Membership Dues Reminder",
    date: "Jun 10, 2026",
    body: "Annual dues are due by the end of the month.",
  },
];

export default function AnnouncementsPage() {
  return (
    <div>
      <h1 className="font-heading text-3xl font-bold tracking-wide uppercase">
        Announcements
      </h1>

      <div className="mt-8 flex flex-col gap-4">
        {announcements.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
              <CardDescription className="flex flex-col gap-1">
                <span>{item.date}</span>
                <span>{item.body}</span>
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
