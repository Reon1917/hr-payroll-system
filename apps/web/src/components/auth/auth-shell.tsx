import Link from "next/link";
import type { ReactNode } from "react";

const operationalAreas = [
  {
    label: "Employee records",
    description: "Create and maintain employee details before payroll processing starts.",
  },
  {
    label: "Pay periods",
    description: "Open each payroll cycle, generate drafts, and review outstanding records.",
  },
  {
    label: "Review and approval",
    description: "Apply additions and deductions, calculate results, and confirm approval status.",
  },
  {
    label: "Employee access",
    description: "Employees sign in with their own email to view only their own payslips.",
  },
];

const workspaceDetails = [
  { label: "Scope", value: "Employees, periods, payroll, portal" },
  { label: "Time zone", value: "Asia/Bangkok" },
  { label: "Currency", value: "THB" },
  { label: "Access", value: "Email and password" },
];

const demoAccounts = [
  {
    label: "Admin workspace",
    email: "admin@company.test",
    password: "Admin123!",
    description: "Full HR access",
  },
  {
    label: "Employee portal",
    email: "employee@company.test",
    password: "Employee123!",
    description: "Self-service access",
  },
];

export function AuthShell({
  mode,
  title,
  description,
  children,
}: {
  mode: "login" | "signup";
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-[1200px] flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="group inline-flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-white text-sm font-semibold text-foreground">
              HR
            </span>
            <div>
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-foreground">
                Payroll System
              </p>
              <p className="text-sm text-muted">HR and employee payroll access</p>
            </div>
          </Link>

          <nav className="flex items-center gap-5 text-sm">
            <Link
              href="/login"
              className={`border-b-2 pb-2 transition ${
                mode === "login"
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted hover:text-foreground"
              }`}
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className={`border-b-2 pb-2 transition ${
                mode === "signup"
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted hover:text-foreground"
              }`}
            >
              Sign up
            </Link>
          </nav>
        </header>

        <div className="grid flex-1 gap-6 py-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:py-10">
          <section className="space-y-6">
            <div className="rounded-lg border border-border bg-white p-6 md:p-8">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-muted">
                Payroll workspace
              </p>
              <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-[-0.03em] text-foreground sm:text-5xl">
                Clear payroll access for HR teams and employees.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
                Use one workspace to maintain employee records, manage payroll
                periods, review results, and give staff a simple payslip portal.
              </p>
            </div>

            <div className="grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
              <section className="rounded-lg border border-border bg-white p-6">
                <h2 className="text-sm font-semibold text-foreground">Workspace setup</h2>
                <dl className="mt-4 divide-y divide-border text-sm">
                  {workspaceDetails.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                    >
                      <dt className="text-muted">{item.label}</dt>
                      <dd className="text-right font-medium text-foreground">
                        {item.value}
                      </dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-5 rounded-md border border-border bg-surface px-4 py-3 text-sm leading-6 text-muted">
                  Accounts connect automatically when the signup email matches an
                  employee record already created by HR.
                </div>
              </section>

              <section className="rounded-lg border border-border bg-white p-6">
                <h2 className="text-sm font-semibold text-foreground">Operational scope</h2>
                <div className="mt-4 space-y-4">
                  {operationalAreas.map((item, index) => (
                    <div
                      key={item.label}
                      className="grid gap-3 border-t border-border pt-4 first:border-t-0 first:pt-0 sm:grid-cols-[44px_1fr]"
                    >
                      <div className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface text-sm font-semibold text-foreground">
                        {String(index + 1).padStart(2, "0")}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {item.label}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-muted">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <section className="rounded-lg border border-border bg-white p-6">
              <div className="flex flex-col gap-1 border-b border-border pb-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">Demo access</h2>
                  <p className="text-sm text-muted">Seeded accounts for quick review.</p>
                </div>
                <p className="text-xs uppercase tracking-[0.16em] text-muted">
                  Test credentials
                </p>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {demoAccounts.map((account) => (
                  <div
                    key={account.label}
                    className="rounded-md border border-border bg-surface px-4 py-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {account.label}
                        </p>
                        <p className="mt-1 text-sm text-muted">
                          {account.description}
                        </p>
                      </div>
                    </div>

                    <dl className="mt-4 space-y-3 text-sm">
                      <div className="flex items-center justify-between gap-4">
                        <dt className="text-muted">Email</dt>
                        <dd className="font-medium text-foreground">
                          {account.email}
                        </dd>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <dt className="text-muted">Password</dt>
                        <dd className="font-medium text-foreground">
                          {account.password}
                        </dd>
                      </div>
                    </dl>
                  </div>
                ))}
              </div>
            </section>
          </section>

          <section className="self-start rounded-lg border border-border bg-white px-5 py-6 md:px-7 md:py-7">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-muted">
              {mode === "login" ? "Sign in" : "Create account"}
            </p>
            <h2 className="mt-4 text-3xl font-semibold text-foreground">{title}</h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-muted">
              {description}
            </p>
            <div className="mt-6 border-t border-border pt-6">{children}</div>
          </section>
        </div>
      </div>
    </div>
  );
}
