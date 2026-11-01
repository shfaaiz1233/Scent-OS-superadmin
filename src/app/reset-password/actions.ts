"use server";

import { redirect } from "next/navigation";
import { type ActionResult, formValues, toActionError } from "@/lib/action-result";
import { api } from "@/lib/api/server";

export async function resetPasswordAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const password = String(formData.get("password") ?? "");
  if (password !== String(formData.get("confirm") ?? "")) {
    return { ok: false, error: "The passwords don’t match.", fieldErrors: { confirm: "The passwords don’t match." } };
  }

  try {
    await api<void>("/api/superadmin/auth/reset-password", {
      method: "POST",
      auth: false,
      body: { token: String(formData.get("token") ?? ""), password },
    });
  } catch (err) {
    return toActionError(err, formValues(formData));
  }
  redirect("/login?reset=1");
}
