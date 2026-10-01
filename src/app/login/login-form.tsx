"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction } from "./actions";

export function LoginForm({ expired }: { expired: boolean }) {
  const [state, formAction, pending] = useActionState(loginAction, null);
  const error = state && !state.ok ? state : null;

  return (
    <form action={formAction} className="grid gap-4">
      {expired && !error && (
        <p className="rounded-md border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
          Your session ended. Sign in again.
        </p>
      )}
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required autoFocus defaultValue={error?.values?.email} />
        {error?.fieldErrors?.email && <p className="text-sm text-destructive">{error.fieldErrors.email}</p>}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      {error && !error.fieldErrors && (
        <p role="alert" className="text-sm text-destructive">
          {error.error}
        </p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
