const date = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });
const dateTime = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

/** "1 Oct 2026" */
export function formatDate(iso: string): string {
  return date.format(new Date(iso));
}

/** "1 Oct 2026, 14:30" */
export function formatDateTime(iso: string): string {
  return dateTime.format(new Date(iso));
}

const day = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

/** A calendar date from the API ("2026-11-04", billing dates) → "4 Nov 2026", whatever the server's time zone. */
export function formatDay(date: string): string {
  return day.format(new Date(`${date}T00:00:00Z`));
}

/** Minor units (paisa) → "Rs 4,999" (decimals only when there are any). */
export function formatPrice(minor: number): string {
  return `Rs ${(minor / 100).toLocaleString("en-PK", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

/** Rupees as typed ("4,999", "Rs 4999.50") → minor units, or null when it isn't an amount. */
export function parseRupees(value: string): number | null {
  const cleaned = value.replace(/rs\.?/i, "").replace(/[,\s]/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  return Math.round(Number(cleaned) * 100);
}

/** Minor units → the rupee amount for an input's value ("4999" or "4999.5"). */
export function rupeesInput(minor: number): string {
  return String(minor / 100);
}
