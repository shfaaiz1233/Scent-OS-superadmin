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
