import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata: Metadata = { title: "Sign in" };

// Sign-in is wired to the API in Phase 1 (POST /api/superadmin/auth/login, httpOnly session cookie).
export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center bg-muted/40 p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Scent-OS Superadmin</CardTitle>
          <CardDescription>Sign in to manage tenants and subscriptions.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" disabled />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" autoComplete="current-password" disabled />
            </div>
            <Button type="submit" disabled>
              Sign in (Phase 1)
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
