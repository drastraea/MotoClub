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
    <section className="border-y border-border bg-secondary/20 py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <span className="text-xs font-semibold tracking-[0.3em] text-primary uppercase">
            Why Join
          </span>
          <h2 className="font-heading mt-2 text-3xl font-bold tracking-wide uppercase">
            Membership Benefits
          </h2>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map(({ icon: Icon, title, description }) => (
            <Card key={title}>
              <CardHeader>
                <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/30">
                  <Icon className="size-6 text-primary" />
                </div>
                <CardTitle className="font-heading mt-3 tracking-wide uppercase">
                  {title}
                </CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
