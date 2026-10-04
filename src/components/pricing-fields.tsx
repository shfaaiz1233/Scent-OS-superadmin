"use client";

import { FormField } from "@/components/form-field";
import { MoneyInput } from "@/components/money-input";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { BillingCycle, Plan, PricingMode } from "@/lib/api/types";
import { formatPrice } from "@/lib/format";
import { CYCLE_LABEL, PER_CYCLE, PRICING_MODES, type PricingDraft, previewPrice, toSubscriptionInput } from "@/lib/pricing";

/** Plan, billing cycle and pricing, with the resulting price. */
export function PricingFields({
  plans,
  value,
  onChange,
  errors = {},
  idPrefix = "pricing",
}: {
  plans: Plan[];
  value: PricingDraft;
  onChange: (value: PricingDraft) => void;
  errors?: Record<string, string>;
  idPrefix?: string;
}) {
  const plan = plans.find((p) => p.id === value.planId);
  const input = toSubscriptionInput(value);
  const price = plan ? previewPrice(plan, value.billingCycle, value.pricingMode, input.pricingValue) : null;
  const set = (patch: Partial<PricingDraft>) => onChange({ ...value, ...patch });

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField id={`${idPrefix}-plan`} label="Plan" error={errors.planId}>
        <Select value={value.planId} onValueChange={(planId) => set({ planId })}>
          <SelectTrigger id={`${idPrefix}-plan`} className="w-full">
            <SelectValue placeholder="Choose a plan" />
          </SelectTrigger>
          <SelectContent>
            {plans.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
                {!p.isActive && " (inactive)"} · {formatPrice(p.priceMonthly)}/mo
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>
      <FormField id={`${idPrefix}-cycle`} label="Billing cycle" error={errors.billingCycle}>
        <Select value={value.billingCycle} onValueChange={(billingCycle) => set({ billingCycle: billingCycle as BillingCycle })}>
          <SelectTrigger id={`${idPrefix}-cycle`} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(["MONTHLY", "YEARLY"] as const).map((cycle) => (
              <SelectItem key={cycle} value={cycle}>
                {CYCLE_LABEL[cycle]}
                {plan && ` · ${formatPrice(cycle === "MONTHLY" ? plan.priceMonthly : plan.priceYearly)}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>
      <FormField id={`${idPrefix}-mode`} label="Pricing" error={errors.pricingMode}>
        <Select value={value.pricingMode} onValueChange={(pricingMode) => set({ pricingMode: pricingMode as PricingMode, pricingValue: "" })}>
          <SelectTrigger id={`${idPrefix}-mode`} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PRICING_MODES.map((mode) => (
              <SelectItem key={mode.value} value={mode.value}>
                {mode.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>
      {value.pricingMode !== "PLAN" ? (
        <FormField
          id={`${idPrefix}-value`}
          label={value.pricingMode === "PERCENT_OFF" ? "Percentage off" : value.pricingMode === "AMOUNT_OFF" ? "Amount off" : "Price"}
          error={errors.pricingValue}
        >
          {value.pricingMode === "PERCENT_OFF" ? (
            <div className="relative">
              <Input
                id={`${idPrefix}-value`}
                type="number"
                min={1}
                max={100}
                value={value.pricingValue}
                onChange={(e) => set({ pricingValue: e.target.value })}
                className="pr-8 tabular-nums"
              />
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">%</span>
            </div>
          ) : (
            <MoneyInput id={`${idPrefix}-value`} value={value.pricingValue} onChange={(e) => set({ pricingValue: e.target.value })} />
          )}
        </FormField>
      ) : (
        <div />
      )}
      <p className="text-sm sm:col-span-2">
        {price === null ? (
          <span className="text-muted-foreground">{plan ? "Enter a valid amount to see the price." : "Choose a plan."}</span>
        ) : (
          <>
            The store pays <strong className="tabular-nums">{formatPrice(price)}</strong> {PER_CYCLE[value.billingCycle]}.
          </>
        )}
      </p>
    </div>
  );
}
