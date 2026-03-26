import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { requireEmployee } from "@/lib/session";

const navItems = [
  { section: "Overview", href: "/portal", label: "Portal", icon: "dashboard" as const },
  { section: "Profile", href: "/account", label: "Account", icon: "settings" as const },
];

export default async function EmployeeLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireEmployee();

  return (
    <AppShell user={user} navItems={navItems}>
      {children}
    </AppShell>
  );
}
