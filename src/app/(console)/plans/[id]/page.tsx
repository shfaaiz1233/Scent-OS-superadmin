import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ApiError, api } from "@/lib/api/server";
import type { FeatureInfo, Plan } from "@/lib/api/types";
import { PlanForm } from "../plan-form";
import { DeletePlanButton } from "./delete-plan-button";

async function getPlan(id: string): Promise<Plan> {
  try {
    return await api<Plan>(`/api/superadmin/plans/${encodeURIComponent(id)}`);
  } catch (err) {
    if (err instanceof ApiError && (err.status === 404 || err.status === 400)) notFound();
    throw err;
  }
}

export async function generateMetadata({ params }: PageProps<"/plans/[id]">): Promise<Metadata> {
  const { id } = await params;
  return { title: (await getPlan(id)).name };
}

export default async function PlanPage({ params }: PageProps<"/plans/[id]">) {
  const { id } = await params;
  const [plan, catalogue] = await Promise.all([getPlan(id), api<FeatureInfo[]>("/api/superadmin/features")]);

  return (
    <>
      <PageHeader
        title={plan.name}
        description={plan.description ?? "A subscription plan."}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href={`/tenants?planId=${plan.id}`}>
                Stores on this plan <Badge variant="secondary">{plan.subscriberCount}</Badge>
              </Link>
            </Button>
            <DeletePlanButton planId={plan.id} planName={plan.name} subscriberCount={plan.subscriberCount} />
          </>
        }
      />
      <PlanForm key={plan.updatedAt} plan={plan} catalogue={catalogue} defaults={plan.features} />
    </>
  );
}
