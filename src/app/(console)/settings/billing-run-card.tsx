"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { BillingRun } from "@/lib/api/types";
import { formatDay } from "@/lib/format";
import { runBillingAction } from "./actions";

const RESULTS: { key: keyof BillingRun; label: string }[] = [
  { key: "stores", label: "Stores checked" },
  { key: "reminders", label: "Reminders sent" },
  { key: "markedPastDue", label: "Became past due" },
  { key: "overdueNotices", label: "Due / overdue emails" },
  { key: "suspended", label: "Suspended" },
  { key: "renewedFree", label: "Free plans renewed" },
  { key: "emailsFailed", label: "Emails that failed" },
];

/** The daily billing job: when it runs, and a button to run it now (staging has no cron). */
export function BillingRunCard({ schedule }: { schedule: string }) {
  const [run, setRun] = useState<BillingRun | null>(null);
  const [pending, startTransition] = useTransition();

  function start() {
    startTransition(async () => {
      const result = await runBillingAction();
      if (result.ok) {
        setRun(result.data);
        toast.success("Billing run finished");
      } else toast.error(result.error);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily billing run</CardTitle>
        <CardDescription>
          {schedule}, on production. It sends reminders, marks unpaid stores past due, suspends them after the grace days and
          emails you the digest. Running it again the same day does nothing twice.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {run && (
          <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-4">
            <div className="col-span-2 sm:col-span-4 text-muted-foreground">Run for {formatDay(run.date)}:</div>
            {RESULTS.map(({ key, label }) => (
              <div key={key} className="flex justify-between gap-2">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="tabular-nums">{String(run[key])}</dd>
              </div>
            ))}
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">Digest sent</dt>
              <dd>{run.digestSent ? "Yes" : "No"}</dd>
            </div>
          </dl>
        )}
        <div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" disabled={pending}>
                {pending ? "Running…" : "Run billing now"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Run billing now?</AlertDialogTitle>
                <AlertDialogDescription>
                  Due reminders and overdue emails go out to owners, stores past their due date become past due, and stores past the
                  grace days are suspended immediately. Emails already sent today aren’t sent again.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={start}>Run billing</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
