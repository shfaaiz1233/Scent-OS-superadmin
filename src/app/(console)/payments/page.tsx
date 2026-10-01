import { CreditCardIcon } from "lucide-react";
import type { Metadata } from "next";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = { title: "Payments" };

export default function PaymentsPage() {
  return (
    <>
      <PageHeader title="Payments" description="Subscription payments from tenants." />
      <EmptyState
        icon={CreditCardIcon}
        title="Payments arrive in Phase 5"
        description="Receipts tenants upload appear here for you to verify. Confirming a payment renews the subscription."
      />
    </>
  );
}
