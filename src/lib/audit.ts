import type { AuditLogEntry } from "@/lib/api/types";

// Audit log display: what each recorded action means, and its data as short lines. Server-safe.

const ACTIONS: Record<string, string> = {
  "tenant.create": "Created the store",
  "tenant.update": "Edited the store’s details",
  "tenant.activate": "Activated the store",
  "tenant.suspend": "Suspended the store",
  "tenant.provisioning.retry": "Retried provisioning",
  "tenant.domain.add": "Added a domain",
  "tenant.domain.remove": "Removed a domain",
  "tenant.domain.primary": "Changed the primary domain",
  "tenant.theme.update": "Changed the theme",
  "tenant.owner_invite": "Created the owner’s set-password link",
  "tenant.admin_access": "Opened the store’s admin",
  "tenant.subscription.create": "Put the store on a plan",
  "tenant.subscription.update": "Changed the plan or price",
  "tenant.subscription.period": "Moved the due date",
  "tenant.features.update": "Changed feature overrides",
  "plan.create": "Created a plan",
  "plan.update": "Edited a plan",
  "plan.delete": "Deleted a plan",
  "platform.settings.update": "Changed platform settings",
  "billing.payment.confirm": "Confirmed a payment",
  "billing.payment.reject": "Rejected a payment",
  "billing.past_due": "Marked past due (billing run)",
  "billing.suspend": "Suspended for non-payment (billing run)",
  "billing.activate": "Reopened after payment",
  "billing.no_longer_due": "No longer overdue",
  "billing.free_renewal": "Renewed a free subscription (billing run)",
};

/** "Suspended the store" for tenant.suspend; unknown actions as they are. */
export function actionLabel(action: string): string {
  return ACTIONS[action] ?? action;
}

const MAX_VALUE = 80;

function valueText(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "string") return value.length > MAX_VALUE ? `${value.slice(0, MAX_VALUE)}…` : value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  const json = JSON.stringify(value);
  return json.length > MAX_VALUE ? `${json.slice(0, MAX_VALUE)}…` : json;
}

/** The entry's data as "key: value" lines (long values shortened). */
export function detailLines(entry: AuditLogEntry): string[] {
  return Object.entries(entry.data ?? {}).map(([key, value]) => `${key}: ${valueText(value)}`);
}
