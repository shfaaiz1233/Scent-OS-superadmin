import { ApiError } from "@/lib/api/server";

export type ActionError = {
  ok: false;
  error: string;
  fieldErrors?: Record<string, string>;
  /** What was submitted, so the form can show it again (React resets forms after an action). */
  values?: Record<string, string>;
};

/** What a server action returns to its form: success (optional data) or an error to show. */
export type ActionResult<T = undefined> = { ok: true; data: T } | ActionError;

/** A form's submitted text fields (no passwords: never echo those back). */
export function formValues(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {};
  for (const [key, value] of formData) {
    if (typeof value === "string" && !key.toLowerCase().includes("password")) values[key] = value;
  }
  return values;
}

/**
 * Turn an API error into an action result: validation `details` become per-field errors (keyed by
 * the first path segment, e.g. `domains.0` → `domains`). Anything else is rethrown.
 */
export function toActionError(err: unknown, values?: Record<string, string>): ActionError {
  if (!(err instanceof ApiError)) throw err;

  const fieldErrors: Record<string, string> = {};
  for (const detail of err.details) {
    const field = detail.path.split(".")[0] || "form";
    fieldErrors[field] ??= detail.message;
  }
  return {
    ok: false,
    error: err.details.length ? "Please fix the highlighted fields." : err.message,
    fieldErrors: Object.keys(fieldErrors).length ? fieldErrors : undefined,
    values,
  };
}
