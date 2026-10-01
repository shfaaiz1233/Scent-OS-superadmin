"use client";

import { Loader2Icon, TriangleAlertIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { retryProvisioningAction } from "../actions";

const POLL_MS = 2000;

/** While a tenant is PROVISIONING: refresh until it's done, or show the error with a retry. */
export function ProvisioningPanel({ tenantId, error }: { tenantId: string; error: string | null }) {
  const router = useRouter();
  const [retrying, startRetry] = useTransition();

  useEffect(() => {
    if (error) return;
    const timer = setInterval(() => router.refresh(), POLL_MS);
    return () => clearInterval(timer);
  }, [error, router]);

  if (!error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2Icon className="size-4 animate-spin" /> Provisioning
          </CardTitle>
          <CardDescription>
            Creating and migrating the store&apos;s database schema and its owner account. This usually takes a few seconds.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <TriangleAlertIcon className="size-4" /> Provisioning failed
        </CardTitle>
        <CardDescription>Fix the cause (often the database connection), then retry. Retrying is safe.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <pre className="max-h-64 overflow-auto rounded-md bg-muted p-3 font-mono text-xs whitespace-pre-wrap">{error}</pre>
        <div>
          <Button
            disabled={retrying}
            onClick={() =>
              startRetry(async () => {
                const result = await retryProvisioningAction(tenantId);
                if (!result.ok) toast.error(result.error);
              })
            }
          >
            {retrying ? "Retrying…" : "Retry provisioning"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
