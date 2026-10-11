"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { type ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart";
import type { AnalyticsWindow } from "@/lib/api/types";
import { formatCompactPrice, periodLabel } from "@/lib/analytics";
import { formatPrice } from "@/lib/format";

export type PeriodPoint = { period: string; amount: number; count: number };

/**
 * Money by day or month as bars, with the count (payments, orders) in the tooltip. Periods without
 * any come from the API as 0, so the axis is continuous.
 */
export function PeriodChart({
  points,
  granularity,
  amountLabel,
  countLabel,
}: {
  points: PeriodPoint[];
  granularity: AnalyticsWindow["granularity"];
  amountLabel: string;
  /** What `count` counts, singular: "payment", "order". */
  countLabel: string;
}) {
  const config = { amount: { label: amountLabel, color: "var(--chart-2)" } } satisfies ChartConfig;
  const data = points.map((point) => ({ ...point, label: periodLabel(point.period, granularity) }));
  return (
    <ChartContainer config={config} className="aspect-auto h-64 w-full">
      <BarChart data={data} margin={{ left: 4, right: 4, top: 8 }} accessibilityLayer>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} minTickGap={16} />
        <YAxis tickLine={false} axisLine={false} width={64} tickFormatter={(value: number) => formatCompactPrice(value)} />
        <ChartTooltip
          cursor={{ fill: "var(--muted)" }}
          content={({ active, payload }) => {
            const point = active ? (payload?.[0]?.payload as (PeriodPoint & { label: string }) | undefined) : undefined;
            if (!point) return null;
            return (
              <div className="grid gap-0.5 rounded-lg border bg-background px-3 py-2 text-xs shadow-md">
                <p className="font-medium">{point.label}</p>
                <p className="tabular-nums">{formatPrice(point.amount)}</p>
                <p className="text-muted-foreground tabular-nums">{point.count} {point.count === 1 ? countLabel : `${countLabel}s`}</p>
              </div>
            );
          }}
        />
        <Bar dataKey="amount" fill="var(--color-amount)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
