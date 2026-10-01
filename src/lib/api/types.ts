import type { components } from "./schema";

// Types generated from the API's OpenAPI document (`pnpm api:types`). Never hand-write API types.
type Schemas = components["schemas"];

export type SuperAdmin = Schemas["SuperAdmin"];
export type SuperAdminSession = Schemas["SuperAdminSession"];
export type TenantSummary = Schemas["TenantSummary"];
export type TenantList = Schemas["TenantList"];
export type TenantDetail = Schemas["TenantDetail"];
export type TenantStatus = TenantDetail["status"];
export type OwnerInvite = Schemas["OwnerInvite"];
export type ThemePreset = Schemas["ThemePreset"];
export type Theme = Schemas["Theme"];
export type ThemeFont = Theme["fonts"]["heading"];
export type ErrorResponse = Schemas["ErrorResponse"];
