import type { AnalyticsRange, AnalyticsWindow } from "@/lib/api/types";

// Periods for the overview and ledgers. Shared by server pages and the (client) charts, so no
// "use client" here.

export const RANGES: { value: AnalyticsRange; label: string; long: string }[] = [
  { value: "7d", label: "7 days", long: "the last 7 days" },
  { value: "30d", label: "30 days", long: "the last 30 days" },
  { value: "90d", label: "90 days", long: "the last 90 days" },
  { value: "12m", label: "12 months", long: "the last 12 months" },
];

/** The range in the URL, or `fallback` when it's missing or unknown. */
export function parseRange(value: unknown, fallback: AnalyticsRange): AnalyticsRange {
  return RANGES.find((range) => range.value === value)?.value ?? fallback;
}

export const rangeLabel = (range: AnalyticsRange) => RANGES.find((r) => r.value === range)?.long ?? range;

const dayFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
const monthFormat = new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric", timeZone: "UTC" });

/** A series period ("2026-10-11" or "2026-10") → "11 Oct" or "Oct 2026". */
export function periodLabel(period: string, granularity: AnalyticsWindow["granularity"]): string {
  return granularity === "month" ? monthFormat.format(new Date(`${period}-01T00:00:00Z`)) : dayFormat.format(new Date(`${period}T00:00:00Z`));
}

/** Minor units → a short axis label: "Rs 950", "Rs 45k", "Rs 1.2M". */
export function formatCompactPrice(minor: number): string {
  return `Rs ${new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(minor / 100)}`;
}
