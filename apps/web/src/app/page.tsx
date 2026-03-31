import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, getDefaultRouteForUser } from "@/lib/session";

const summaryItems = [
  {
    label: "Payroll scope",
    value: "Employee setup, pay periods, payroll review, and payslip access",
  },
  {
    label: "Access model",
    value:
      "Shared portfolio demo. Public signup opens an employee portal account, while seeded demo users cover the full admin walkthrough.",
  },
  {
    label: "Authentication",
    value: "Email and password are active for seeded demo users and public signups.",
  },
];

const workflow = [
  {
    title: "Create or update employees",
    description: "Keep employee records complete before payroll work begins.",
  },
  {
    title: "Open the pay period",
    description: "Generate records for active employees and track current status.",
  },
  {
    title: "Review and calculate",
    description: "Apply additions, deductions, and other payroll adjustments.",
  },
  {
    title: "Approve and publish",
    description: "Confirm final payroll and let employees view their own payslips.",
  },
];

const roleCards = [
  {
    title: "Admin workspace",
    description: "Employee setup, period management, payroll review, approval, and paid tracking.",
  },
  {
    title: "Employee portal",
    description: "Self-service access to personal payroll information and payslip history.",
  },
];

const demoAccounts = [
  {
    label: "Admin",
    email: "admin@company.test",
    password: "Admin123!",
  },
  {
    label: "Employee",
    email: "employee@company.test",
    password: "Employee123!",
  },
];

export default async function HomePage() {
  const user = await getCurrentUser();

  if (user) {
    redirect(getDefaultRouteForUser(user));
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-white text-sm font-semibold">
              HR
            </span>
            <div>
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-foreground">
                Payroll System
              </p>
              <p className="text-sm text-muted">Shared portfolio demo</p>
            </div>
          </div>

          <div className="flex items-center gap-5 text-sm">
            <Link
              href="/login"
              className="font-medium text-muted transition hover:text-foreground"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="font-medium text-foreground"
            >
              Sign up
            </Link>
          </div>
        </header>

        <section className="grid gap-6 py-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:py-10">
          <div className="rounded-lg border border-border bg-white p-6 md:p-8">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-muted">
              Payroll operations
            </p>
            <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-[-0.03em] text-foreground sm:text-5xl">
              One workspace for employee setup, payroll control, and staff payslip access.
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-muted">
              This system is structured around the real payroll cycle: employee
              records, pay periods, calculation review, approval, payment status,
              and a focused employee portal.
            </p>
            <div className="mt-6 max-w-3xl rounded-md border border-[#d8e4ff] bg-[#f6f9ff] px-4 py-3 text-sm leading-6 text-muted">
              This is a shared resume demo. You can create your own employee
              portal account to explore the self-service flow, or use the seeded
              demo accounts below to review populated admin and employee data.
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-md bg-foreground px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-900"
              >
                Create demo account
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-md border border-border bg-white px-5 py-3 text-sm font-medium text-foreground transition hover:bg-surface"
              >
                Sign in
              </Link>
            </div>
          </div>

          <aside className="rounded-lg border border-border bg-white p-6">
            <h2 className="text-sm font-semibold text-foreground">Current setup</h2>
            <dl className="mt-4 divide-y divide-border text-sm">
              {summaryItems.map((item) => (
                <div
                  key={item.label}
                  className="py-3 first:pt-0 last:pb-0"
                >
                  <dt className="text-muted">{item.label}</dt>
                  <dd className="mt-1 font-medium text-foreground">{item.value}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.08fr)_0.92fr]">
          <section className="rounded-lg border border-border bg-white p-6">
            <h2 className="text-lg font-semibold text-foreground">Operational flow</h2>
            <div className="mt-5 space-y-4">
              {workflow.map((step, index) => (
                <div
                  key={step.title}
                  className="grid gap-3 border-t border-border pt-4 first:border-t-0 first:pt-0 sm:grid-cols-[44px_1fr]"
                >
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface text-sm font-semibold text-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{step.title}</p>
                    <p className="mt-1 text-sm leading-6 text-muted">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="grid gap-4">
            <section className="rounded-lg border border-border bg-white p-6">
              <h2 className="text-lg font-semibold text-foreground">Role boundaries</h2>
              <div className="mt-4 space-y-4">
                {roleCards.map((role) => (
                  <div
                    key={role.title}
                    className="rounded-md border border-border bg-surface px-4 py-4"
                  >
                    <p className="text-sm font-semibold text-foreground">{role.title}</p>
                    <p className="mt-2 text-sm leading-6 text-muted">
                      {role.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-border bg-white p-6">
              <div className="flex items-end justify-between gap-4 border-b border-border pb-4">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Demo access</h2>
                  <p className="text-sm text-muted">
                    Shared seeded credentials for the quickest full walkthrough.
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-4">
                {demoAccounts.map((account) => (
                  <div
                    key={account.label}
                    className="rounded-md border border-border bg-surface px-4 py-4"
                  >
                    <p className="text-sm font-semibold text-foreground">{account.label}</p>
                    <dl className="mt-3 space-y-2 text-sm">
                      <div className="flex items-center justify-between gap-4">
                        <dt className="text-muted">Email</dt>
                        <dd className="font-medium text-foreground">{account.email}</dd>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <dt className="text-muted">Password</dt>
                        <dd className="font-medium text-foreground">{account.password}</dd>
                      </div>
                    </dl>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
