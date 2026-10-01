import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { api } from "@/lib/api/server";
import type { ThemePreset } from "@/lib/api/types";
import { NewTenantForm } from "./new-tenant-form";

export const metadata: Metadata = { title: "New tenant" };

export default async function NewTenantPage() {
  const presets = await api<ThemePreset[]>("/api/superadmin/theme-presets");

  return (
    <>
      <PageHeader
        title="New tenant"
        description="Creates the store and provisions its database schema. The owner then sets a password with a link you send them."
      />
      <NewTenantForm presets={presets} />
    </>
  );
}
