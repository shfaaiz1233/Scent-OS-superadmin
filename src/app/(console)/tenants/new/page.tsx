import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { api } from "@/lib/api/server";
import type { Plan, ThemePreset } from "@/lib/api/types";
import { NewTenantForm } from "./new-tenant-form";

export const metadata: Metadata = { title: "New tenant" };

export default async function NewTenantPage() {
  const [presets, plans] = await Promise.all([
    api<ThemePreset[]>("/api/superadmin/theme-presets"),
    api<Plan[]>("/api/superadmin/plans?status=active"),
  ]);

  return (
    <>
      <PageHeader
        title="New tenant"
        description="Creates the store and provisions its database schema. The owner then sets a password with a link you send them."
      />
      <NewTenantForm presets={presets} plans={plans} />
    </>
  );
}
