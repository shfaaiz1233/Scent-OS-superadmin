import { Badge } from "@/components/ui/badge";
import type { BillingState, PaymentStatus, TenantStatus } from "@/lib/api/types";

type Variant = "default" | "secondary" | "outline" | "destructive";

// The one status → badge mapping (see the console-ui skill). The text always names the status.
const STATUS: Record<TenantStatus, { label: string; variant: Variant }> = {
  PROVISIONING: { label: "Provisioning", variant: "secondary" },
  SETUP: { label: "Setup", variant: "secondary" },
  ACTIVE: { label: "Active", variant: "default" },
  PAST_DUE: { label: "Past due", variant: "outline" },
  SUSPENDED: { label: "Suspended", variant: "destructive" },
};

export function TenantStatusBadge({ status }: { status: TenantStatus }) {
  const { label, variant } = STATUS[status];
  return <Badge variant={variant}>{label}</Badge>;
}

export const TENANT_STATUSES = Object.keys(STATUS) as TenantStatus[];
export const tenantStatusLabel = (status: TenantStatus) => STATUS[status].label;

const PAYMENT: Record<PaymentStatus, { label: string; variant: Variant }> = {
  SUBMITTED: { label: "To check", variant: "secondary" },
  CONFIRMED: { label: "Confirmed", variant: "default" },
  REJECTED: { label: "Rejected", variant: "destructive" },
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const { label, variant } = PAYMENT[status];
  return <Badge variant={variant}>{label}</Badge>;
}

export const PAYMENT_STATUSES = Object.keys(PAYMENT) as PaymentStatus[];
export const paymentStatusLabel = (status: PaymentStatus) => PAYMENT[status].label;

const BILLING: Record<BillingState, { label: string; variant: Variant }> = {
  UNBILLED: { label: "Not billed", variant: "outline" },
  AWAITING_PAYMENT: { label: "Awaiting first payment", variant: "secondary" },
  PAID: { label: "Paid", variant: "default" },
  DUE_SOON: { label: "Due soon", variant: "secondary" },
  OVERDUE: { label: "Overdue", variant: "outline" },
  SUSPENDED: { label: "Suspended for non-payment", variant: "destructive" },
};

/** Where a store stands with its subscription; overdue stores show by how many days. */
export function BillingStateBadge({ state, daysUntilDue }: { state: BillingState; daysUntilDue?: number | null }) {
  const { label, variant } = BILLING[state];
  const overdue = state === "OVERDUE" && daysUntilDue != null && daysUntilDue < 0 ? -daysUntilDue : 0;
  return (
    <Badge variant={variant}>
      {label}
      {overdue > 0 && ` · ${overdue} day${overdue === 1 ? "" : "s"}`}
    </Badge>
  );
}
