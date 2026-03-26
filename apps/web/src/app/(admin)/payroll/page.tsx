import type { PayPeriodSummary } from "@hr-payroll/shared";
import Link from "next/link";
import { PayPeriodForm } from "@/components/forms/pay-period-form";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { serverApiFetch } from "@/lib/api-server";
import { formatDateRange } from "@/lib/format";

function getRunStatus(period: PayPeriodSummary): {
  label: string;
  tone: "primary" | "success" | "warning";
} {
  if (period.totalRecords > 0 && period.statusCounts.paid === period.totalRecords) {
    return { label: "Paid", tone: "success" };
  }

  if (period.statusCounts.approved > 0) {
    return { label: "Approved", tone: "primary" };
  }

  return { label: "In progress", tone: "warning" };
}

export default async function PayrollPage() {
  const periods = (await serverApiFetch<PayPeriodSummary[]>("/pay-periods")) ?? [];
  const openRuns = periods.filter(
    (period) => !(period.totalRecords > 0 && period.statusCounts.paid === period.totalRecords),
  );
  const latestRun = periods[0] ?? null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payroll runs"
        description="Open each payroll cycle, track it through calculation and approval, then close the bookkeeping record after manual payment."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Runs" value={String(periods.length)} />
        <StatCard
          label="Open runs"
          value={String(openRuns.length)}
          hint="Payroll cycles not fully marked paid."
        />
        <StatCard
          label="Latest run"
          value={latestRun?.name ?? "-"}
          hint={
            latestRun
              ? formatDateRange(latestRun.startDate, latestRun.endDate)
              : "Create the first payroll run to begin."
          }
        />
        <StatCard
          label="Records in latest run"
          value={latestRun ? String(latestRun.totalRecords) : "0"}
          hint="Active employees included in the most recent cycle."
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_360px]">
        <section className="rounded-xl border border-[#dbe4ee] bg-white p-6">
          <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-[2rem] font-semibold tracking-[-0.02em] text-[#0f172a]">
                Payroll ledger
              </h2>
              <p className="mt-2 text-base leading-7 text-[#64748b]">
                Open a run to manage records, approve totals, and mark payment.
              </p>
            </div>
            <p className="text-sm font-medium text-[#64748b]">
              {periods.length} payroll runs
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-[15px]">
              <thead className="border-y border-[#e2e8f0] bg-[#f8fafc] text-sm text-[#64748b]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Run</th>
                  <th className="px-4 py-3 font-semibold">Coverage</th>
                  <th className="px-4 py-3 text-right font-semibold">Records</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0]">
                {periods.map((period) => {
                  const status = getRunStatus(period);

                  return (
                    <tr key={period.id} className="transition hover:bg-[#f8fbff]">
                      <td className="px-4 py-4">
                        <Link href={`/payroll/${period.id}`} className="block">
                          <p className="font-semibold text-[#0f172a]">{period.name}</p>
                          <p className="text-sm text-[#64748b]">
                            Payment on {period.paymentDate}
                          </p>
                        </Link>
                      </td>
                      <td className="px-4 py-4 text-[#64748b]">
                        {formatDateRange(period.startDate, period.endDate)}
                      </td>
                      <td className="px-4 py-4 text-right font-semibold text-[#0f172a]">
                        {period.totalRecords}
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge label={status.label} tone={status.tone} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-xl border border-[#dbe4ee] bg-white p-6">
          <h2 className="text-[2rem] font-semibold tracking-[-0.02em] text-[#0f172a]">
            Create payroll run
          </h2>
          <p className="mt-2 text-base leading-7 text-[#64748b]">
            Start a monthly payroll cycle with coverage dates and the transfer date.
          </p>
          <div className="mt-5 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-4">
            <PayPeriodForm />
          </div>
        </section>
      </div>
    </div>
  );
}
