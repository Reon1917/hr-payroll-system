import type { CurrentUser } from "@hr-payroll/shared";
import type { ReactNode } from "react";
import { LogoutButton } from "../auth/logout-button";
import { SidebarNav, type NavItem } from "./sidebar-nav";

export function AppShell({
  user,
  navItems,
  children,
}: {
  user: CurrentUser;
  navItems: NavItem[];
  children: ReactNode;
}) {
  const fiscalYear = new Date().getFullYear() + 543;

  return (
    <div className="min-h-screen bg-[#eef2f7]">
      <div className="mx-auto flex min-h-screen max-w-[1560px] lg:px-5 lg:py-5">
        <div className="flex w-full overflow-hidden border border-[#dbe4ee] bg-[#f5f7fb] lg:rounded-xl">
          <aside className="print-hidden hidden w-[280px] shrink-0 border-r border-[#dbe4ee] bg-[#f8fafc] lg:flex lg:flex-col">
            <div className="border-b border-[#dbe4ee] px-6 py-6">
              <div className="rounded-xl border border-[#dbe4ee] bg-white p-5">
                <div className="mb-4 h-1.5 w-14 rounded-full bg-[#3b82f6]" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#2563eb]">
                  ThaiPay
                </p>
                <h1 className="mt-3 text-[28px] font-semibold leading-none text-[#0f172a]">
                  Payroll system
                </h1>
                <p className="mt-2 text-sm leading-6 text-[#64748b]">
                  Thailand payroll bookkeeping system
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-6">
              <SidebarNav items={navItems} />
            </div>

            <div className="border-t border-[#dbe4ee] px-6 py-5">
              <div className="rounded-xl border border-[#dbe4ee] bg-white px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#64748b]">
                  Fiscal view
                </p>
                <p className="mt-2 text-sm font-medium text-[#0f172a]">
                  FY {fiscalYear} ({fiscalYear - 543})
                </p>
              </div>
            </div>
          </aside>

          <div className="flex min-h-screen flex-1 flex-col bg-[#f5f7fb]">
            <header className="print-hidden border-b border-[#dbe4ee] bg-white px-5 py-4 lg:px-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#64748b]">
                    {user.role === "admin" ? "Admin workspace" : "Employee portal"}
                  </p>
                  <p className="mt-1 text-lg font-semibold text-[#0f172a]">
                    {user.name}
                  </p>
                  <p className="text-sm text-[#64748b]">{user.email}</p>
                </div>
                <LogoutButton />
              </div>
            </header>

            <main className="flex-1 bg-[#f5f7fb] px-5 py-6 lg:px-8">{children}</main>
          </div>
        </div>
      </div>
    </div>
  );
}
