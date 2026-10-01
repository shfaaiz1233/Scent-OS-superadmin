import { LayoutDashboardIcon } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// KPI tiles; values arrive with the analytics API (Phase 6).
const KPIS = [
  { label: "Monthly recurring revenue", value: "—" },
  { label: "Active tenants", value: "—" },
  { label: "Payments to verify", value: "—" },
  { label: "Renewals in 7 days", value: "—" },
];

export default function OverviewPage() {
  return (
    <>
      <PageHeader title="Overview" description="Your platform at a glance." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {KPIS.map((kpi) => (
          <Card key={kpi.label}>
            <CardHeader>
              <CardDescription>{kpi.label}</CardDescription>
              <CardTitle className="text-2xl tabular-nums">{kpi.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
      <EmptyState
        icon={LayoutDashboardIcon}
        title="Analytics arrive in Phase 6"
        description="Revenue over time, tenants by status and top stores will show here."
      />
    </>
  );
}
