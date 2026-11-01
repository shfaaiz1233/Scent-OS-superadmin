"use server";

import { type ActionResult, formValues, toActionError } from "@/lib/action-result";
import { api } from "@/lib/api/server";

export async function forgotPasswordAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  try {
    await api<void>("/api/superadmin/auth/forgot-password", {
      method: "POST",
      auth: false,
      body: { email: String(formData.get("email") ?? "") },
    });
  } catch (err) {
    return toActionError(err, formValues(formData));
  }
  return { ok: true, data: undefined };
}
