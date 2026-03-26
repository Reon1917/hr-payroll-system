import type { PayPeriodSummary, PayrollSummaryReport } from "@hr-payroll/shared";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { serverApiFetch } from "@/lib/api-server";
import { formatCurrency } from "@/lib/format";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const periods = (await serverApiFetch<PayPeriodSummary[]>("/pay-periods")) ?? [];
  const selectedPeriodId =
    (typeof params.periodId === "string" ? params.periodId : undefined) ??
    periods[0]?.id;
  const summary = selectedPeriodId
    ? await serverApiFetch<PayrollSummaryReport>(
        `/reports/payroll-summary?periodId=${selectedPeriodId}`,
      )
    : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Basic payroll summary reporting for each pay period."
      />

      <section className="rounded-xl border border-[#dbe4ee] bg-white p-6">
        <form className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="min-w-0 flex-1 space-y-2">
            <label className="text-sm font-semibold text-[#1e293b]">Pay period</label>
            <select
              name="periodId"
              defaultValue={selectedPeriodId}
              className="w-full rounded-md border border-[#cbd5e1] bg-white px-4 py-3 text-[15px] text-[#0f172a] outline-none transition focus:border-[#60a5fa] focus:shadow-[0_0_0_3px_rgba(219,234,254,1)]"
            >
              {periods.map((period) => (
                <option key={period.id} value={period.id}>
                  {period.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="rounded-md bg-[#3b82f6] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2563eb]"
          >
            Load report
          </button>
        </form>
      </section>

      {summary ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-12">
            <div className="xl:col-span-3">
              <StatCard
                label="Total payroll cost"
                value={formatCurrency(summary.totalPayrollCost)}
              />
            </div>
            <div className="xl:col-span-2">
              <StatCard
                label="Paid employees"
                value={String(summary.numberOfPaidEmployees)}
              />
            </div>
            <div className="xl:col-span-2">
              <StatCard
                label="Additions"
                value={formatCurrency(summary.totalAdditions)}
              />
            </div>
            <div className="xl:col-span-2">
              <StatCard
                label="Deductions"
                value={formatCurrency(summary.totalDeductions)}
              />
            </div>
            <div className="xl:col-span-3">
              <StatCard label="Net pay" value={formatCurrency(summary.totalNetPay)} />
            </div>
          </div>

          <section className="rounded-xl border border-[#dbe4ee] bg-white p-6">
            <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <h2 className="text-[2rem] font-semibold tracking-[-0.02em] text-[#0f172a]">
                Status counts
              </h2>
              <p className="text-sm text-[#64748b]">
                Current distribution for the selected pay period.
              </p>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              {Object.entries(summary.statusCounts).map(([status, count]) => (
                <div
                  key={status}
                  className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-4 text-center"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#64748b]">
                    {status}
                  </p>
                  <p className="mt-3 text-4xl font-semibold text-[#0f172a]">
                    {count}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : (
        <section className="rounded-xl border border-[#dbe4ee] bg-white p-6 text-sm text-[#64748b]">
          No pay periods available yet.
        </section>
      )}
    </div>
  );
}
