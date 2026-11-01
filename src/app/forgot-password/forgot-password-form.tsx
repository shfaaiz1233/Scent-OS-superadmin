"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPasswordAction } from "./actions";

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(forgotPasswordAction, null);
  const error = state && !state.ok ? state : null;

  if (state?.ok) {
    return (
      <div className="grid gap-4">
        <p role="status" className="rounded-md border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
          If that email belongs to a console account, a reset link is on its way. It works once and expires in an hour.
        </p>
        <Link href="/login" className="text-sm underline underline-offset-4">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required autoFocus defaultValue={error?.values?.email} />
        {error?.fieldErrors?.email && <p className="text-sm text-destructive">{error.fieldErrors.email}</p>}
      </div>
      {error && !error.fieldErrors && (
        <p role="alert" className="text-sm text-destructive">
          {error.error}
        </p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "Sending…" : "Send reset link"}
      </Button>
      <Link href="/login" className="text-center text-sm text-muted-foreground underline underline-offset-4">
        Back to sign in
      </Link>
    </form>
  );
}
