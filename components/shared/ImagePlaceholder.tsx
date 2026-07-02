import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function ImagePlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-xl border border-border bg-gradient-to-br from-secondary to-muted shadow-inner",
        className
      )}
    >
      <ImageIcon className="size-8 text-muted-foreground/50" />
    </div>
  );
}
