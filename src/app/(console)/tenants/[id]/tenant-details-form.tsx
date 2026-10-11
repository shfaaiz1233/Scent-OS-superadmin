"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { FormField } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { TenantDetail } from "@/lib/api/types";
import { updateTenantAction } from "../actions";

/** Store name and the owner's contact details (who you bill and contact). */
export function TenantDetailsForm({ tenant }: { tenant: TenantDetail }) {
  const [state, formAction, pending] = useActionState(updateTenantAction.bind(null, tenant.id), null);
  const failed = state && !state.ok ? state : null;
  const errors = failed?.fieldErrors ?? {};
  const values = failed?.values;

  useEffect(() => {
    if (state?.ok) toast.success("Saved");
  }, [state]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Store and owner</CardTitle>
        <CardDescription>
          Owner contacts are who you bill and contact. Changing the email here doesn&apos;t change the owner&apos;s sign-in.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="grid gap-4">
          <FormField id="name" label="Store name" error={errors.name}>
            <Input id="name" name="name" required defaultValue={values?.name ?? tenant.name} />
          </FormField>
          <FormField id="ownerName" label="Owner name" error={errors.ownerName}>
            <Input id="ownerName" name="ownerName" defaultValue={values?.ownerName ?? tenant.owner.name ?? ""} />
          </FormField>
          <FormField id="ownerEmail" label="Owner email" error={errors.ownerEmail}>
            <Input id="ownerEmail" name="ownerEmail" type="email" defaultValue={values?.ownerEmail ?? tenant.owner.email ?? ""} />
          </FormField>
          <FormField id="ownerPhone" label="Owner phone" error={errors.ownerPhone}>
            <Input id="ownerPhone" name="ownerPhone" type="tel" defaultValue={values?.ownerPhone ?? tenant.owner.phone ?? ""} />
          </FormField>
          <div className="flex items-center justify-end gap-3">
            {failed && !failed.fieldErrors && (
              <p role="alert" className="mr-auto text-sm text-destructive">
                {failed.error}
              </p>
            )}
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
