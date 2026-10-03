import { ExternalLinkIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { TenantStatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApiError, api } from "@/lib/api/server";
import type { TenantDetail, ThemePreset } from "@/lib/api/types";
import { formatDateTime } from "@/lib/format";
import { DomainsCard } from "./domains-card";
import { OpenStoreAdminButton } from "./open-store-admin-button";
import { OwnerAccessCard } from "./owner-access-card";
import { ProvisioningPanel } from "./provisioning-panel";
import { StatusActions } from "./status-actions";
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
  const [tenant, presets] = await Promise.all([getTenant(id), api<ThemePreset[]>("/api/superadmin/theme-presets")]);
  const provisioning = tenant.status === "PROVISIONING";

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
