import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { PeriodChart } from "@/components/period-chart";
import { TENANT_STATUSES, TenantStatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api/server";
import type { PlatformOverview } from "@/lib/api/types";
import { formatDay, formatPrice } from "@/lib/format";

const plural = (count: number, one: string, many = `${one}s`) => `${count} ${count === 1 ? one : many}`;

function dueIn(daysLeft: number): string {
  if (daysLeft === 0) return "today";
  if (daysLeft === 1) return "tomorrow";
  return `in ${daysLeft} days`;
}

export default async function OverviewPage() {
  const overview = await api<PlatformOverview>("/api/superadmin/analytics/overview");
  const { tenantsByStatus: byStatus } = overview;
  const live = byStatus.ACTIVE + byStatus.PAST_DUE;

  const kpis = [
    { label: "Monthly recurring revenue", value: formatPrice(overview.mrr), note: `${plural(overview.billedStores, "paying store")}; yearly plans ÷ 12` },
    { label: "Live stores", value: String(live), note: byStatus.PAST_DUE ? `${byStatus.PAST_DUE} past due` : "None past due", href: "/tenants?status=ACTIVE" },
    {
      label: "Payments to verify",
      value: String(overview.paymentsToVerify.count),
      note: overview.paymentsToVerify.count ? `${formatPrice(overview.paymentsToVerify.amount)} in total` : "Nothing to check",
      href: "/payments",
    },
    { label: "Renewals in 7 days", value: String(overview.renewals.length), note: "Paid subscriptions coming due" },
  ];

  return (
    <>
      <PageHeader title="Overview" description="Your platform at a glance." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => {
          const card = (
            <Card className={kpi.href ? "h-full transition-colors hover:bg-muted/40" : "h-full"}>
              <CardHeader>
                <CardDescription>{kpi.label}</CardDescription>
                <CardTitle className="text-2xl tabular-nums">{kpi.value}</CardTitle>
                <p className="text-xs text-muted-foreground">{kpi.note}</p>
              </CardHeader>
            </Card>
          );
          return kpi.href ? (
            <Link key={kpi.label} href={kpi.href}>
              {card}
            </Link>
          ) : (
            <div key={kpi.label}>{card}</div>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your earnings</CardTitle>
          <CardDescription>
            Confirmed subscription payments by month: {formatPrice(overview.earnings.total)} in the last 12 months.
          </CardDescription>
          <CardAction>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/ledger">
                Ledger <ArrowRightIcon />
              </Link>
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <PeriodChart
            points={overview.earnings.series.map((point) => ({ period: point.period, amount: point.amount, count: point.payments }))}
            granularity={overview.earnings.window.granularity}
            amountLabel="Earnings"
            countLabel="payment"
          />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Stores by status</CardTitle>
            <CardDescription>{plural(Object.values(byStatus).reduce((sum, n) => sum + n, 0), "store")} on the platform.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {TENANT_STATUSES.map((status) => (
                <li key={status}>
                  <Link href={`/tenants?status=${status}`} className="flex items-center justify-between py-2 text-sm hover:underline">
                    <TenantStatusBadge status={status} />
                    <span className="tabular-nums">{byStatus[status]}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Renewals in the next 7 days</CardTitle>
            <CardDescription>Live stores whose paid period ends soon. They get a reminder before the due date.</CardDescription>
          </CardHeader>
          <CardContent>
            {overview.renewals.length === 0 ? (
              <p className="text-sm text-muted-foreground">No subscriptions come due this week.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Store</TableHead>
                    <TableHead>Due</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overview.renewals.map((renewal) => (
                    <TableRow key={renewal.tenant.id}>
                      <TableCell>
                        <Link href={`/tenants/${renewal.tenant.id}`} className="font-medium hover:underline">
                          {renewal.tenant.name}
                        </Link>
                        <p className="text-xs text-muted-foreground">{renewal.planName}</p>
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {formatDay(renewal.dueDate)}
                        <p className="text-xs text-muted-foreground">{dueIn(renewal.daysLeft)}</p>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatPrice(renewal.price)}
                        <p className="text-xs text-muted-foreground">{renewal.billingCycle === "YEARLY" ? "per year" : "per month"}</p>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top stores, last 30 days</CardTitle>
          <CardDescription>
            Stores’ own sales (delivered orders, less refunds): {formatPrice(overview.sales.net)} from {plural(overview.sales.orders, "delivered order")}.
          </CardDescription>
          <CardAction>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/ledger?tab=sales">
                All stores <ArrowRightIcon />
              </Link>
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          {overview.sales.topTenants.length === 0 ? (
            <p className="text-sm text-muted-foreground">No store delivered an order in the last 30 days.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Store</TableHead>
                  <TableHead className="text-right">Orders</TableHead>
                  <TableHead className="text-right">Net sales</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overview.sales.topTenants.map((row) => (
                  <TableRow key={row.tenant.id}>
                    <TableCell>
                      <Link href={`/tenants/${row.tenant.id}`} className="font-medium hover:underline">
                        {row.tenant.name}
                      </Link>
                      <p className="font-mono text-xs text-muted-foreground">{row.tenant.slug}</p>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{row.orders}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatPrice(row.net)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}
