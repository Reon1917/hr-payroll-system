import type { PayslipView } from "@hr-payroll/shared";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { StatCard } from "@/components/ui/stat-card";
import { serverApiFetch } from "@/lib/api-server";
import { formatCurrency, formatDate } from "@/lib/format";
import { requireEmployee } from "@/lib/session";

export default async function PortalPage() {
  const user = await requireEmployee();

  if (!user.employeeId) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Employee portal"
          description="Your account is active, but HR has not linked it to an employee record yet."
        />

        <section className="rounded-xl border border-border bg-white p-6">
          <div className="max-w-2xl space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Awaiting HR linkage
            </p>
            <h2 className="text-2xl font-semibold text-foreground">
              Your sign-up is complete.
            </h2>
            <p className="text-sm leading-7 text-muted">
              Once HR connects this email to your employee record, your payroll
              history and payslips will appear here automatically.
            </p>
          </div>
        </section>
      </div>
    );
  }

  const payslips = (await serverApiFetch<PayslipView[]>("/me/payslips")) ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employee portal"
        description="View your profile basics, payroll history, and payslips."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Employee" value={user.employee?.fullName ?? user.name} />
        <StatCard
          label="Department"
          value={user.employee?.department ?? "Not linked"}
        />
        <StatCard label="Payslips" value={String(payslips.length)} />
      </div>

      <section className="rounded-xl border border-border bg-white p-5">
        <h2 className="text-lg font-semibold text-foreground">Payroll history</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-muted">
              <tr>
                <th className="pb-3 font-medium">Pay period</th>
                <th className="pb-3 font-medium">Payment date</th>
                <th className="pb-3 font-medium text-right">Net pay</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {payslips.map((payslip) => (
                <tr key={payslip.payrollRecordId} className="border-t border-border">
                  <td className="py-3">
                    <Link
                      href={`/portal/payslips/${payslip.payrollRecordId}`}
                      className="font-medium text-foreground"
                    >
                      {payslip.payPeriodName}
                    </Link>
                  </td>
                  <td className="py-3 text-muted">
                    {formatDate(payslip.paymentDate)}
                  </td>
                  <td className="py-3 text-right font-medium text-foreground">
                    {formatCurrency(payslip.netPay)}
                  </td>
                  <td className="py-3">
                    <StatusBadge
                      label={payslip.status}
                      tone={payslip.status === "paid" ? "success" : "primary"}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
