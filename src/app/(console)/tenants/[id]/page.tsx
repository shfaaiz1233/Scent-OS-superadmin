import { ExternalLinkIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { BillingStateBadge, TenantStatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApiError, api } from "@/lib/api/server";
import type { BillingPaymentList, FeatureInfo, Plan, TenantBilling, TenantDetail, ThemePreset } from "@/lib/api/types";
import { formatDateTime, formatPrice } from "@/lib/format";
import { PER_CYCLE } from "@/lib/pricing";
import { PaymentsTable } from "../../payments/payments-table";
import { DomainsCard } from "./domains-card";
import { DueDateCard } from "./due-date-card";
import { FeaturesCard } from "./features-card";
import { OpenStoreAdminButton } from "./open-store-admin-button";
import { OwnerAccessCard } from "./owner-access-card";
import { ProvisioningPanel } from "./provisioning-panel";
import { RecordPaymentCard } from "./record-payment-card";
import { StatusActions } from "./status-actions";
import { SubscriptionCard } from "./subscription-card";
import { TenantDetailsForm } from "./tenant-details-form";
import { ThemeEditor } from "./theme-editor";

async function getTenant(id: string): Promise<TenantDetail> {
  try {
    return await api<TenantDetail>(`/api/superadmin/tenants/${encodeURIComponent(id)}`);
  } catch (err) {
    if (err instanceof ApiError && (err.status === 404 || err.status === 400)) notFound();
    throw err;
  }
}

export async function generateMetadata({ params }: PageProps<"/tenants/[id]">): Promise<Metadata> {
  const { id } = await params;
  return { title: (await getTenant(id)).name };
}

export default async function TenantPage({ params }: PageProps<"/tenants/[id]">) {
  const { id } = await params;
  const tenant = await getTenant(id);
  const [presets, billing, plans, payments, catalogue] = await Promise.all([
    api<ThemePreset[]>("/api/superadmin/theme-presets"),
    api<TenantBilling>(`/api/superadmin/tenants/${tenant.id}/billing`),
    api<Plan[]>("/api/superadmin/plans?status=all"),
    api<BillingPaymentList>(`/api/superadmin/payments?tenantId=${tenant.id}&pageSize=10`),
    api<FeatureInfo[]>("/api/superadmin/features"),
  ]);
  const provisioning = tenant.status === "PROVISIONING";
  // A store can be put on any active plan, and stay on its current one even if that was deactivated.
  const choosable = plans.filter((p) => p.isActive || p.id === billing.subscription?.plan.id);
  const sub = billing.subscription;

  return (
    <>
      <PageHeader
        title={tenant.name}
        description={`${tenant.domains[0]?.domain ?? tenant.slug} · schema ${tenant.schemaName}`}
        actions={
          <>
            {tenant.storefrontUrl && !provisioning && (
              <Button variant="outline" asChild>
                <a href={tenant.storefrontUrl} target="_blank" rel="noreferrer">
                  Storefront <ExternalLinkIcon />
                </a>
              </Button>
            )}
            {!provisioning && <OpenStoreAdminButton tenantId={tenant.id} />}
            <StatusActions tenantId={tenant.id} tenantName={tenant.name} status={tenant.status} />
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <TenantStatusBadge status={tenant.status} />
        <BillingStateBadge state={billing.state} daysUntilDue={billing.daysUntilDue} />
        {sub && (
          <span className="text-muted-foreground tabular-nums">
            {sub.plan.name} · {formatPrice(sub.price)} {PER_CYCLE[sub.billingCycle]}
          </span>
        )}
        {tenant.statusReason && <span className="text-muted-foreground">Reason: {tenant.statusReason}</span>}
        {tenant.statusChangedAt && (
          <span className="text-muted-foreground">since {formatDateTime(tenant.statusChangedAt)}</span>
        )}
      </div>

      {provisioning ? (
        <ProvisioningPanel tenantId={tenant.id} error={tenant.provisioningError} />
      ) : (
        <Tabs defaultValue="overview" className="gap-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="theme">Theme</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="grid gap-4 lg:grid-cols-2">
            <TenantDetailsForm tenant={tenant} />
            <div className="grid content-start gap-4">
              <OwnerAccessCard tenantId={tenant.id} ownerAccount={tenant.ownerAccount} ownerEmail={tenant.owner.email} />
              <DomainsCard tenantId={tenant.id} domains={tenant.domains} />
              <Card>
                <CardHeader>
                  <CardTitle>Record</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-1 text-sm">
                  <p>
                    <span className="text-muted-foreground">Slug:</span> <span className="font-mono">{tenant.slug}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Created:</span> {formatDateTime(tenant.createdAt)}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Updated:</span> {formatDateTime(tenant.updatedAt)}
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="billing" className="grid gap-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <SubscriptionCard key={sub?.updatedAt ?? "unbilled"} tenantId={tenant.id} tenantName={tenant.name} billing={billing} plans={choosable} />
              {sub && (
                <div className="grid content-start gap-4">
                  <DueDateCard key={billing.dueDate ?? "none"} tenantId={tenant.id} tenantName={tenant.name} billing={billing} />
                  <RecordPaymentCard key={sub.price} tenantId={tenant.id} tenantName={tenant.name} status={tenant.status} billing={billing} />
                </div>
              )}
            </div>
            <section id="payments" className="grid gap-3">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-base font-semibold">Payments</h2>
                {payments.total > payments.items.length && (
                  <Link href={`/payments?status=all&q=${encodeURIComponent(tenant.slug)}`} className="text-sm text-muted-foreground hover:underline">
                    All {payments.total} payments →
                  </Link>
                )}
              </div>
              {payments.items.length > 0 ? (
                <PaymentsTable payments={payments.items} showStore={false} />
              ) : (
                <p className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
                  No payments yet. The owner sends them from /admin → Billing; record one here if they paid another way.
                </p>
              )}
            </section>
          </TabsContent>

          <TabsContent value="features">
            <FeaturesCard key={JSON.stringify(billing.features.overrides)} tenantId={tenant.id} billing={billing} catalogue={catalogue} />
          </TabsContent>

          <TabsContent value="theme">
            <ThemeEditor tenantId={tenant.id} savedTheme={tenant.theme} presets={presets} />
          </TabsContent>
        </Tabs>
      )}

      <p className="text-sm">
        <Link href="/tenants" className="text-muted-foreground hover:underline">
          ← All tenants
        </Link>
      </p>
    </>
  );
}
