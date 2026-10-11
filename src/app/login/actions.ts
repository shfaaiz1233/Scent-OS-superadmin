"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { type ActionResult, formValues, toActionError } from "@/lib/action-result";
import { api, SESSION_COOKIE } from "@/lib/api/server";
import type { SuperAdminSession } from "@/lib/api/types";

export async function loginAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  let session: SuperAdminSession;
  try {
    session = await api<SuperAdminSession>("/api/superadmin/auth/login", {
      method: "POST",
      auth: false,
      body: { email: String(formData.get("email") ?? ""), password: String(formData.get("password") ?? "") },
    });
  } catch (err) {
    return toActionError(err, formValues(formData));
  }

  (await cookies()).set(SESSION_COOKIE, session.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(session.expiresAt),
  });
  redirect("/");
}

export async function logoutAction(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/login");
}
