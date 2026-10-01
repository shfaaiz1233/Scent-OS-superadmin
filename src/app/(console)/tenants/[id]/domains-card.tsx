"use client";

import { Trash2Icon } from "lucide-react";
import { useActionState, useEffect, useRef, useTransition } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { TenantDetail } from "@/lib/api/types";
import { addDomainAction, removeDomainAction } from "../actions";

/** The hostnames the storefront is served from. The first is primary (used in links). */
export function DomainsCard({ tenantId, domains }: { tenantId: string; domains: TenantDetail["domains"] }) {
  const [state, formAction, adding] = useActionState(addDomainAction.bind(null, tenantId), null);
  const [removing, startRemove] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const failed = state && !state.ok ? state : null;

  useEffect(() => {
    if (state?.ok) {
      toast.success("Domain added");
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Domains</CardTitle>
        <CardDescription>Point each domain at the storefront deployment separately.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <ul className="divide-y rounded-md border">
          {domains.map((domain, index) => (
            <li key={domain.id} className="flex items-center gap-2 px-3 py-2 text-sm">
              <span className="font-mono">{domain.domain}</span>
              {index === 0 && <Badge variant="secondary">Primary</Badge>}
              {domains.length > 1 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="ml-auto" aria-label={`Remove ${domain.domain}`} disabled={removing}>
                      <Trash2Icon />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove {domain.domain}?</AlertDialogTitle>
                      <AlertDialogDescription>
                        The store stops being served on this hostname within a minute.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-white hover:bg-destructive/90"
                        onClick={() =>
                          startRemove(async () => {
                            const result = await removeDomainAction(tenantId, domain.id);
                            if (result.ok) toast.success("Domain removed");
                            else toast.error(result.error);
                          })
                        }
                      >
                        Remove
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </li>
          ))}
        </ul>
        <form ref={formRef} action={formAction} className="grid gap-2">
          <div className="flex gap-2">
            <Input
              name="domain"
              placeholder="www.acme.com"
              aria-label="New domain"
              className="font-mono"
              required
              defaultValue={failed?.values?.domain}
            />
            <Button type="submit" variant="outline" disabled={adding}>
              Add
            </Button>
          </div>
          {failed && <p className="text-sm text-destructive">{failed.fieldErrors?.domain ?? failed.error}</p>}
        </form>
      </CardContent>
    </Card>
  );
}
