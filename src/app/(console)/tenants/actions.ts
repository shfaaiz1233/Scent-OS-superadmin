"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { type ActionResult, formValues, toActionError } from "@/lib/action-result";
import { api } from "@/lib/api/server";
import type {
  AdminAccessLink,
  BillingCycle,
  BillingPayment,
  FeatureOverrides,
  OwnerInvite,
  PaymentMethod,
  PricingMode,
  TenantBilling,
  TenantDetail,
  Theme,
} from "@/lib/api/types";
import { type SubscriptionInput, toSubscriptionInput } from "@/lib/pricing";

const text = (formData: FormData, key: string) => String(formData.get(key) ?? "").trim();

function refreshTenant(id: string) {
  revalidatePath(`/tenants/${id}`);
  revalidatePath("/tenants");
}

export async function createTenantAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  // Billing is optional: without a plan the store isn't billed (set it up later on its Billing tab).
  const planId = text(formData, "planId");
  const subscription = planId
    ? toSubscriptionInput({
        planId,
        billingCycle: (text(formData, "billingCycle") || "MONTHLY") as BillingCycle,
        pricingMode: (text(formData, "pricingMode") || "PLAN") as PricingMode,
        pricingValue: text(formData, "pricingValue"),
      })
    : undefined;
  let tenant: TenantDetail;
  try {
    tenant = await api<TenantDetail>("/api/superadmin/tenants", {
      method: "POST",
      body: {
        name: text(formData, "name"),
        slug: text(formData, "slug"),
        ownerName: text(formData, "ownerName"),
        ownerEmail: text(formData, "ownerEmail"),
        ownerPhone: text(formData, "ownerPhone"),
        // One per line (commas also accepted); the first is the primary domain.
        domains: text(formData, "domains")
          .split(/[\n,]+/)
          .map((d) => d.trim())
          .filter(Boolean),
        themePreset: text(formData, "themePreset") || undefined,
        subscription,
      },
    });
  } catch (err) {
    return toActionError(err, formValues(formData));
  }
  revalidatePath("/tenants");
  redirect(`/tenants/${tenant.id}`);
}

export async function updateTenantAction(
  id: string,
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  // Send only fields that were filled in; the API rejects an empty update.
  const body = Object.fromEntries(
    ["name", "ownerName", "ownerEmail", "ownerPhone"].map((key) => [key, text(formData, key)]).filter(([, v]) => v),
  );
  try {
    await api<TenantDetail>(`/api/superadmin/tenants/${id}`, { method: "PATCH", body });
  } catch (err) {
    return toActionError(err, formValues(formData));
  }
  refreshTenant(id);
  return { ok: true, data: undefined };
}

export async function activateTenantAction(id: string): Promise<ActionResult> {
  try {
    await api<TenantDetail>(`/api/superadmin/tenants/${id}/activate`, { method: "POST" });
  } catch (err) {
    return toActionError(err);
  }
  refreshTenant(id);
  return { ok: true, data: undefined };
}

export async function suspendTenantAction(id: string, reason: string): Promise<ActionResult> {
  try {
    await api<TenantDetail>(`/api/superadmin/tenants/${id}/suspend`, { method: "POST", body: { reason } });
  } catch (err) {
    return toActionError(err);
  }
  refreshTenant(id);
  return { ok: true, data: undefined };
}

export async function retryProvisioningAction(id: string): Promise<ActionResult> {
  try {
    await api<TenantDetail>(`/api/superadmin/tenants/${id}/provisioning/retry`, { method: "POST" });
  } catch (err) {
    return toActionError(err);
  }
  refreshTenant(id);
  return { ok: true, data: undefined };
}

export async function saveThemeAction(id: string, theme: Theme): Promise<ActionResult> {
  try {
    await api<TenantDetail>(`/api/superadmin/tenants/${id}/theme`, { method: "PUT", body: { theme } });
  } catch (err) {
    return toActionError(err);
  }
  refreshTenant(id);
  return { ok: true, data: undefined };
}

export async function addDomainAction(id: string, _prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  try {
    await api<TenantDetail>(`/api/superadmin/tenants/${id}/domains`, {
      method: "POST",
      body: { domain: text(formData, "domain") },
    });
  } catch (err) {
    return toActionError(err, formValues(formData));
  }
  refreshTenant(id);
  return { ok: true, data: undefined };
}

export async function setPrimaryDomainAction(id: string, domainId: string): Promise<ActionResult> {
  try {
    await api<TenantDetail>(`/api/superadmin/tenants/${id}/domains/${domainId}/primary`, { method: "POST" });
  } catch (err) {
    return toActionError(err);
  }
  refreshTenant(id);
  return { ok: true, data: undefined };
}

export async function removeDomainAction(id: string, domainId: string): Promise<ActionResult> {
  try {
    await api<TenantDetail>(`/api/superadmin/tenants/${id}/domains/${domainId}`, { method: "DELETE" });
  } catch (err) {
    return toActionError(err);
  }
  refreshTenant(id);
  return { ok: true, data: undefined };
}

/** A one-time link that signs the superadmin in to the store's /admin as "Platform" (audited by the API). */
export async function createAdminAccessLinkAction(id: string): Promise<ActionResult<AdminAccessLink>> {
  try {
    return { ok: true, data: await api<AdminAccessLink>(`/api/superadmin/tenants/${id}/admin-access`, { method: "POST" }) };
  } catch (err) {
    return toActionError(err);
  }
}

export async function createOwnerInviteAction(id: string): Promise<ActionResult<OwnerInvite>> {
  try {
    const invite = await api<OwnerInvite>(`/api/superadmin/tenants/${id}/owner-invite`, { method: "POST" });
    refreshTenant(id);
    return { ok: true, data: invite };
  } catch (err) {
    return toActionError(err);
  }
}

// Billing (the store page's Billing and Features tabs)

export async function setSubscriptionAction(id: string, input: SubscriptionInput): Promise<ActionResult<TenantBilling>> {
  try {
    const billing = await api<TenantBilling>(`/api/superadmin/tenants/${id}/subscription`, { method: "PUT", body: input });
    refreshTenant(id);
    revalidatePath("/plans");
    return { ok: true, data: billing };
  } catch (err) {
    return toActionError(err);
  }
}

export async function setPeriodEndAction(id: string, periodEnd: string, reason: string): Promise<ActionResult<TenantBilling>> {
  try {
    const billing = await api<TenantBilling>(`/api/superadmin/tenants/${id}/subscription/period`, { method: "POST", body: { periodEnd, reason } });
    refreshTenant(id);
    return { ok: true, data: billing };
  } catch (err) {
    return toActionError(err);
  }
}

export async function recordPaymentAction(
  id: string,
  input: { amount: number; method: PaymentMethod; reference: string | null; note: string | null },
): Promise<ActionResult<BillingPayment>> {
  try {
    const payment = await api<BillingPayment>(`/api/superadmin/tenants/${id}/payments`, { method: "POST", body: input });
    refreshTenant(id);
    revalidatePath("/payments");
    return { ok: true, data: payment };
  } catch (err) {
    return toActionError(err);
  }
}

export async function setFeatureOverridesAction(id: string, overrides: FeatureOverrides): Promise<ActionResult<TenantBilling>> {
  try {
    const billing = await api<TenantBilling>(`/api/superadmin/tenants/${id}/features`, { method: "PUT", body: { overrides } });
    refreshTenant(id);
    return { ok: true, data: billing };
  } catch (err) {
    return toActionError(err);
  }
}
