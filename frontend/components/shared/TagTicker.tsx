import { defaultSiteContent } from "@/lib/site-content";

function TagList({ tags, ariaHidden }: { tags: string[]; ariaHidden?: boolean }) {
  return (
    <ul
      aria-hidden={ariaHidden}
      className="flex shrink-0 items-center gap-10 pr-10 text-2xl font-bold whitespace-nowrap text-foreground"
    >
      {tags.map((tag) => (
        <li key={tag} className="flex items-center gap-3">
          <span className="size-2 rounded-full bg-primary" />
          {tag}
        </li>
      ))}
    </ul>
  );
}

export function TagTicker({ tags = defaultSiteContent.ticker }: { tags?: string[] }) {
  if (tags.length === 0) return null;
  return (
    <div className="overflow-hidden border-y border-border bg-secondary/40 py-6">
      <div className="flex w-max animate-marquee">
        <TagList tags={tags} />
        <TagList tags={tags} ariaHidden />
      </div>
    </div>
  );
}
