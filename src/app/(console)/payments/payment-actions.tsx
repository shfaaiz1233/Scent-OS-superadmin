"use client";

import { CheckIcon, FileImageIcon, XIcon } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { BillingPayment } from "@/lib/api/types";
import { formatDay, formatPrice, parseRupees, rupeesInput } from "@/lib/format";
import { confirmPaymentAction, receiptLinkAction, rejectPaymentAction } from "./actions";

/** View the receipt; confirm or reject a payment that waits to be checked. */
export function PaymentActions({ payment }: { payment: BillingPayment }) {
  const [pending, startTransition] = useTransition();
  const [amount, setAmount] = useState(rupeesInput(payment.amount));
  const [note, setNote] = useState("");
  const [reason, setReason] = useState("");
  const received = parseRupees(amount);
  const store = payment.tenant.name;
  const suspended = payment.tenant.status === "SUSPENDED";

  function openReceipt() {
    // Open the tab while this is still a click: browsers block windows opened after an await.
    const tab = window.open("", "_blank");
    startTransition(async () => {
      const result = await receiptLinkAction(payment.id);
      if (!result.ok) {
        tab?.close();
        toast.error(result.error);
        return;
      }
      if (tab) {
        tab.opener = null;
        tab.location.href = result.data.url;
      } else {
        window.location.assign(result.data.url);
      }
    });
  }

  function confirm() {
    startTransition(async () => {
      const result = await confirmPaymentAction(payment.id, {
        ...(received !== null && received !== payment.amount && { amount: received }),
        note: note.trim() || null,
      });
      if (result.ok) toast.success(`Confirmed: ${store} is paid until ${result.data.periodEnd ? formatDay(result.data.periodEnd) : "the next due date"}`);
      else toast.error(result.error);
    });
  }

  function reject() {
    startTransition(async () => {
      const result = await rejectPaymentAction(payment.id, reason.trim());
      if (result.ok) toast.success(`Rejected; ${store}'s owner has been told why`);
      else toast.error(result.error);
    });
  }

  return (
    <div className="flex justify-end gap-1">
      {payment.hasReceipt && (
        <Button variant="ghost" size="sm" onClick={openReceipt} disabled={pending}>
          <FileImageIcon /> Receipt
        </Button>
      )}
      {payment.status === "SUBMITTED" && (
        <>
          <AlertDialog onOpenChange={(open) => open && (setAmount(rupeesInput(payment.amount)), setNote(""))}>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" disabled={pending}>
                <CheckIcon /> Confirm
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm {formatPrice(payment.amount)} from {store}?</AlertDialogTitle>
                <AlertDialogDescription>
                  It pays for their next billing cycle
                  {suspended ? " and reopens the store immediately" : payment.tenant.status === "SETUP" ? " and opens the store" : ""}. The
                  owner is emailed. Only confirm money that has reached your account.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="grid gap-3">
                <div className="grid gap-2">
                  <Label htmlFor={`amount-${payment.id}`}>Amount received</Label>
                  <MoneyInput id={`amount-${payment.id}`} value={amount} onChange={(e) => setAmount(e.target.value)} />
                  {payment.expectedAmount !== null && payment.expectedAmount !== received && (
                    <p className="text-xs text-muted-foreground">Their price is {formatPrice(payment.expectedAmount)}.</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor={`note-${payment.id}`}>Note (optional)</Label>
                  <Textarea id={`note-${payment.id}`} rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Matched with the bank statement" />
                </div>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction disabled={received === null} onClick={confirm}>
                  Confirm payment
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog onOpenChange={(open) => open && setReason("")}>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" disabled={pending} aria-label={`Reject the payment from ${store}`}>
                <XIcon /> Reject
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reject {formatPrice(payment.amount)} from {store}?</AlertDialogTitle>
                <AlertDialogDescription>
                  The payment won’t count. The owner is emailed your reason and can send another.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="grid gap-2">
                <Label htmlFor={`reason-${payment.id}`}>Reason (emailed to the owner)</Label>
                <Textarea id={`reason-${payment.id}`} rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="We haven’t received this transfer." />
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  disabled={reason.trim().length < 3}
                  onClick={reject}
                  className="bg-destructive text-white hover:bg-destructive/90"
                >
                  Reject payment
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );
}
