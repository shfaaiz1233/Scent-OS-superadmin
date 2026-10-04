"use client";

import type { ComponentProps } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/** A rupee amount: "Rs" in front, typed in rupees (parse with parseRupees before sending). */
export function MoneyInput({ className, ...props }: Omit<ComponentProps<typeof Input>, "type">) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">Rs</span>
      <Input inputMode="decimal" autoComplete="off" className={cn("pl-9 tabular-nums", className)} {...props} />
    </div>
  );
}
