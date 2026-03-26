import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { requireAdmin } from "@/lib/session";

const navItems = [
  { section: "Overview", href: "/dashboard", label: "Dashboard", icon: "dashboard" as const },
  { section: "Payroll", href: "/employees", label: "Employees", icon: "employees" as const },
  { section: "Payroll", href: "/payroll", label: "Payroll runs", icon: "payroll" as const },
  { section: "Compliance", href: "/reports", label: "Tax & reports", icon: "reports" as const },
  { section: "Compliance", href: "/settings", label: "Settings", icon: "settings" as const },
];

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireAdmin();

  return (
    <AppShell user={user} navItems={navItems}>
      {children}
    </AppShell>
  );
}
