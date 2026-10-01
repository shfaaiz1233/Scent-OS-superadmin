import type { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { expired } = await searchParams;

  return (
    <main className="flex flex-1 items-center justify-center bg-muted/40 p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>
            <h1 className="text-xl">Scent-OS Superadmin</h1>
          </CardTitle>
          <CardDescription>Sign in to manage tenants and subscriptions.</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm expired={expired === "1"} />
        </CardContent>
      </Card>
    </main>
  );
}
