"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { type ActionResult, toActionError } from "@/lib/action-result";
import { api } from "@/lib/api/server";
import type { Features, Plan } from "@/lib/api/types";

export type PlanInput = {
  name: string;
  description: string | null;
  priceMonthly: number;
  priceYearly: number;
  features: Features;
  isActive: boolean;
};

function refreshPlans(id?: string) {
  revalidatePath("/plans");
  if (id) revalidatePath(`/plans/${id}`);
}

export async function createPlanAction(input: PlanInput): Promise<ActionResult> {
  let plan: Plan;
  try {
    plan = await api<Plan>("/api/superadmin/plans", { method: "POST", body: input });
  } catch (err) {
    return toActionError(err);
  }
  refreshPlans();
  redirect(`/plans/${plan.id}`);
}

export async function updatePlanAction(id: string, input: PlanInput): Promise<ActionResult<Plan>> {
  try {
    const plan = await api<Plan>(`/api/superadmin/plans/${id}`, { method: "PATCH", body: input });
    refreshPlans(id);
    return { ok: true, data: plan };
  } catch (err) {
    return toActionError(err);
  }
}

export async function deletePlanAction(id: string): Promise<ActionResult> {
  try {
    await api<void>(`/api/superadmin/plans/${id}`, { method: "DELETE" });
  } catch (err) {
    return toActionError(err);
  }
  refreshPlans();
  redirect("/plans");
}
