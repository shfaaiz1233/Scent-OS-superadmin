import "server-only";
import { cache } from "react";
import { api } from "@/lib/api/server";
import type { SuperAdmin } from "@/lib/api/types";

/** The signed-in superadmin (redirects to /login if not signed in). Deduplicated per request. */
export const getCurrentSuperAdmin = cache(() => api<SuperAdmin>("/api/superadmin/auth/me"));
