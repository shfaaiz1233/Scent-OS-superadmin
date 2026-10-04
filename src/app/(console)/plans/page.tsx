import { PackageIcon, PlusIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { featuresSummary } from "@/lib/features";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api/server";
import type { FeatureInfo, Plan } from "@/lib/api/types";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Plans" };

const STATUSES = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
] as const;

function href(params: { q?: string; status?: string }) {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.status && params.status !== "all") search.set("status", params.status);
  const query = search.toString();
  return query ? `/plans?${query}` : "/plans";
}

export default async function PlansPage({ searchParams }: PageProps<"/plans">) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const status = STATUSES.find((s) => s.value === params.status)?.value ?? "all";

  const query = new URLSearchParams({ status });
  if (q) query.set("q", q);
  const [plans, catalogue] = await Promise.all([
    api<Plan[]>(`/api/superadmin/plans?${query}`),
    api<FeatureInfo[]>("/api/superadmin/features"),
  ]);

  return (
    <>
      <PageHeader
        title="Plans"
        description="What stores pay and what they get. Prices apply to new subscriptions; features apply to every store on the plan."
        actions={
          <Button asChild>
            <Link href="/plans/new">
              <PlusIcon /> New plan
            </Link>
          </Button>
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Filter by status" className="flex flex-wrap gap-1">
          {STATUSES.map((s) => (
            <Link
              key={s.value}
              href={href({ q, status: s.value })}
              aria-current={s.value === status ? "page" : undefined}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                s.value === status && "bg-muted font-medium text-foreground",
              )}
            >
              {s.label}
            </Link>
          ))}
        </nav>
        <form action="/plans" className="flex gap-2">
          {status !== "all" && <input type="hidden" name="status" value={status} />}
          <Input name="q" defaultValue={q} placeholder="Search plans…" aria-label="Search plans" className="w-64" />
          <Button type="submit" variant="outline">
            Search
          </Button>
        </form>
      </div>

      {plans.length === 0 ? (
        <EmptyState
          icon={PackageIcon}
          title={q || status !== "all" ? "No plans match" : "No plans yet"}
          description={q || status !== "all" ? "Try another search or filter." : "Create a plan, then put stores on it from their Billing tab."}
        />
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plan</TableHead>
                <TableHead className="text-right">Monthly</TableHead>
                <TableHead className="text-right">Yearly</TableHead>
                <TableHead className="text-right">Stores</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="max-w-md whitespace-normal">
                    <Link href={`/plans/${plan.id}`} className="font-medium hover:underline">
                      {plan.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">{featuresSummary(catalogue, plan.features)}</p>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{formatPrice(plan.priceMonthly)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatPrice(plan.priceYearly)}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    <Link href={`/tenants?planId=${plan.id}`} className="hover:underline" aria-label={`Stores on ${plan.name}`}>
                      {plan.subscriberCount}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant={plan.isActive ? "default" : "secondary"}>{plan.isActive ? "Active" : "Inactive"}</Badge>
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
