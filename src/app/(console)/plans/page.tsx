import { PackageIcon } from "lucide-react";
import type { Metadata } from "next";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = { title: "Plans" };

export default function PlansPage() {
  return (
    <>
      <PageHeader title="Plans" description="Subscription plans and their feature flags." />
      <EmptyState
        icon={PackageIcon}
        title="Plans arrive in Phase 5"
        description="Create plans with monthly and yearly prices and feature flags. Per tenant you can apply a discount or a custom price."
      />
    </>
  );
}
