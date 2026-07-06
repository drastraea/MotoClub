import { Users, Gauge, HeartHandshake, Moon, Route, Wrench } from "lucide-react";

const services = [
  { icon: Users, title: "Group Rides" },
  { icon: Gauge, title: "Track Days" },
  { icon: HeartHandshake, title: "Charity Runs" },
  { icon: Moon, title: "Night Rides" },
  { icon: Route, title: "Touring" },
  { icon: Wrench, title: "Maintenance Clinics" },
];

export function ServicesGrid() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <span className="text-xs font-semibold tracking-[0.3em] text-primary uppercase">
          What We Do
        </span>
        <h2 className="font-heading mt-2 text-3xl font-bold tracking-wide uppercase">
          Club Activities
        </h2>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3">
        {services.map(({ icon: Icon, title }) => (
          <div key={title} className="flex flex-col items-center gap-3 text-center">
            <div className="shape-corner flex size-16 items-center justify-center bg-primary">
              <Icon className="size-7 text-primary-foreground" />
            </div>
            <h3 className="font-heading text-sm font-semibold tracking-wide uppercase">
              {title}
            </h3>
          </div>
        ))}
      </div>
    </section>
  );
}
