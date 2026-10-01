"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { TenantStatus } from "@/lib/api/types";
import { activateTenantAction, suspendTenantAction } from "../actions";

/** Activate / Suspend, each behind a confirmation that states the effect. */
export function StatusActions({ tenantId, tenantName, status }: { tenantId: string; tenantName: string; status: TenantStatus }) {
  const [pending, startTransition] = useTransition();
  const [reason, setReason] = useState("");
  const canActivate = status === "SETUP" || status === "SUSPENDED";
  const canSuspend = status === "SETUP" || status === "ACTIVE";

  function run(action: () => Promise<{ ok: boolean; error?: string }>, success: string) {
    startTransition(async () => {
      const result = await action();
      if (result.ok) toast.success(success);
      else toast.error(result.error);
    });
  }

  return (
    <>
      {canActivate && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button disabled={pending}>Activate</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Activate {tenantName}?</AlertDialogTitle>
              <AlertDialogDescription>
                The storefront goes live immediately: shoppers can browse and order. You can suspend it again at any time.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => run(() => activateTenantAction(tenantId), `${tenantName} is live`)}>
                Activate
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {canSuspend && (
        <AlertDialog onOpenChange={(open) => !open && setReason("")}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={pending}>
              Suspend
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Suspend {tenantName}?</AlertDialogTitle>
              <AlertDialogDescription>
                The storefront shows &ldquo;Temporarily unavailable&rdquo; immediately. Data and staff access are kept;
                reactivate any time.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="grid gap-2">
              <Label htmlFor="suspend-reason">Reason (shown in the console and audit log)</Label>
              <Textarea id="suspend-reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Subscription unpaid" />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                disabled={reason.trim().length < 3}
                onClick={() => run(() => suspendTenantAction(tenantId, reason.trim()), `${tenantName} is suspended`)}
                className="bg-destructive text-white hover:bg-destructive/90"
              >
                Suspend
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
