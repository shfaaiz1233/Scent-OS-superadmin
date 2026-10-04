import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { api } from "@/lib/api/server";
import type { PlatformSettings } from "@/lib/api/types";
import { BillingRunCard } from "./billing-run-card";
import { SettingsForm } from "./settings-form";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const settings = await api<PlatformSettings>("/api/superadmin/settings");

  return (
    <>
      <PageHeader title="Settings" description="Billing: where owners pay you, reminders and grace days, and where billing news goes." />
      <SettingsForm settings={settings} />
      <BillingRunCard schedule={settings.billingJobSchedule} />
    </>
  );
}
