"use client";

import { CopyIcon } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { OwnerInvite, TenantDetail } from "@/lib/api/types";
import { formatDateTime } from "@/lib/format";
import { createOwnerInviteAction } from "../actions";

const ACCOUNT_LABEL: Record<NonNullable<TenantDetail["ownerAccount"]>, string> = {
  NONE: "No account yet",
  INVITED: "Invited: hasn't set a password",
  ACTIVE: "Active",
};

/** The owner's /admin sign-in: status, and a one-time set-password link to send them. */
export function OwnerAccessCard({
  tenantId,
  ownerAccount,
  ownerEmail,
}: {
  tenantId: string;
  ownerAccount: TenantDetail["ownerAccount"];
  ownerEmail: string | null;
}) {
  const [invite, setInvite] = useState<OwnerInvite | null>(null);
  const [pending, startTransition] = useTransition();

  function createLink() {
    startTransition(async () => {
      const result = await createOwnerInviteAction(tenantId);
      if (result.ok) {
        setInvite(result.data);
        if (result.data.emailedTo) toast.success(`Link emailed to ${result.data.emailedTo}`);
      } else toast.error(result.error);
    });
  }

  async function copy() {
    if (!invite) return;
    await navigator.clipboard.writeText(invite.url);
    toast.success("Link copied");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Owner access</CardTitle>
        <CardDescription>
          {ownerEmail ? <>Signs in to the store&apos;s /admin as {ownerEmail}.</> : "Add the owner's email first."}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {ownerAccount && (
          <div className="flex items-center gap-2 text-sm">
            <Badge variant={ownerAccount === "ACTIVE" ? "default" : "secondary"}>{ACCOUNT_LABEL[ownerAccount]}</Badge>
          </div>
        )}

        {invite ? (
          <div className="grid gap-2">
            <div className="flex gap-2">
              <Input readOnly value={invite.url} aria-label="Set-password link" className="font-mono text-xs" onFocus={(e) => e.currentTarget.select()} />
              <Button variant="outline" size="icon" onClick={copy} aria-label="Copy link">
                <CopyIcon />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {invite.emailedTo ? (
                <>Emailed to {invite.emailedTo}. You can also send it yourself (e.g. on WhatsApp).</>
              ) : (
                <>Not emailed (email isn’t set up, or it failed): send it to the owner yourself, e.g. on WhatsApp.</>
              )}{" "}
              Works once, until {formatDateTime(invite.expiresAt)}. Creating a new link cancels this one.
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {ownerAccount === "ACTIVE"
              ? "If the owner forgot their password, create a link to let them set a new one."
              : "Create a link for the owner to set their password and sign in."}
          </p>
        )}

        <div>
          <Button variant="outline" onClick={createLink} disabled={pending || !ownerEmail}>
            {pending ? "Creating…" : invite ? "Create a new link" : "Create set-password link"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
