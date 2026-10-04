import type { FeatureInfo, FeatureKey, Features } from "@/lib/api/types";

// Feature values as text, for server and client components alike.

/** "On", "Off", "Unlimited" or the limit. */
export function featureValueLabel(info: Pick<FeatureInfo, "type">, value: boolean | number | null | undefined): string {
  if (info.type === "boolean") return value ? "On" : "Off";
  return value === null || value === undefined ? "Unlimited" : String(value);
}

/** A one-line summary of a plan's notable features, e.g. "no decants · 3 staff accounts · 200 products". */
export function featuresSummary(catalogue: FeatureInfo[], features: Features): string {
  const parts: string[] = [];
  for (const info of catalogue) {
    const value = features[info.key as FeatureKey];
    if (info.type === "number" && value !== null) parts.push(`${value} ${info.label.toLowerCase()}`);
    if (info.type === "boolean" && value === false) parts.push(`no ${info.label.toLowerCase()}`);
  }
  return parts.length ? parts.join(" · ") : "Everything, no limits";
}
