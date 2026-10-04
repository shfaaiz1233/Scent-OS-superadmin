import { CreditCardIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { PAYMENT_STATUSES, paymentStatusLabel } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api/server";
import type { BillingPaymentList, PaymentStatus } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { PaymentsTable } from "./payments-table";

export const metadata: Metadata = { title: "Payments" };

const PAGE_SIZE = 20;

/** "To check" (SUBMITTED) is the default view; "all" shows every status. */
type StatusFilter = PaymentStatus | "all";

function pageHref(params: { q?: string; status?: StatusFilter; page?: number }) {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.status && params.status !== "SUBMITTED") search.set("status", params.status);
  if (params.page && params.page > 1) search.set("page", String(params.page));
  const query = search.toString();
  return query ? `/payments?${query}` : "/payments";
}

export default async function PaymentsPage({ searchParams }: PageProps<"/payments">) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const status: StatusFilter = params.status === "all" ? "all" : (PAYMENT_STATUSES.find((s) => s === params.status) ?? "SUBMITTED");
  const page = Math.max(1, Number(params.page) || 1);

  const query = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
  if (q) query.set("q", q);
  if (status !== "all") query.set("status", status);
  const list = await api<BillingPaymentList>(`/api/superadmin/payments?${query}`);
  const pages = Math.max(1, Math.ceil(list.total / PAGE_SIZE));

  return (
    <>
      <PageHeader
        title="Payments"
        description="What stores sent for their subscriptions. Confirming one extends the store’s subscription by a cycle and reopens it if it was suspended."
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Filter by status" className="flex flex-wrap gap-1">
          {[...PAYMENT_STATUSES, "all" as const].map((s) => (
            <Link
              key={s}
              href={pageHref({ q, status: s })}
              aria-current={s === status ? "page" : undefined}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                s === status && "bg-muted font-medium text-foreground",
              )}
            >
              {s === "all" ? "All" : paymentStatusLabel(s)}
            </Link>
          ))}
        </nav>
        <form action="/payments" className="flex gap-2">
          {status !== "SUBMITTED" && <input type="hidden" name="status" value={status} />}
          <Input name="q" defaultValue={q} placeholder="Store, owner, reference or amount…" aria-label="Search payments" className="w-72" />
          <Button type="submit" variant="outline">
            Search
          </Button>
        </form>
      </div>

      {list.items.length === 0 ? (
        <EmptyState
          icon={CreditCardIcon}
          title={q ? "No payments match" : status === "SUBMITTED" ? "Nothing to check" : "No payments yet"}
          description={
            q
              ? "Try the store’s name, its owner’s email, the bank reference or the amount in rupees."
              : status === "SUBMITTED"
                ? "Payments owners send from their Billing page appear here. Record one you received another way from the store’s Billing tab."
                : "Payments appear here once stores start paying."
          }
        />
      ) : (
        <PaymentsTable payments={list.items} />
      )}

      {pages > 1 && (
        <div className="flex items-center justify-end gap-2 text-sm">
          <span className="text-muted-foreground">
            Page {page} of {pages} · {list.total} payments
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
