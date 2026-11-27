import Image from "next/image";
import { cn } from "@/lib/utils";

// The club wordmark, used wherever the site shows its name as a title.
export function BrandLogo({ className }: { className?: string }) {
  return (
    <Image
      src="/brotherhood-squad.svg"
      alt="Brotherhood Squad"
      width={20001}
      height={6145}
      unoptimized
      className={cn("h-10 w-auto", className)}
    />
  );
}
