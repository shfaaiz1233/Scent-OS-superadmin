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
import { addDomainAction, removeDomainAction, setPrimaryDomainAction } from "../actions";

/** The hostnames the storefront is served from. The primary one is used in links; any can be made primary. */
export function DomainsCard({ tenantId, domains }: { tenantId: string; domains: TenantDetail["domains"] }) {
  const [state, formAction, adding] = useActionState(addDomainAction.bind(null, tenantId), null);
  const [removing, startRemove] = useTransition();
  const [promoting, startPromote] = useTransition();
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
        <CardDescription>
          Point each domain at the storefront deployment. Links (storefront, set-password) use the primary domain.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <ul className="divide-y rounded-md border">
          {domains.map((domain) => (
            <li key={domain.id} className="flex items-center gap-2 px-3 py-2 text-sm">
              <span className="min-w-0 truncate font-mono">{domain.domain}</span>
              {domain.isPrimary && <Badge variant="secondary">Primary</Badge>}
              {!domain.isPrimary && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto"
                  disabled={promoting}
                  onClick={() =>
                    startPromote(async () => {
                      const result = await setPrimaryDomainAction(tenantId, domain.id);
                      if (result.ok) toast.success(`${domain.domain} is now the primary domain`);
                      else toast.error(result.error);
                    })
                  }
                >
                  Make primary
                </Button>
              )}
              {domains.length > 1 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={domain.isPrimary ? "ml-auto" : undefined}
                      aria-label={`Remove ${domain.domain}`}
                      disabled={removing}
                    >
                      <Trash2Icon />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove {domain.domain}?</AlertDialogTitle>
                      <AlertDialogDescription>
                        The store stops being served on this hostname within a minute.
                        {domain.isPrimary && " The oldest remaining domain becomes the primary domain."}
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
