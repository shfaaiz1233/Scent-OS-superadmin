"use server";

import { revalidatePath } from "next/cache";
import { type ActionResult, toActionError } from "@/lib/action-result";
import { api } from "@/lib/api/server";
import type { BillingRun, PlatformSettings } from "@/lib/api/types";

export type SettingsInput = {
  notificationEmail: string | null;
  whatsappNumber: string | null;
  bankAccounts: { bankName: string; accountTitle: string; accountNumber: string; iban: string | null }[];
  reminderDaysBefore: number;
  graceDays: number;
};

export async function saveSettingsAction(input: SettingsInput): Promise<ActionResult<PlatformSettings>> {
  try {
    const settings = await api<PlatformSettings>("/api/superadmin/settings", { method: "PUT", body: input });
    revalidatePath("/settings");
    return { ok: true, data: settings };
  } catch (err) {
    return toActionError(err);
  }
}

/** Run the daily billing job now (it runs by itself every day on production only). */
export async function runBillingAction(): Promise<ActionResult<BillingRun>> {
  try {
    const run = await api<BillingRun>("/api/superadmin/billing/run", { method: "POST" });
    revalidatePath("/tenants");
    revalidatePath("/payments");
    return { ok: true, data: run };
  } catch (err) {
    return toActionError(err);
  }
}
