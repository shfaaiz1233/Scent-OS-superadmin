"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { PlanFeaturesEditor } from "@/components/features-editor";
import { FormField } from "@/components/form-field";
import { MoneyInput } from "@/components/money-input";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { ActionResult } from "@/lib/action-result";
import type { FeatureInfo, Features, Plan } from "@/lib/api/types";
import { parseRupees, rupeesInput } from "@/lib/format";
import { createPlanAction, type PlanInput, updatePlanAction } from "./actions";

const sameFeatures = (a: Features, b: Features) => (Object.keys(a) as (keyof Features)[]).every((key) => a[key] === b[key]);

/** Create or edit a plan. Editing a plan stores are on asks first: features change for all of them at once. */
export function PlanForm({ plan, catalogue, defaults }: { plan?: Plan; catalogue: FeatureInfo[]; defaults: Features }) {
  const [name, setName] = useState(plan?.name ?? "");
  const [description, setDescription] = useState(plan?.description ?? "");
  const [monthly, setMonthly] = useState(plan ? rupeesInput(plan.priceMonthly) : "");
  const [yearly, setYearly] = useState(plan ? rupeesInput(plan.priceYearly) : "");
  const [isActive, setIsActive] = useState(plan?.isActive ?? true);
  const [features, setFeatures] = useState<Features>(plan?.features ?? defaults);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  function input(): PlanInput | null {
    const priceMonthly = parseRupees(monthly);
    const priceYearly = parseRupees(yearly);
    const problems: Record<string, string> = {};
    if (priceMonthly === null) problems.priceMonthly = "Enter the price in rupees, e.g. 4999";
    if (priceYearly === null) problems.priceYearly = "Enter the price in rupees, e.g. 49990";
    setErrors(problems);
    if (priceMonthly === null || priceYearly === null) return null;
    return { name: name.trim(), description: description.trim() || null, priceMonthly, priceYearly, features, isActive };
  }

  function save(body: PlanInput) {
    startTransition(async () => {
      const result: ActionResult<unknown> = plan ? await updatePlanAction(plan.id, body) : await createPlanAction(body);
      if (result.ok) toast.success(plan ? "Plan saved" : "Plan created");
      else {
        setErrors(result.fieldErrors ?? {});
        toast.error(result.error);
      }
    });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const body = input();
    if (!body) return;
    const affectsStores =
      plan && plan.subscriberCount > 0 &&
      (body.priceMonthly !== plan.priceMonthly || body.priceYearly !== plan.priceYearly || !sameFeatures(body.features, plan.features) || body.isActive !== plan.isActive);
    if (affectsStores) setConfirming(true);
    else save(body);
  }

  const stores = plan?.subscriberCount ?? 0;

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <Card className="content-start">
        <CardHeader>
          <CardTitle>Plan</CardTitle>
          <CardDescription>Owners see the name and description on their Billing page.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <FormField id="name" label="Name" error={errors.name}>
            <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Growth" maxLength={60} />
          </FormField>
          <FormField id="description" label="Description" hint="Optional, one or two sentences" error={errors.description}>
            <Textarea id="description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={300} />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="priceMonthly" label="Price per month" error={errors.priceMonthly}>
              <MoneyInput id="priceMonthly" required value={monthly} onChange={(e) => setMonthly(e.target.value)} placeholder="4999" />
            </FormField>
            <FormField id="priceYearly" label="Price per year" error={errors.priceYearly}>
              <MoneyInput id="priceYearly" required value={yearly} onChange={(e) => setYearly(e.target.value)} placeholder="49990" />
            </FormField>
          </div>
          <Label className="flex items-center gap-3 font-normal">
            <Switch checked={isActive} onCheckedChange={setIsActive} />
            <span>
              <span className="block text-sm font-medium">Active</span>
              <span className="block text-xs text-muted-foreground">Inactive plans can’t be chosen for a store; stores on them keep them.</span>
            </span>
          </Label>
          {plan && (
            <p className="text-sm text-muted-foreground">
              {stores === 0 ? "No stores are on this plan." : `${stores} store${stores === 1 ? " is" : "s are"} on this plan.`} New prices
              apply to new subscriptions; stores already on the plan keep their price until their subscription is saved again.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Features</CardTitle>
          <CardDescription>What stores on this plan get. Changes apply to every store on it at once; a store can override them.</CardDescription>
        </CardHeader>
        <CardContent>
          <PlanFeaturesEditor catalogue={catalogue} value={features} onChange={setFeatures} />
          {errors.features && <p className="mt-2 text-sm text-destructive">{errors.features}</p>}
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-3 lg:col-span-2">
        <Button variant="outline" asChild>
          <Link href="/plans">{plan ? "Back to plans" : "Cancel"}</Link>
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : plan ? "Save plan" : "Create plan"}
        </Button>
      </div>

      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change {plan?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              {stores} store{stores === 1 ? " is" : "s are"} on this plan. Feature changes apply to all of them immediately (their
              storefronts are refreshed). New prices apply only to new subscriptions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const body = input();
                if (body) save(body);
              }}
            >
              Save plan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  );
}
