"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { PaymentMethod, TenantBilling, TenantStatus } from "@/lib/api/types";
import { formatDay, formatPrice, parseRupees, rupeesInput } from "@/lib/format";
import { recordPaymentAction } from "../actions";

const METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "BANK_TRANSFER", label: "Bank transfer" },
  { value: "CASH", label: "Cash" },
  { value: "OTHER", label: "Other" },
];

/** A payment received another way (a receipt on WhatsApp, cash): recorded and confirmed at once. */
export function RecordPaymentCard({
  tenantId,
  tenantName,
  status,
  billing,
}: {
  tenantId: string;
  tenantName: string;
  status: TenantStatus;
  billing: TenantBilling;
}) {
  const price = billing.subscription?.price ?? 0;
  const [amount, setAmount] = useState(rupeesInput(price));
  const [method, setMethod] = useState<PaymentMethod>("BANK_TRANSFER");
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const received = parseRupees(amount);

  function save() {
    if (received === null) return;
    startTransition(async () => {
      const result = await recordPaymentAction(tenantId, { amount: received, method, reference: reference.trim() || null, note: note.trim() || null });
      if (result.ok) {
        setErrors({});
        setReference("");
        setNote("");
        toast.success(`Recorded: ${tenantName} is paid until ${result.data.periodEnd ? formatDay(result.data.periodEnd) : "the next due date"}`);
      } else {
        setErrors(result.fieldErrors ?? {});
        toast.error(result.error);
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Record a payment</CardTitle>
        <CardDescription>For money received outside the store’s Billing page, e.g. a receipt sent on WhatsApp. It’s confirmed straight away.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (received !== null) setConfirming(true);
          }}
        >
          <FormField id="recordAmount" label="Amount received" error={errors.amount ?? (amount && received === null ? "Enter rupees, e.g. 4999" : undefined)}>
            <MoneyInput id="recordAmount" required value={amount} onChange={(e) => setAmount(e.target.value)} />
          </FormField>
          <FormField id="recordMethod" label="Method" error={errors.method}>
            <Select value={method} onValueChange={(value) => setMethod(value as PaymentMethod)}>
              <SelectTrigger id="recordMethod" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {METHODS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField id="recordReference" label="Reference (optional)" error={errors.reference}>
            <Input id="recordReference" value={reference} onChange={(e) => setReference(e.target.value)} className="font-mono" maxLength={100} />
          </FormField>
          <FormField id="recordNote" label="Note (optional)" error={errors.note}>
            <Input id="recordNote" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Receipt on WhatsApp" maxLength={300} />
          </FormField>
          <div className="flex justify-end sm:col-span-2">
            <Button type="submit" variant="outline" disabled={pending || received === null}>
              {pending ? "Recording…" : "Record payment"}
            </Button>
          </div>
        </form>
      </CardContent>

      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Record {received !== null ? formatPrice(received) : ""} from {tenantName}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              It’s confirmed at once and pays for their next billing cycle
              {status === "SUSPENDED" ? "; the store reopens immediately" : status === "SETUP" ? "; the store opens" : ""}. The owner is
              emailed. Only record money that has reached your account.
              {price > 0 && received !== null && received !== price && ` Their price is ${formatPrice(price)}.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={save}>Record payment</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
