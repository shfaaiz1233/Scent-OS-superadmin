import {
  BookOpenTextIcon,
  CreditCardIcon,
  LayoutDashboardIcon,
  type LucideIcon,
  PackageIcon,
  SettingsIcon,
  StoreIcon,
} from "lucide-react";

export type NavItem = { title: string; href: string; icon: LucideIcon; description: string };

/** Sidebar navigation. Each section is planned in docs/system-design.md §9 (API repo). */
export const NAV_ITEMS: NavItem[] = [
  { title: "Overview", href: "/", icon: LayoutDashboardIcon, description: "MRR, tenants by status, payments to verify, renewals" },
  { title: "Tenants", href: "/tenants", icon: StoreIcon, description: "Create and manage stores, owners, domains, themes, flags" },
  { title: "Plans", href: "/plans", icon: PackageIcon, description: "Subscription plans, prices and feature flags" },
  { title: "Payments", href: "/payments", icon: CreditCardIcon, description: "Receipts to verify, confirmed payments" },
  { title: "Ledger", href: "/ledger", icon: BookOpenTextIcon, description: "Your earnings and tenants' completed sales" },
  { title: "Settings", href: "/settings", icon: SettingsIcon, description: "Notification email, bank details, reminders" },
];
