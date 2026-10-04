"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { FeatureInfo, FeatureKey, FeatureOverrides, Features } from "@/lib/api/types";
import { featureValueLabel } from "@/lib/features";

type Value = boolean | number | null;

function ValueControl({ info, value, onChange, disabled }: { info: FeatureInfo; value: Value; onChange: (value: Value) => void; disabled?: boolean }) {
  const id = `feature-${info.key}`;
  if (info.type === "boolean") {
    return <Switch id={id} checked={value === true} onCheckedChange={onChange} disabled={disabled} aria-label={info.label} />;
  }
  const unlimited = value === null;
  return (
    <div className="flex items-center gap-3">
      <Input
        id={id}
        type="number"
        min={0}
        step={1}
        value={unlimited ? "" : String(value)}
        placeholder="—"
        disabled={disabled || unlimited}
        onChange={(e) => onChange(e.target.value === "" ? 0 : Math.max(0, Math.floor(Number(e.target.value))))}
        className="w-24 tabular-nums"
        aria-label={`${info.label} limit`}
      />
      <Label className="flex items-center gap-2 text-sm font-normal text-muted-foreground">
        <Switch size="sm" checked={unlimited} onCheckedChange={(on) => onChange(on ? null : 0)} disabled={disabled} />
        Unlimited
      </Label>
    </div>
  );
}

/** A plan's features: every feature with its value. */
export function PlanFeaturesEditor({ catalogue, value, onChange }: { catalogue: FeatureInfo[]; value: Features; onChange: (value: Features) => void }) {
  return (
    <ul className="divide-y rounded-md border">
      {catalogue.map((info) => (
        <li key={info.key} className="flex flex-wrap items-center justify-between gap-3 px-3 py-3">
          <div className="min-w-0 max-w-md">
            <p className="text-sm font-medium">{info.label}</p>
            <p className="text-xs text-muted-foreground">{info.description}</p>
          </div>
          <ValueControl info={info} value={value[info.key as FeatureKey]} onChange={(v) => onChange({ ...value, [info.key]: v })} />
        </li>
      ))}
    </ul>
  );
}

/** A store's overrides on top of its plan: per feature, the plan's value, or a value of its own. */
export function FeatureOverridesEditor({
  catalogue,
  base,
  value,
  onChange,
}: {
  catalogue: FeatureInfo[];
  /** The plan's features (every feature on, unlimited, for stores without a subscription). */
  base: Features;
  value: FeatureOverrides;
  onChange: (value: FeatureOverrides) => void;
}) {
  return (
    <ul className="divide-y rounded-md border">
      {catalogue.map((info) => {
        const key = info.key as FeatureKey;
        const overridden = key in value;
        const setOverride = (on: boolean) => {
          const next = { ...value };
          if (on) Object.assign(next, { [key]: base[key] });
          else delete next[key];
          onChange(next);
        };
        return (
          <li key={key} className="grid gap-3 px-3 py-3 sm:grid-cols-[1fr_auto] sm:items-center">
            <div className="min-w-0">
              <p className="text-sm font-medium">{info.label}</p>
              <p className="text-xs text-muted-foreground">
                Plan: {featureValueLabel(info, base[key])}
                {overridden && <> · This store: {featureValueLabel(info, value[key])}</>}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Label className="flex items-center gap-2 text-sm font-normal">
                <Switch size="sm" checked={overridden} onCheckedChange={setOverride} aria-label={`Override ${info.label}`} />
                Override
              </Label>
              {overridden && (
                <ValueControl info={info} value={value[key] ?? null} onChange={(v) => onChange({ ...value, [key]: v })} />
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
