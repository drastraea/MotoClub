import { cn } from "@/lib/utils";

// Calendar-style day + month tile for a YYYY-MM-DD date.
export function DateBlock({
  date,
  tone = "accent",
  className,
}: {
  date: string;
  tone?: "accent" | "muted";
  className?: string;
}) {
  const [, month, day] = date.split("-");
  const monthName = new Date(2000, Number(month) - 1, 1)
    .toLocaleString("en-GB", { month: "short" })
    .toUpperCase();
  return (
    <div
      className={cn(
        "flex h-16 w-14 shrink-0 flex-col items-center justify-center rounded-xl leading-none",
        tone === "accent" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
        className
      )}
    >
      <span className="font-heading text-2xl font-bold">{Number(day)}</span>
      <span className="mt-1 text-[10px] font-bold tracking-widest">{monthName}</span>
    </div>
  );
}
