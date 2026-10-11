"use client";

import { ShieldCheckIcon } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createAdminAccessLinkAction } from "../actions";

/**
 * Opens the store's /admin in a new tab, signed in as "Platform" with owner rights (to edit content
 * for the owner). The link works once, for 2 minutes; every use is in the audit log.
 */
export function OpenStoreAdminButton({ tenantId }: { tenantId: string }) {
  const [pending, startTransition] = useTransition();

  function open() {
    // Open the tab now, while this is still a click: browsers block windows opened after an await.
    const tab = window.open("", "_blank");
    startTransition(async () => {
      const result = await createAdminAccessLinkAction(tenantId);
      if (!result.ok) {
        tab?.close();
        toast.error(result.error);
        return;
      }
      if (tab) {
        tab.opener = null;
        tab.location.href = result.data.url;
      } else {
        window.location.assign(result.data.url);
      }
    });
  }

  return (
    <Button variant="outline" onClick={open} disabled={pending}>
      <ShieldCheckIcon /> {pending ? "Opening…" : "Open store admin"}
    </Button>
  );
}
