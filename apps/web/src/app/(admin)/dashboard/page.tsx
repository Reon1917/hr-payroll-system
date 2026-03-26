import type {
  EmployeeSummary,
  PayPeriodDetail,
  PayPeriodSummary,
} from "@hr-payroll/shared";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { serverApiFetch } from "@/lib/api-server";
import { formatCurrency, formatDateRange } from "@/lib/format";

function getRunStatus(period: PayPeriodSummary): {
  label: string;
  tone: "primary" | "success" | "warning";
} {
  if (period.totalRecords > 0 && period.statusCounts.paid === period.totalRecords) {
    return { label: "Final", tone: "success" };
  }

  if (period.statusCounts.approved > 0) {
    return { label: "Approved", tone: "primary" };
  }

  return { label: "Draft", tone: "warning" };
}

export default async function DashboardPage() {
  const employees =
    (await serverApiFetch<EmployeeSummary[]>("/employees")) ?? [];
  const periods = (await serverApiFetch<PayPeriodSummary[]>("/pay-periods")) ?? [];
  const latestPeriod = periods[0] ?? null;
  const latestDetail = latestPeriod
    ? await serverApiFetch<PayPeriodDetail>(`/pay-periods/${latestPeriod.id}`)
    : null;

  const thaiEmployees = employees.filter((employee) => employee.workerType === "thai");
  const foreignEmployees = employees.filter(
    (employee) => employee.workerType === "foreign",
  );
  const grossPayroll = latestDetail
    ? latestDetail.records.reduce(
        (total, record) => total + record.basePay + record.additionsTotal,
        0,
      )
    : 0;
  const socialSecurityTotal = latestDetail
    ? latestDetail.records.reduce(
        (total, record) =>
          total +
          record.adjustments
            .filter((adjustment) => adjustment.type === "social_security")
            .reduce((sum, adjustment) => sum + adjustment.amount, 0),
        0,
      )
    : 0;
  const withholdingTaxTotal = latestDetail
    ? latestDetail.records.reduce(
        (total, record) =>
          total +
          record.adjustments
            .filter((adjustment) => adjustment.type === "tax")
            .reduce((sum, adjustment) => sum + adjustment.amount, 0),
        0,
      )
    : 0;
  const departmentBreakdown = latestDetail
    ? Object.entries(
        latestDetail.records.reduce<Record<string, number>>((groups, record) => {
          groups[record.department] = (groups[record.department] ?? 0) + record.netPay;
          return groups;
        }, {}),
      ).sort((left, right) => right[1] - left[1])
    : [];
  const maxDepartmentValue = departmentBreakdown[0]?.[1] ?? 1;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={
          latestPeriod
            ? `Overview for ${latestPeriod.name}. Review payroll readiness, monthly deductions, and the latest bookkeeping totals.`
            : "Overview for the current payroll workspace. Create the first payroll run to start operations."
        }
        actions={
          <Link
            href="/payroll"
            className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-strong"
          >
            Run payroll
          </Link>
        }
      />

      <section className="app-panel rounded-[30px] p-5">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              Current cycle
            </p>
            <h2 className="mt-3 font-display text-3xl text-foreground">
              {latestPeriod?.name ?? "No payroll run yet"}
            </h2>
            <p className="mt-2 text-sm text-muted">
              {latestPeriod
                ? formatDateRange(latestPeriod.startDate, latestPeriod.endDate)
                : "Open a payroll run to see monthly payroll metrics here."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {latestPeriod ? (
              <StatusBadge
                label={getRunStatus(latestPeriod).label}
                tone={getRunStatus(latestPeriod).tone}
              />
            ) : null}
            <div className="rounded-full border border-border/80 bg-surface-muted/70 px-4 py-2 text-sm text-muted">
              Thailand payroll bookkeeping system
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[24px] border border-border/70 bg-surface-muted/80 p-5">
            <p className="text-sm text-muted">Employees</p>
            <p className="mt-2 font-display text-4xl leading-none text-foreground">
              {employees.length}
            </p>
            <p className="mt-3 text-sm text-muted">
              Thai: {thaiEmployees.length}, foreign: {foreignEmployees.length}
            </p>
          </div>
          <div className="rounded-[24px] border border-border/70 bg-surface-muted/80 p-5">
            <p className="text-sm text-muted">Gross payroll</p>
            <p className="mt-2 font-display text-4xl leading-none text-foreground">
              {formatCurrency(grossPayroll)}
            </p>
            <p className="mt-3 text-sm text-muted">
              Latest run estimate before payment.
            </p>
          </div>
          <div className="rounded-[24px] border border-border/70 bg-surface-muted/80 p-5">
            <p className="text-sm text-muted">SSF contribution</p>
            <p className="mt-2 font-display text-4xl leading-none text-foreground">
              {formatCurrency(socialSecurityTotal)}
            </p>
            <p className="mt-3 text-sm text-muted">
              Employee-side deductions captured in payroll.
            </p>
          </div>
          <div className="rounded-[24px] border border-border/70 bg-surface-muted/80 p-5">
            <p className="text-sm text-muted">Withholding tax</p>
            <p className="mt-2 font-display text-4xl leading-none text-foreground">
              {formatCurrency(withholdingTaxTotal)}
            </p>
            <p className="mt-3 text-sm text-muted">
              Current payroll record total for P.N.D.1 review.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="app-panel rounded-[28px] p-5">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl text-foreground">
                Recent payroll runs
              </h2>
              <p className="mt-1 text-sm text-muted">
                Most recent three payroll periods and their current bookkeeping state.
              </p>
            </div>
            <div className="rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              3 months
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-muted">
                <tr>
                  <th className="pb-3 font-medium">Period</th>
                  <th className="pb-3 font-medium text-right">Employees</th>
                  <th className="pb-3 font-medium text-right">Net total</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {periods.slice(0, 3).map((period) => {
                  const status = getRunStatus(period);
                  const netTotal = latestDetail && period.id === latestDetail.id
                    ? latestDetail.records.reduce((sum, record) => sum + record.netPay, 0)
                    : null;

                  return (
                    <tr key={period.id} className="border-t border-border/70">
                      <td className="py-4">
                        <Link href={`/payroll/${period.id}`} className="block">
                          <p className="font-medium text-foreground">{period.name}</p>
                          <p className="text-xs text-muted">
                            {formatDateRange(period.startDate, period.endDate)}
                          </p>
                        </Link>
                      </td>
                      <td className="py-4 text-right text-foreground">
                        {period.totalRecords}
                      </td>
                      <td className="py-4 text-right font-medium text-foreground">
                        {netTotal !== null ? formatCurrency(netTotal) : "-"}
                      </td>
                      <td className="py-4">
                        <StatusBadge label={status.label} tone={status.tone} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="app-panel rounded-[28px] p-5">
          <h2 className="font-display text-2xl text-foreground">
            Department breakdown
          </h2>
          <p className="mt-1 text-sm text-muted">
            Net payroll by department for the latest available run.
          </p>

          <div className="mt-6 space-y-5">
            {departmentBreakdown.length > 0 ? (
              departmentBreakdown.map(([department, amount]) => (
                <div key={department} className="space-y-2">
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="font-medium text-foreground">{department}</span>
                    <span className="text-muted">{formatCurrency(amount)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-surface-muted">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{
                        width: `${Math.max((amount / maxDepartmentValue) * 100, 8)}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted">
                Department payroll bars appear once a payroll run contains records.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
