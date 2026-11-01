import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = { title: "Reset password" };

export default async function ResetPasswordPage({ searchParams }: PageProps<"/reset-password">) {
  const { token } = await searchParams;
  const value = typeof token === "string" ? token : "";

  return (
    <main className="flex flex-1 items-center justify-center bg-muted/40 p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>
            <h1 className="text-xl">Choose a new password</h1>
          </CardTitle>
          <CardDescription>You’ll be signed out everywhere and asked to sign in again.</CardDescription>
        </CardHeader>
        <CardContent>
          {value ? (
            <ResetPasswordForm token={value} />
          ) : (
            <p className="text-sm text-muted-foreground">
              This link is incomplete.{" "}
              <Link href="/forgot-password" className="underline underline-offset-4">
                Request a new one
              </Link>
              .
            </p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
