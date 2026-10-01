import { StoreIcon } from "lucide-react";
import type { Metadata } from "next";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = { title: "Tenants" };

export default function TenantsPage() {
  return (
    <>
      <PageHeader title="Tenants" description="Every store on the platform." />
      <EmptyState
        icon={StoreIcon}
        title="Tenant management arrives in Phase 1"
        description="Create a tenant (its database schema is provisioned automatically), manage owner contacts, domains, status, theme and feature flags."
      />
    </>
  );
}
