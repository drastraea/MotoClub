import { Users, CalendarDays, ShieldCheck, Wrench } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

const benefits = [
  {
    icon: Users,
    title: "Community",
    description: "A brotherhood of riders who look out for each other on and off the road.",
  },
  {
    icon: CalendarDays,
    title: "Exclusive Events",
    description: "Members-only rides, meetups, and annual gatherings.",
  },
  {
    icon: ShieldCheck,
    title: "Rider Support",
    description: "Roadside assistance network and safety resources for members.",
  },
  {
    icon: Wrench,
    title: "Workshops",
    description: "Maintenance clinics and gear discounts from partner shops.",
  },
];

export function BenefitsSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h2 className="text-center text-3xl font-bold tracking-tight">
        Membership Benefits
      </h2>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {benefits.map(({ icon: Icon, title, description }) => (
          <Card key={title}>
            <CardHeader>
              <Icon className="size-8 text-primary" />
              <CardTitle className="mt-2">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  );
}
