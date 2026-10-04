import type { BillingCycle, Plan, PricingMode } from "@/lib/api/types";
import { formatPrice, parseRupees } from "@/lib/format";

/** The pricing fields as typed: `pricingValue` is a percentage, or rupees, as text. */
export type PricingDraft = { planId: string; billingCycle: BillingCycle; pricingMode: PricingMode; pricingValue: string };

export type SubscriptionInput = { planId: string; billingCycle: BillingCycle; pricingMode: PricingMode; pricingValue: number | null };

/** What the API takes: percentages as whole numbers, amounts in minor units, null for the plan price. */
export function toSubscriptionInput(draft: PricingDraft): SubscriptionInput {
  const text = draft.pricingValue.trim();
  let value: number | null = null;
  if (draft.pricingMode === "PERCENT_OFF") value = text ? Math.round(Number(text)) : null;
  else if (draft.pricingMode !== "PLAN") value = text ? parseRupees(text) : null;
  return { planId: draft.planId, billingCycle: draft.billingCycle, pricingMode: draft.pricingMode, pricingValue: value };
}

// A subscription's price, worked out like the API does (services/billing.service.ts) so forms can
// preview it. The API recomputes and stores the real one.

export const PRICING_MODES: { value: PricingMode; label: string }[] = [
  { value: "PLAN", label: "Plan price" },
  { value: "PERCENT_OFF", label: "Percentage off" },
  { value: "AMOUNT_OFF", label: "Amount off" },
  { value: "CUSTOM", label: "Custom price" },
];

export const CYCLE_LABEL: Record<BillingCycle, string> = { MONTHLY: "Monthly", YEARLY: "Yearly" };
export const PER_CYCLE: Record<BillingCycle, string> = { MONTHLY: "per month", YEARLY: "per year" };

export const planPrice = (plan: Pick<Plan, "priceMonthly" | "priceYearly">, cycle: BillingCycle) =>
  cycle === "MONTHLY" ? plan.priceMonthly : plan.priceYearly;

/** The price per cycle in minor units, or null while the value is missing or out of range. */
export function previewPrice(plan: Pick<Plan, "priceMonthly" | "priceYearly">, cycle: BillingCycle, mode: PricingMode, value: number | null): number | null {
  const base = planPrice(plan, cycle);
  if (mode === "PLAN") return base;
  if (value === null || value < 0) return null;
  if (mode === "PERCENT_OFF") return value >= 1 && value <= 100 ? Math.round((base * (100 - value)) / 10_000) * 100 : null;
  if (mode === "AMOUNT_OFF") return value >= 1 && value <= base ? base - value : null;
  return value;
}

/** "20% off Growth" / "Rs 1,000 off" / "Custom price" / "Plan price": how a subscription is priced. */
export function pricingLabel(mode: PricingMode, value: number | null): string {
  if (mode === "PERCENT_OFF") return `${value}% off the plan`;
  if (mode === "AMOUNT_OFF") return `${formatPrice(value ?? 0)} off the plan`;
  if (mode === "CUSTOM") return "Custom price";
  return "Plan price";
}
