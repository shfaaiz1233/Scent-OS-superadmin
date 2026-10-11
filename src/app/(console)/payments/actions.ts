"use server";

import { revalidatePath } from "next/cache";
import { type ActionResult, toActionError } from "@/lib/action-result";
import { api } from "@/lib/api/server";
import type { BillingPayment, ReceiptLink } from "@/lib/api/types";

/** A payment changes the store's billing and status: refresh the lists and the store's page. */
function refresh(payment: BillingPayment) {
  revalidatePath("/payments");
  revalidatePath("/tenants");
  revalidatePath(`/tenants/${payment.tenant.id}`);
}

export async function confirmPaymentAction(id: string, input: { amount?: number; note: string | null }): Promise<ActionResult<BillingPayment>> {
  try {
    const payment = await api<BillingPayment>(`/api/superadmin/payments/${id}/confirm`, { method: "POST", body: input });
    refresh(payment);
    return { ok: true, data: payment };
  } catch (err) {
    return toActionError(err);
  }
}

export async function rejectPaymentAction(id: string, reason: string): Promise<ActionResult<BillingPayment>> {
  try {
    const payment = await api<BillingPayment>(`/api/superadmin/payments/${id}/reject`, { method: "POST", body: { reason } });
    refresh(payment);
    return { ok: true, data: payment };
  } catch (err) {
    return toActionError(err);
  }
}

/** A 10-minute link to the receipt in private storage. */
export async function receiptLinkAction(id: string): Promise<ActionResult<ReceiptLink>> {
  try {
    return { ok: true, data: await api<ReceiptLink>(`/api/superadmin/payments/${id}/receipt`) };
  } catch (err) {
    return toActionError(err);
  }
}
