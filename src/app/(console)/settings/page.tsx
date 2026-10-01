import { SettingsIcon } from "lucide-react";
import type { Metadata } from "next";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" description="Platform settings." />
      <EmptyState
        icon={SettingsIcon}
        title="Settings arrive in Phase 5"
        description="Your notification email for the daily unpaid-tenants digest, the bank details tenants pay into, reminder and grace days."
      />
    </>
  );
}
