"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPasswordAction } from "./actions";

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(resetPasswordAction, null);
  const error = state && !state.ok ? state : null;

  return (
    <form action={formAction} className="grid gap-4">
      <input type="hidden" name="token" value={token} />
      <div className="grid gap-2">
        <Label htmlFor="password">New password</Label>
        <Input id="password" name="password" type="password" autoComplete="new-password" minLength={10} required autoFocus />
        <p className="text-xs text-muted-foreground">At least 10 characters.</p>
        {error?.fieldErrors?.password && <p className="text-sm text-destructive">{error.fieldErrors.password}</p>}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="confirm">Confirm password</Label>
        <Input id="confirm" name="confirm" type="password" autoComplete="new-password" required />
        {error?.fieldErrors?.confirm && <p className="text-sm text-destructive">{error.fieldErrors.confirm}</p>}
      </div>
      {error && !error.fieldErrors && (
        <p role="alert" className="text-sm text-destructive">
          {error.error}
        </p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Set new password"}
      </Button>
    </form>
  );
}
