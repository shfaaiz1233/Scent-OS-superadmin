import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { api } from "@/lib/api/server";
import type { FeatureInfo, Features } from "@/lib/api/types";
import { PlanForm } from "../plan-form";

export const metadata: Metadata = { title: "New plan" };

export default async function NewPlanPage() {
  const catalogue = await api<FeatureInfo[]>("/api/superadmin/features");
  const defaults = Object.fromEntries(catalogue.map((feature) => [feature.key, feature.default])) as Features;

  return (
    <>
      <PageHeader title="New plan" description="Prices in rupees per month and per year, and the features stores on it get." />
      <PlanForm catalogue={catalogue} defaults={defaults} />
    </>
  );
}
