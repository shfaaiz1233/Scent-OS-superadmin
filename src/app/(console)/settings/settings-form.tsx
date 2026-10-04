"use client";

import { PlusIcon, Trash2Icon } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { FormField } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { PlatformSettings } from "@/lib/api/types";
import { saveSettingsAction } from "./actions";

type Account = PlatformSettings["bankAccounts"][number];
const EMPTY_ACCOUNT: Account = { bankName: "", accountTitle: "", accountNumber: "", iban: null };
const MAX_ACCOUNTS = 5;

/** Billing settings: who gets the digest, where owners pay, and the reminder and grace days. */
export function SettingsForm({ settings }: { settings: PlatformSettings }) {
  const [email, setEmail] = useState(settings.notificationEmail ?? "");
  const [whatsapp, setWhatsapp] = useState(settings.whatsappNumber ?? "");
  const [accounts, setAccounts] = useState<Account[]>(settings.bankAccounts);
  const [reminder, setReminder] = useState(String(settings.reminderDaysBefore));
  const [grace, setGrace] = useState(String(settings.graceDays));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();

  const setAccount = (index: number, patch: Partial<Account>) => setAccounts(accounts.map((a, i) => (i === index ? { ...a, ...patch } : a)));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await saveSettingsAction({
        notificationEmail: email.trim() || null,
        whatsappNumber: whatsapp.trim() || null,
        bankAccounts: accounts.map((a) => ({ ...a, iban: a.iban?.trim() || null })),
        reminderDaysBefore: Number(reminder),
        graceDays: Number(grace),
      });
      if (result.ok) {
        setErrors({});
        setAccounts(result.data.bankAccounts);
        toast.success("Settings saved");
      } else {
        setErrors(result.fieldErrors ?? {});
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-2">
      <Card className="content-start">
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>The daily digest (payments to check, overdue and suspended stores) and payment notices go here.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <FormField id="notificationEmail" label="Notification email" hint="Leave empty to get no billing emails" error={errors.notificationEmail}>
            <Input id="notificationEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="billing@thescentsystem.store" />
          </FormField>
          {!settings.emailEnabled && (
            <p className="rounded-md bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
              This server doesn’t send email yet (no Resend key): billing emails are only written to the API’s log.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="content-start">
        <CardHeader>
          <CardTitle>Reminders and grace</CardTitle>
          <CardDescription>Owners get a reminder before the due date. After the grace days, an unpaid store is suspended.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FormField id="reminderDaysBefore" label="Reminder, days before" error={errors.reminderDaysBefore}>
            <Input id="reminderDaysBefore" type="number" min={1} max={30} required value={reminder} onChange={(e) => setReminder(e.target.value)} className="tabular-nums" />
          </FormField>
          <FormField id="graceDays" label="Grace days after the due date" error={errors.graceDays}>
            <Input id="graceDays" type="number" min={0} max={30} required value={grace} onChange={(e) => setGrace(e.target.value)} className="tabular-nums" />
          </FormField>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>How owners pay you</CardTitle>
          <CardDescription>Shown on every store’s Billing page and in billing emails.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="max-w-sm">
            <FormField id="whatsappNumber" label="WhatsApp number for payment screenshots" hint="With the country code, e.g. +92 300 1234567" error={errors.whatsappNumber}>
              <Input id="whatsappNumber" type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
            </FormField>
          </div>
          {accounts.length > 0 && (
            <ul className="grid gap-3">
              {accounts.map((account, i) => (
                <li key={i} className="grid gap-3 rounded-md border p-3 sm:grid-cols-[1fr_1fr_1fr_1fr_auto] sm:items-end">
                  <FormField id={`bank-${i}`} label="Bank">
                    <Input id={`bank-${i}`} required value={account.bankName} onChange={(e) => setAccount(i, { bankName: e.target.value })} placeholder="Meezan Bank" />
                  </FormField>
                  <FormField id={`title-${i}`} label="Account title">
                    <Input id={`title-${i}`} required value={account.accountTitle} onChange={(e) => setAccount(i, { accountTitle: e.target.value })} placeholder="The Scent System" />
                  </FormField>
                  <FormField id={`number-${i}`} label="Account number">
                    <Input id={`number-${i}`} required value={account.accountNumber} onChange={(e) => setAccount(i, { accountNumber: e.target.value })} className="font-mono" />
                  </FormField>
                  <FormField id={`iban-${i}`} label="IBAN (optional)">
                    <Input id={`iban-${i}`} value={account.iban ?? ""} onChange={(e) => setAccount(i, { iban: e.target.value })} className="font-mono" />
                  </FormField>
                  <Button type="button" variant="ghost" size="icon" aria-label={`Remove ${account.bankName || "this account"}`} onClick={() => setAccounts(accounts.filter((_, j) => j !== i))}>
                    <Trash2Icon />
                  </Button>
                </li>
              ))}
            </ul>
          )}
          {errors.bankAccounts && <p className="text-sm text-destructive">{errors.bankAccounts}</p>}
          <div>
            <Button type="button" variant="outline" disabled={accounts.length >= MAX_ACCOUNTS} onClick={() => setAccounts([...accounts, EMPTY_ACCOUNT])}>
              <PlusIcon /> Add a bank account
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end lg:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save settings"}
        </Button>
      </div>
    </form>
  );
}
