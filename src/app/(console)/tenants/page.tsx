import { PlusIcon, StoreIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { TENANT_STATUSES, TenantStatusBadge, tenantStatusLabel } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api/server";
import type { Plan, TenantList, TenantStatus } from "@/lib/api/types";
import { formatDate, formatDay } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Tenants" };

const PAGE_SIZE = 20;

/** The API's billing filter: where a store stands with its subscription. */
const BILLING = [
  { value: "awaiting_payment", label: "Awaiting first payment" },
  { value: "due_soon", label: "Due soon" },
  { value: "overdue", label: "Overdue" },
  { value: "unbilled", label: "Not billed" },
] as const;
type BillingFilter = (typeof BILLING)[number]["value"];

type Params = { q?: string; status?: TenantStatus; billing?: BillingFilter; planId?: string; page?: number };

function pageHref(params: Params) {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.status) search.set("status", params.status);
  if (params.billing) search.set("billing", params.billing);
  if (params.planId) search.set("planId", params.planId);
  if (params.page && params.page > 1) search.set("page", String(params.page));
  const query = search.toString();
  return query ? `/tenants?${query}` : "/tenants";
}

const filterLink = (active: boolean) =>
  cn(
    "rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
    active && "bg-muted font-medium text-foreground",
  );

export default async function TenantsPage({ searchParams }: PageProps<"/tenants">) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const status = TENANT_STATUSES.find((s) => s === params.status) as TenantStatus | undefined;
  const billing = BILLING.find((b) => b.value === params.billing)?.value;
  const page = Math.max(1, Number(params.page) || 1);

  const plans = await api<Plan[]>("/api/superadmin/plans?status=all");
  const planId = plans.find((p) => p.id === params.planId)?.id;
  const current: Params = { q, status, billing, planId };

  const query = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
  if (q) query.set("q", q);
  if (status) query.set("status", status);
  if (billing) query.set("billing", billing);
  if (planId) query.set("planId", planId);
  const list = await api<TenantList>(`/api/superadmin/tenants?${query}`);
  const pages = Math.max(1, Math.ceil(list.total / PAGE_SIZE));
  const filtered = Boolean(q || status || billing || planId);

  return (
    <>
      <PageHeader
        title="Tenants"
        description="Every store on the platform."
        actions={
          <Button asChild>
            <Link href="/tenants/new">
              <PlusIcon /> New tenant
            </Link>
          </Button>
        }
      />

      <div className="grid gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <nav aria-label="Filter by status" className="flex flex-wrap gap-1">
            {[undefined, ...TENANT_STATUSES].map((s) => (
              <Link key={s ?? "all"} href={pageHref({ ...current, status: s })} aria-current={s === status ? "page" : undefined} className={filterLink(s === status)}>
                {s ? tenantStatusLabel(s) : "All"}
              </Link>
            ))}
          </nav>
          <form action="/tenants" className="flex flex-wrap gap-2">
            {status && <input type="hidden" name="status" value={status} />}
            {billing && <input type="hidden" name="billing" value={billing} />}
            <select
              name="planId"
              defaultValue={planId ?? ""}
              aria-label="Filter by plan"
              className="h-9 rounded-md border bg-transparent px-3 text-sm shadow-xs"
            >
              <option value="">Any plan</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                  {!p.isActive ? " (inactive)" : ""}
                </option>
              ))}
            </select>
            <Input name="q" defaultValue={q} placeholder="Search name, domain, owner…" aria-label="Search tenants" className="w-64" />
            <Button type="submit" variant="outline">
              Search
            </Button>
          </form>
        </div>
        <nav aria-label="Filter by billing" className="flex flex-wrap items-center gap-1">
          <span className="mr-1 text-sm text-muted-foreground">Billing:</span>
          {[undefined, ...BILLING.map((b) => b.value)].map((b) => (
            <Link key={b ?? "any"} href={pageHref({ ...current, billing: b })} aria-current={b === billing ? "page" : undefined} className={filterLink(b === billing)}>
              {b ? BILLING.find((x) => x.value === b)?.label : "Any"}
            </Link>
          ))}
        </nav>
      </div>

      {list.items.length === 0 ? (
        <EmptyState
          icon={StoreIcon}
          title={filtered ? "No tenants match" : "No tenants yet"}
          description={filtered ? "Try another search or filter." : "Create the first store with “New tenant”."}
        />
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Store</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead className="text-right">Paid until</TableHead>
                <TableHead className="text-right">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.items.map((tenant) => (
                <TableRow key={tenant.id}>
                  <TableCell>
                    <Link href={`/tenants/${tenant.id}`} className="font-medium hover:underline">
                      {tenant.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">{tenant.primaryDomain ?? tenant.slug}</p>
                  </TableCell>
                  <TableCell>
                    <TenantStatusBadge status={tenant.status} />
                  </TableCell>
                  <TableCell>{tenant.plan?.name ?? <span className="text-muted-foreground">Not billed</span>}</TableCell>
                  <TableCell>
                    <p>{tenant.ownerName ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">{tenant.ownerEmail}</p>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {tenant.paidUntil ? formatDay(tenant.paidUntil) : <span className="text-muted-foreground">{tenant.plan ? "Not paid yet" : "—"}</span>}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{formatDate(tenant.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-end gap-2 text-sm">
          <span className="text-muted-foreground">
            Page {page} of {pages}
          </span>
          {page > 1 ? (
            <Button variant="outline" size="sm" asChild>
              <Link href={pageHref({ ...current, page: page - 1 })}>Previous</Link>
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
          )}
          {page < pages ? (
            <Button variant="outline" size="sm" asChild>
              <Link href={pageHref({ ...current, page: page + 1 })}>Next</Link>
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
