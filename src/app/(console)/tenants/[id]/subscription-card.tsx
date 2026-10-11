"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { PricingFields } from "@/components/pricing-fields";
import { BillingStateBadge } from "@/components/status-badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Plan, TenantBilling } from "@/lib/api/types";
import { formatDay, formatPrice } from "@/lib/format";
import { CYCLE_LABEL, PER_CYCLE, type PricingDraft, previewPrice, pricingLabel, toSubscriptionInput } from "@/lib/pricing";
import { setSubscriptionAction } from "../actions";

function standing(billing: TenantBilling): string {
  const due = billing.dueDate ? formatDay(billing.dueDate) : null;
  switch (billing.state) {
    case "UNBILLED":
      return "Not billed: the store gets every feature and pays nothing.";
    case "AWAITING_PAYMENT":
      return "Waiting for the first payment. Confirming it starts the first period (and opens the store).";
    case "PAID":
      return `Paid until ${due}.`;
    case "DUE_SOON":
      return `Due on ${due}, in ${billing.daysUntilDue} day${billing.daysUntilDue === 1 ? "" : "s"}. The owner has been reminded.`;
    case "OVERDUE":
      return `Due on ${due}. Still live; suspended after ${billing.graceEndsOn ? formatDay(billing.graceEndsOn) : "the grace period"} unless paid.`;
    case "SUSPENDED":
      return `Unpaid since ${due}: suspended. Confirming a payment reopens it.`;
  }
}

const draftFrom = (billing: TenantBilling, plans: Plan[]): PricingDraft => {
  const sub = billing.subscription;
  if (!sub) return { planId: plans.find((p) => p.isActive)?.id ?? "", billingCycle: "MONTHLY", pricingMode: "PLAN", pricingValue: "" };
  const value = sub.pricingValue === null ? "" : sub.pricingMode === "PERCENT_OFF" ? String(sub.pricingValue) : String(sub.pricingValue / 100);
  return { planId: sub.plan.id, billingCycle: sub.billingCycle, pricingMode: sub.pricingMode, pricingValue: value };
};

/** The store's plan, price and where it stands; change the plan, cycle or pricing (with a confirmation). */
export function SubscriptionCard({ tenantId, tenantName, billing, plans }: { tenantId: string; tenantName: string; billing: TenantBilling; plans: Plan[] }) {
  const sub = billing.subscription;
  const [draft, setDraft] = useState<PricingDraft>(() => draftFrom(billing, plans));
  const [editing, setEditing] = useState(!sub);
  const [confirming, setConfirming] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();

  const plan = plans.find((p) => p.id === draft.planId);
  const input = toSubscriptionInput(draft);
  const newPrice = plan ? previewPrice(plan, draft.billingCycle, draft.pricingMode, input.pricingValue) : null;

  function save() {
    startTransition(async () => {
      const result = await setSubscriptionAction(tenantId, input);
      if (result.ok) {
        setErrors({});
        setEditing(false);
        toast.success(sub ? "Subscription updated" : `${tenantName} is now billed`);
      } else {
        setErrors(result.fieldErrors ?? {});
        toast.error(result.error);
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription</CardTitle>
        <CardDescription>{standing(billing)}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <BillingStateBadge state={billing.state} daysUntilDue={billing.daysUntilDue} />
          {billing.paymentsToReview > 0 && (
            <a href="#payments" className="text-sm underline-offset-4 hover:underline">
              {billing.paymentsToReview} payment{billing.paymentsToReview === 1 ? "" : "s"} to check
            </a>
          )}
        </div>

        {sub && (
          <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Plan</dt>
              <dd>
                {sub.plan.name}
                {!sub.plan.isActive && " (inactive plan)"} · {CYCLE_LABEL[sub.billingCycle]}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Price</dt>
              <dd className="tabular-nums">
                {formatPrice(sub.price)} {PER_CYCLE[sub.billingCycle]}
                <span className="text-muted-foreground">
                  {" "}
                  · {pricingLabel(sub.pricingMode, sub.pricingValue)}
                  {sub.price !== sub.planPrice && sub.pricingMode === "PLAN" && ` (plan now ${formatPrice(sub.planPrice)})`}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Paid period</dt>
              <dd>
                {sub.currentPeriodStart && sub.currentPeriodEnd
                  ? `${formatDay(sub.currentPeriodStart)} – ${formatDay(sub.currentPeriodEnd)}`
                  : "Starts with the first payment"}
              </dd>
            </div>
          </dl>
        )}

        {editing ? (
          <div className="grid gap-4 rounded-md border p-4">
            <PricingFields plans={plans} value={draft} onChange={setDraft} errors={errors} idPrefix="subscription" />
            <div className="flex justify-end gap-2">
              {sub && (
                <Button variant="outline" onClick={() => (setDraft(draftFrom(billing, plans)), setEditing(false), setErrors({}))}>
                  Cancel
                </Button>
              )}
              <Button disabled={pending || newPrice === null} onClick={() => setConfirming(true)}>
                {pending ? "Saving…" : sub ? "Save subscription" : "Start billing"}
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <Button variant="outline" onClick={() => setEditing(true)}>
              Change plan or price
            </Button>
          </div>
        )}
      </CardContent>

      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{sub ? `Change ${tenantName}’s subscription?` : `Start billing ${tenantName}?`}</AlertDialogTitle>
            <AlertDialogDescription>
              {plan && newPrice !== null && (
                <>
                  {plan.name}, {formatPrice(newPrice)} {PER_CYCLE[draft.billingCycle]}
                  {sub ? ` (now ${formatPrice(sub.price)} ${PER_CYCLE[sub.billingCycle]})` : ""}. The store gets this plan’s features
                  immediately.{" "}
                  {sub
                    ? billing.dueDate
                      ? `The due date stays ${formatDay(billing.dueDate)}; the new price applies from the next payment.`
                      : "The new price applies to the first payment."
                    : newPrice === 0
                      ? "It’s free: the first period starts today."
                      : "Its first period starts when you confirm its first payment."}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={save}>{sub ? "Save subscription" : "Start billing"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
