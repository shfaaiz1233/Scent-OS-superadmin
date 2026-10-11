"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { FeatureOverridesEditor } from "@/components/features-editor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { FeatureInfo, FeatureOverrides, Features, TenantBilling } from "@/lib/api/types";
import { setFeatureOverridesAction } from "../actions";

/** Every feature on, no limits: what stores without a subscription get. */
const unlimited = (catalogue: FeatureInfo[]) =>
  Object.fromEntries(catalogue.map((f) => [f.key, f.type === "boolean" ? true : null])) as Features;

const sameOverrides = (a: FeatureOverrides, b: FeatureOverrides) => JSON.stringify(Object.entries(a).sort()) === JSON.stringify(Object.entries(b).sort());

/** The store's features: its plan's, and per-feature overrides (e.g. more staff, or the slider on a smaller plan). */
export function FeaturesCard({ tenantId, billing, catalogue }: { tenantId: string; billing: TenantBilling; catalogue: FeatureInfo[] }) {
  const saved = billing.features.overrides;
  const [overrides, setOverrides] = useState<FeatureOverrides>(saved);
  const [pending, startTransition] = useTransition();
  const base = billing.features.plan ?? unlimited(catalogue);
  const changed = !sameOverrides(overrides, saved);

  function save() {
    startTransition(async () => {
      const result = await setFeatureOverridesAction(tenantId, overrides);
      if (result.ok) toast.success("Features saved: the store has them now");
      else toast.error(result.error);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Features</CardTitle>
        <CardDescription>
          {billing.subscription
            ? `From the ${billing.subscription.plan.name} plan. Override a feature to give this store something different; the rest follow the plan.`
            : "Not billed, so the store gets every feature. Overrides can still restrict it."}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <FeatureOverridesEditor catalogue={catalogue} base={base} value={overrides} onChange={setOverrides} />
        <div className="flex justify-end gap-2">
          <Button variant="outline" disabled={!changed || pending} onClick={() => setOverrides(saved)}>
            Discard
          </Button>
          <Button disabled={!changed || pending} onClick={save}>
            {pending ? "Saving…" : "Save features"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
