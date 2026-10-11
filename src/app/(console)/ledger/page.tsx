import { BookOpenTextIcon, StoreIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { PeriodChart } from "@/components/period-chart";
import { RangePicker } from "@/components/range-picker";
import { TenantStatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { parseRange, rangeLabel } from "@/lib/analytics";
import { api } from "@/lib/api/server";
import type { AnalyticsRange, EarningsLedger, PaymentMethod, SalesLedger } from "@/lib/api/types";
import { formatDateTime, formatDay, formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Ledger" };

const PAGE_SIZE = 20;
const METHOD: Record<PaymentMethod, string> = { BANK_TRANSFER: "Bank transfer", CASH: "Cash", OTHER: "Other" };

type Tab = "earnings" | "sales";
type Params = { tab: Tab; range: AnalyticsRange; q?: string; page?: number };

/** Each tab has its own default period: 12 months for earnings, 30 days for sales. */
const DEFAULT_RANGE: Record<Tab, AnalyticsRange> = { earnings: "12m", sales: "30d" };

function pageHref({ tab, range, q, page }: Params) {
  const search = new URLSearchParams();
  if (tab !== "earnings") search.set("tab", tab);
  if (range !== DEFAULT_RANGE[tab]) search.set("range", range);
  if (q) search.set("q", q);
  if (page && page > 1) search.set("page", String(page));
  const query = search.toString();
  return query ? `/ledger?${query}` : "/ledger";
}

function Kpis({ items }: { items: { label: string; value: string }[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {items.map((kpi) => (
        <Card key={kpi.label}>
          <CardHeader>
            <CardDescription>{kpi.label}</CardDescription>
            <CardTitle className="text-2xl tabular-nums">{kpi.value}</CardTitle>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}

async function Earnings({ params }: { params: Params }) {
  const query = new URLSearchParams({ range: params.range, page: String(params.page ?? 1), pageSize: String(PAGE_SIZE) });
  if (params.q) query.set("q", params.q);
  const ledger = await api<EarningsLedger>(`/api/superadmin/ledger/earnings?${query}`);
  const pages = Math.max(1, Math.ceil(ledger.entries.total / PAGE_SIZE));
  const page = params.page ?? 1;

  return (
    <>
      <Kpis
        items={[
          { label: "Earned", value: formatPrice(ledger.total) },
          { label: "Payments confirmed", value: String(ledger.payments) },
          { label: "Average payment", value: formatPrice(ledger.payments ? Math.round(ledger.total / ledger.payments) : 0) },
        ]}
      />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">By {ledger.window.granularity}</CardTitle>
          <CardDescription>
            {formatDay(ledger.window.from)} – {formatDay(ledger.window.to)}, by the day each payment was confirmed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PeriodChart
            points={ledger.series.map((point) => ({ period: point.period, amount: point.amount, count: point.payments }))}
            granularity={ledger.window.granularity}
            amountLabel="Earned"
            countLabel="payment"
          />
        </CardContent>
      </Card>

      {ledger.entries.items.length === 0 ? (
        <EmptyState
          icon={BookOpenTextIcon}
          title={params.q ? "No payments match" : "No confirmed payments"}
          description={
            params.q
              ? "Try the store’s name, its owner’s email, the bank reference or the amount in rupees."
              : `Nothing was confirmed in ${rangeLabel(params.range)}. Payments count once you confirm them in Payments.`
          }
        />
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Store</TableHead>
                <TableHead>Confirmed</TableHead>
                <TableHead>Paid for</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ledger.entries.items.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    <Link href={`/tenants/${payment.tenant.id}`} className="font-medium hover:underline">
                      {payment.tenant.name}
                    </Link>
                    <p className="font-mono text-xs text-muted-foreground">{payment.tenant.slug}</p>
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {payment.reviewedAt ? formatDateTime(payment.reviewedAt) : "—"}
                    {payment.reviewedBy && <p className="text-xs text-muted-foreground">by {payment.reviewedBy.name}</p>}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {payment.periodStart && payment.periodEnd ? `${formatDay(payment.periodStart)} – ${formatDay(payment.periodEnd)}` : "—"}
                  </TableCell>
                  <TableCell className="max-w-xs whitespace-normal">
                    {METHOD[payment.method]}
                    {payment.reference && <span className="font-mono text-xs text-muted-foreground"> · {payment.reference}</span>}
                    {payment.source === "PLATFORM" && <p className="text-xs text-muted-foreground">Recorded in the console</p>}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{formatPrice(payment.amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-end gap-2 text-sm">
          <span className="text-muted-foreground">
            Page {page} of {pages} · {ledger.entries.total} payments
          </span>
          {page > 1 ? (
            <Button variant="outline" size="sm" asChild>
              <Link href={pageHref({ ...params, page: page - 1 })}>Previous</Link>
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
          )}
          {page < pages ? (
            <Button variant="outline" size="sm" asChild>
              <Link href={pageHref({ ...params, page: page + 1 })}>Next</Link>
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          )}
        </div>
      )}
    </>
  );
}

async function Sales({ params }: { params: Params }) {
  const query = new URLSearchParams({ range: params.range });
  if (params.q) query.set("q", params.q);
  const ledger = await api<SalesLedger>(`/api/superadmin/ledger/sales?${query}`);
  const { totals } = ledger;

  return (
    <>
      <Kpis
        items={[
          { label: "Net sales", value: formatPrice(totals.net) },
          { label: "Delivered orders", value: String(totals.orders) },
          { label: "Refunds", value: totals.refunds ? `${formatPrice(totals.refunded)} · ${totals.refunds}` : formatPrice(0) },
        ]}
      />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">By {ledger.window.granularity}</CardTitle>
          <CardDescription>
            {formatDay(ledger.window.from)} – {formatDay(ledger.window.to)}. An order counts on the day it was delivered; a refund comes off on the day it was
            made.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PeriodChart
            points={ledger.series.map((point) => ({ period: point.period, amount: point.net, count: point.orders }))}
            granularity={ledger.window.granularity}
            amountLabel="Net sales"
            countLabel="delivered order"
          />
        </CardContent>
      </Card>

      {ledger.tenants.length === 0 ? (
        <EmptyState
          icon={StoreIcon}
          title={params.q ? "No store matches" : "No sales"}
          description={
            params.q ? "Search by the store’s name or slug." : `No store delivered or refunded an order in ${rangeLabel(params.range)}.`
          }
        />
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Store</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Orders</TableHead>
                <TableHead className="text-right">Delivered</TableHead>
                <TableHead className="text-right">Refunded</TableHead>
                <TableHead className="text-right">Net sales</TableHead>
                <TableHead className="text-right">Share</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ledger.tenants.map((row) => (
                <TableRow key={row.tenant.id}>
                  <TableCell>
                    <Link href={`/tenants/${row.tenant.id}`} className="font-medium hover:underline">
                      {row.tenant.name}
                    </Link>
                    <p className="font-mono text-xs text-muted-foreground">{row.tenant.slug}</p>
                  </TableCell>
                  <TableCell>
                    <TenantStatusBadge status={row.tenant.status} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{row.orders}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatPrice(row.completed)}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.refunds ? (
                      <>
                        {formatPrice(row.refunded)}
                        <p className="text-xs text-muted-foreground">{row.refunds === 1 ? "1 order" : `${row.refunds} orders`}</p>
                      </>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">{formatPrice(row.net)}</TableCell>
                  <TableCell className="text-right text-muted-foreground tabular-nums">
                    {totals.net > 0 ? `${Math.round((Math.max(row.net, 0) / totals.net) * 100)}%` : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}

export default async function LedgerPage({ searchParams }: PageProps<"/ledger">) {
  const raw = await searchParams;
  const tab: Tab = raw.tab === "sales" ? "sales" : "earnings";
  const params: Params = {
    tab,
    range: parseRange(raw.range, DEFAULT_RANGE[tab]),
    q: typeof raw.q === "string" && raw.q.trim() ? raw.q.trim() : undefined,
    page: Math.max(1, Number(raw.page) || 1),
  };

  return (
    <>
      <PageHeader
        title="Ledger"
        description="Your earnings from subscriptions, and what each store sells through its storefront."
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Ledger" className="flex flex-wrap gap-1">
          {(
            [
              ["earnings", "Your earnings"],
              ["sales", "Store sales"],
            ] as const
          ).map(([value, label]) => (
            <Link
              key={value}
              href={pageHref({ tab: value, range: DEFAULT_RANGE[value] })}
              aria-current={value === tab ? "page" : undefined}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                value === tab && "bg-muted font-medium text-foreground",
              )}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-wrap items-center gap-3">
          <RangePicker current={params.range} href={(range) => pageHref({ ...params, range, page: 1 })} />
          <form action="/ledger" className="flex gap-2">
            {tab !== "earnings" && <input type="hidden" name="tab" value={tab} />}
            {params.range !== DEFAULT_RANGE[tab] && <input type="hidden" name="range" value={params.range} />}
            <Input
              name="q"
              defaultValue={params.q}
              placeholder={tab === "earnings" ? "Store, owner, reference or amount…" : "Store name or slug…"}
              aria-label={tab === "earnings" ? "Search payments" : "Search stores"}
              className="w-64"
            />
            <Button type="submit" variant="outline">
              Search
            </Button>
          </form>
        </div>
      </div>

      {tab === "earnings" ? <Earnings params={params} /> : <Sales params={params} />}
    </>
  );
}
