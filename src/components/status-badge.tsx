import { Badge } from "@/components/ui/badge";
import type { TenantStatus } from "@/lib/api/types";

// The one status → badge mapping (see the console-ui skill). The text always names the status.
const STATUS: Record<TenantStatus, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  PROVISIONING: { label: "Provisioning", variant: "secondary" },
  SETUP: { label: "Setup", variant: "secondary" },
  ACTIVE: { label: "Active", variant: "default" },
  SUSPENDED: { label: "Suspended", variant: "destructive" },
};

export function TenantStatusBadge({ status }: { status: TenantStatus }) {
  const { label, variant } = STATUS[status];
  return <Badge variant={variant}>{label}</Badge>;
}

export const TENANT_STATUSES = Object.keys(STATUS) as TenantStatus[];
export const tenantStatusLabel = (status: TenantStatus) => STATUS[status].label;
