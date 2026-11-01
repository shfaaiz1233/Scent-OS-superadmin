"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction } from "./actions";

export function LoginForm({ expired, reset }: { expired: boolean; reset: boolean }) {
  const [state, formAction, pending] = useActionState(loginAction, null);
  const error = state && !state.ok ? state : null;

  return (
    <form action={formAction} className="grid gap-4">
      {expired && !error && (
        <p className="rounded-md border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
          Your session ended. Sign in again.
        </p>
      )}
      {reset && !error && (
        <p role="status" className="rounded-md border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
          Your password was changed. Sign in with the new one.
        </p>
      )}
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required autoFocus defaultValue={error?.values?.email} />
        {error?.fieldErrors?.email && <p className="text-sm text-destructive">{error.fieldErrors.email}</p>}
      </div>
      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link href="/forgot-password" className="text-xs text-muted-foreground underline underline-offset-4">
            Forgot password?
          </Link>
        </div>
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
