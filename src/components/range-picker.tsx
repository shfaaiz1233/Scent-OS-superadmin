import Link from "next/link";
import type { AnalyticsRange } from "@/lib/api/types";
import { RANGES } from "@/lib/analytics";
import { cn } from "@/lib/utils";

/** The period links above a dashboard; the range lives in the URL (`href` builds each link). */
export function RangePicker({ current, href }: { current: AnalyticsRange; href: (range: AnalyticsRange) => string }) {
  return (
    <nav aria-label="Period" className="flex flex-wrap gap-1 rounded-lg border p-1">
      {RANGES.map((range) => (
        <Link
          key={range.value}
          href={href(range.value)}
          aria-current={range.value === current ? "page" : undefined}
          className={cn(
            "rounded-md px-3 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
            range.value === current && "bg-muted font-medium text-foreground",
          )}
        >
          {range.label}
        </Link>
      ))}
    </nav>
  );
}
