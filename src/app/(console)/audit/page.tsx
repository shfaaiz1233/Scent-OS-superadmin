import { ScrollTextIcon, XIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { AuditLogTable } from "@/components/audit-log-table";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api/server";
import type { AuditLogList } from "@/lib/api/types";
import { actionLabel } from "@/lib/audit";

export const metadata: Metadata = { title: "Audit log" };

const PAGE_SIZE = 50;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Filters = { q?: string; action?: string; tenantId?: string; page?: number };

function pageHref({ q, action, tenantId, page }: Filters) {
  const search = new URLSearchParams();
  if (q) search.set("q", q);
  if (action) search.set("action", action);
  if (tenantId) search.set("tenantId", tenantId);
  if (page && page > 1) search.set("page", String(page));
  const query = search.toString();
  return query ? `/audit?${query}` : "/audit";
}

const one = (value: string | string[] | undefined) => (typeof value === "string" && value.trim() ? value.trim() : undefined);

export default async function AuditPage({ searchParams }: PageProps<"/audit">) {
  const params = await searchParams;
  const filters: Filters = {
    q: one(params.q),
    action: one(params.action)?.match(/^[a-z_.]{1,80}$/) ? one(params.action) : undefined,
    tenantId: one(params.tenantId)?.match(UUID) ? one(params.tenantId) : undefined,
    page: Math.max(1, Number(params.page) || 1),
  };
  const query = new URLSearchParams({ page: String(filters.page), pageSize: String(PAGE_SIZE) });
  if (filters.q) query.set("q", filters.q);
  if (filters.action) query.set("action", filters.action);
  if (filters.tenantId) query.set("tenantId", filters.tenantId);
  const list = await api<AuditLogList>(`/api/superadmin/audit-logs?${query}`);
  const pages = Math.max(1, Math.ceil(list.total / PAGE_SIZE));
  const page = filters.page ?? 1;
  const store = filters.tenantId ? list.items.find((entry) => entry.tenant?.id === filters.tenantId)?.tenant : undefined;
  const filtered = Boolean(filters.q || filters.action || filters.tenantId);

  return (
    <>
      <PageHeader title="Audit log" description="Every change made in the console, and the billing run’s status changes, newest first." />

      <form action="/audit" className="flex flex-wrap items-center gap-2">
        {filters.tenantId && <input type="hidden" name="tenantId" value={filters.tenantId} />}
        <select
          name="action"
          defaultValue={filters.action ?? ""}
          aria-label="Action"
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <option value="">All actions</option>
          {list.actions.map((action) => (
            <option key={action} value={action}>
              {actionLabel(action)}
            </option>
          ))}
        </select>
        <Input name="q" defaultValue={filters.q} placeholder="Action, store or superadmin…" aria-label="Search the audit log" className="w-72" />
        <Button type="submit" variant="outline">
          Search
        </Button>
        {filters.tenantId && (
          <Button variant="secondary" size="sm" asChild>
            <Link href={pageHref({ ...filters, tenantId: undefined, page: 1 })} aria-label="Show every store">
              {store?.name ?? "One store"} <XIcon />
            </Link>
          </Button>
        )}
        {filtered && (
          <Button variant="ghost" size="sm" asChild>
            <Link href="/audit">Clear</Link>
          </Button>
        )}
      </form>

      {list.items.length === 0 ? (
        <EmptyState
          icon={ScrollTextIcon}
          title={filtered ? "Nothing matches" : "Nothing recorded yet"}
          description={filtered ? "Try another action or search." : "Changes you make in the console appear here."}
        />
      ) : (
        <AuditLogTable entries={list.items} />
      )}

      {pages > 1 && (
        <div className="flex items-center justify-end gap-2 text-sm">
          <span className="text-muted-foreground">
            Page {page} of {pages} · {list.total} entries
          </span>
          {page > 1 ? (
            <Button variant="outline" size="sm" asChild>
              <Link href={pageHref({ ...filters, page: page - 1 })}>Previous</Link>
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
          )}
          {page < pages ? (
            <Button variant="outline" size="sm" asChild>
              <Link href={pageHref({ ...filters, page: page + 1 })}>Next</Link>
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
