import "server-only";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import type { ErrorResponse } from "./types";

/** httpOnly cookie holding the superadmin's session token (set by the login action). */
export const SESSION_COOKIE = "sa_session";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details: NonNullable<ErrorResponse["error"]["details"]> = [],
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  /** Send the session cookie as a bearer token (default). On 401 the user is sent to /login. */
  auth?: boolean;
};

function apiUrl(): string {
  const url = process.env.API_URL;
  if (!url) throw new Error("API_URL is not set (see .env.example)");
  return url.replace(/\/$/, "");
}

// Forward the browser's IP so the API's sign-in rate limit counts per user, not per server.
async function clientIpHeaders(): Promise<Record<string, string>> {
  const secret = process.env.API_BFF_SECRET;
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip");
  return secret && ip ? { "x-client-ip": ip, "x-bff-secret": secret } : {};
}

/**
 * Call The Scent System API from the server and unwrap its `{ data }` envelope. Server-only: the
 * browser never calls the API. Throws `ApiError` for error responses (except 401 with `auth`,
 * which redirects to /login).
 */
export async function api<T>(path: string, { method = "GET", body, auth = true }: RequestOptions = {}): Promise<T> {
  const requestHeaders: Record<string, string> = { accept: "application/json", ...(await clientIpHeaders()) };
  if (body !== undefined) requestHeaders["content-type"] = "application/json";

  if (auth) {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (!token) redirect("/login");
    requestHeaders.authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${apiUrl()}${path}`, {
    method,
    headers: requestHeaders,
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });

  if (res.status === 401 && auth) redirect("/login?expired=1");

  const json = (await res.json().catch(() => null)) as { data?: T } & Partial<ErrorResponse> | null;
  if (!res.ok) {
    throw new ApiError(res.status, json?.error?.message ?? `The API responded ${res.status}`, json?.error?.details);
  }
  return json?.data as T;
}
