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
export type AdminAccessLink = Schemas["AdminAccessLink"];
export type ThemePreset = Schemas["ThemePreset"];
export type Theme = Schemas["Theme"];
export type ThemeFont = Theme["fonts"]["heading"];
export type ErrorResponse = Schemas["ErrorResponse"];

// Billing (Phase 5)
export type Plan = Schemas["Plan"];
export type FeatureInfo = Schemas["FeatureInfo"];
export type Features = Schemas["Features"];
export type FeatureKey = keyof Features;
export type FeatureOverrides = Schemas["FeatureOverrides"];
export type Subscription = Schemas["Subscription"];
export type TenantBilling = Schemas["TenantBilling"];
export type BillingState = TenantBilling["state"];
export type BillingCycle = Subscription["billingCycle"];
export type PricingMode = Subscription["pricingMode"];
export type BillingPayment = Schemas["BillingPayment"];
export type BillingPaymentList = Schemas["BillingPaymentList"];
export type PaymentStatus = BillingPayment["status"];
export type PaymentMethod = BillingPayment["method"];
export type ReceiptLink = Schemas["ReceiptLink"];
export type PlatformSettings = Schemas["PlatformSettings"];
export type BillingRun = Schemas["BillingRun"];

// Analytics and ledgers (Phase 6)
export type AnalyticsRange = Schemas["AnalyticsRange"];
export type AnalyticsWindow = Schemas["AnalyticsWindow"];
export type PlatformOverview = Schemas["PlatformOverview"];
export type EarningsLedger = Schemas["EarningsLedger"];
export type SalesLedger = Schemas["SalesLedger"];
export type TenantSales = Schemas["TenantSales"];

// Audit log (Phase 7)
export type AuditLogEntry = Schemas["AuditLogEntry"];
export type AuditLogList = Schemas["AuditLogList"];
