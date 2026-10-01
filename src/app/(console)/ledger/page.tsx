import { BookOpenTextIcon } from "lucide-react";
import type { Metadata } from "next";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = { title: "Ledger" };

export default function LedgerPage() {
  return (
    <>
      <PageHeader title="Ledger" description="Your earnings and tenants' completed sales." />
      <EmptyState
        icon={BookOpenTextIcon}
        title="Ledgers arrive in Phase 6"
        description="Confirmed subscription payments (your earnings) and each tenant's delivered-order revenue."
      />
    </>
  );
}
