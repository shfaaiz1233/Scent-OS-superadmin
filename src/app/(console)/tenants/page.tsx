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
import type { TenantList, TenantStatus } from "@/lib/api/types";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Tenants" };

const PAGE_SIZE = 20;

function pageHref(params: { q?: string; status?: string; page?: number }) {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.status) search.set("status", params.status);
  if (params.page && params.page > 1) search.set("page", String(params.page));
  const query = search.toString();
  return query ? `/tenants?${query}` : "/tenants";
}

export default async function TenantsPage({ searchParams }: PageProps<"/tenants">) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const status = TENANT_STATUSES.find((s) => s === params.status) as TenantStatus | undefined;
  const page = Math.max(1, Number(params.page) || 1);

  const query = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
  if (q) query.set("q", q);
  if (status) query.set("status", status);
  const list = await api<TenantList>(`/api/superadmin/tenants?${query}`);
  const pages = Math.max(1, Math.ceil(list.total / PAGE_SIZE));

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

      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Filter by status" className="flex flex-wrap gap-1">
          {[undefined, ...TENANT_STATUSES].map((s) => (
            <Link
              key={s ?? "all"}
              href={pageHref({ q, status: s })}
              aria-current={s === status ? "page" : undefined}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                s === status && "bg-muted font-medium text-foreground",
              )}
            >
              {s ? tenantStatusLabel(s) : "All"}
            </Link>
          ))}
        </nav>
        <form action="/tenants" className="flex gap-2">
          {status && <input type="hidden" name="status" value={status} />}
          <Input name="q" defaultValue={q} placeholder="Search name, domain, owner…" aria-label="Search tenants" className="w-64" />
          <Button type="submit" variant="outline">
            Search
          </Button>
        </form>
      </div>

      {list.items.length === 0 ? (
        <EmptyState
          icon={StoreIcon}
          title={q || status ? "No tenants match" : "No tenants yet"}
          description={q || status ? "Try another search or status." : "Create the first store with “New tenant”."}
        />
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Store</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Owner</TableHead>
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
                  <TableCell>
                    <p>{tenant.ownerName ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">{tenant.ownerEmail}</p>
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
              <Link href={pageHref({ q, status, page: page - 1 })}>Previous</Link>
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
          )}
          {page < pages ? (
            <Button variant="outline" size="sm" asChild>
              <Link href={pageHref({ q, status, page: page + 1 })}>Next</Link>
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
