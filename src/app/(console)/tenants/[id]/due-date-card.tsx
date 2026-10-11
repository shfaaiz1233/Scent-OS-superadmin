"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { FormField } from "@/components/form-field";
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
import type { TenantBilling } from "@/lib/api/types";
import { formatDay } from "@/lib/format";
import { setPeriodEndAction } from "../actions";

/** Move the due date (free days, corrections), with a reason for the audit log. */
export function DueDateCard({ tenantId, tenantName, billing }: { tenantId: string; tenantName: string; billing: TenantBilling }) {
  const [date, setDate] = useState(billing.dueDate ?? "");
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const ready = /^\d{4}-\d{2}-\d{2}$/.test(date) && reason.trim().length >= 3 && date !== billing.dueDate;

  function save() {
    startTransition(async () => {
      const result = await setPeriodEndAction(tenantId, date, reason.trim());
      if (result.ok) {
        setErrors({});
        setReason("");
        toast.success(`Due date moved to ${formatDay(date)}`);
      } else {
        setErrors(result.fieldErrors ?? {});
        toast.error(result.error);
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Due date</CardTitle>
        <CardDescription>
          Give free days or correct a mistake. An overdue store becomes active again when the new date is in the future; a suspended
          store stays suspended until you activate it.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-4 sm:grid-cols-[auto_1fr_auto] sm:items-end"
          onSubmit={(e) => {
            e.preventDefault();
            if (ready) setConfirming(true);
          }}
        >
          <FormField id="periodEnd" label="New due date" error={errors.periodEnd}>
            <Input id="periodEnd" type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
          </FormField>
          <FormField id="periodReason" label="Reason (audit log)" error={errors.reason}>
            <Input id="periodReason" required minLength={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Two weeks free for the Eid sale" />
          </FormField>
          <Button type="submit" variant="outline" disabled={pending || !ready}>
            Move due date
          </Button>
        </form>
      </CardContent>

      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Move {tenantName}’s due date?</AlertDialogTitle>
            <AlertDialogDescription>
              {billing.dueDate ? `From ${formatDay(billing.dueDate)} to ` : "To "}
              {date && formatDay(date)}. Reminders and suspension count from the new date.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={save}>Move due date</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
