import type { PayPeriodDetail } from "@hr-payroll/shared";
import Link from "next/link";
import { PayPeriodForm } from "@/components/forms/pay-period-form";
import { PageHeader } from "@/components/layout/page-header";
import { PayPeriodActions } from "@/components/payroll/pay-period-actions";
import { PayrollRecordEditor } from "@/components/payroll/payroll-record-editor";
import { StatusBadge } from "@/components/ui/status-badge";
import { StatCard } from "@/components/ui/stat-card";
import { serverApiFetch } from "@/lib/api-server";
import { formatCurrency, formatDateRange } from "@/lib/format";

function getRecordTone(status: string): "primary" | "success" | "warning" | "danger" {
  if (status === "paid") {
    return "success";
  }

  if (status === "cancelled") {
    return "danger";
  }

  if (status === "draft") {
    return "warning";
  }

  return "primary";
}

export default async function PayPeriodDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ periodId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { periodId } = await params;
  const query = await searchParams;
  const detail = await serverApiFetch<PayPeriodDetail>(`/pay-periods/${periodId}`);

  if (!detail) {
    throw new Error("Pay period not found.");
  }

  const selectedRecordId =
    typeof query.recordId === "string" ? query.recordId : detail.records[0]?.id;
  const selectedRecord =
    detail.records.find((record) => record.id === selectedRecordId) ?? null;
  const totalNetPay = detail.records.reduce((total, record) => total + record.netPay, 0);
  const readyRecords = detail.records.filter(
    (record) => record.status === "approved" || record.status === "paid",
  ).length;
  const needsAttention = detail.records.filter(
    (record) =>
      record.status === "draft" ||
      (record.salaryType !== "monthly" && record.payUnits <= 0) ||
      record.netPay <= 0,
  ).length;
  const stages = [
    { label: "Inputs", count: detail.statusCounts.draft },
    { label: "Calculated", count: detail.statusCounts.calculated },
    { label: "Approved", count: detail.statusCounts.approved },
    { label: "Paid", count: detail.statusCounts.paid },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={detail.name}
        description={`Coverage ${formatDateRange(detail.startDate, detail.endDate)}. Guide this payroll run from inputs through approval and manual payment.`}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Employees in run" value={String(detail.totalRecords)} />
        <StatCard label="Net payroll" value={formatCurrency(totalNetPay)} />
        <StatCard
          label="Ready for payment"
          value={String(readyRecords)}
          hint="Approved and paid records are ready for bookkeeping."
        />
        <StatCard
          label="Needs attention"
          value={String(needsAttention)}
          hint="Draft rows, zero units, or zero-value results still need review."
        />
      </div>

      <section className="app-panel rounded-[28px] p-5">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              Payroll progress
            </p>
            <h2 className="mt-2 font-display text-2xl text-foreground">
              Run stages
            </h2>
          </div>
          <p className="max-w-xl text-sm text-muted">
            Move the run in order: generate input rows, calculate, approve, then mark paid after the transfer batch is complete.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          {stages.map((stage) => (
            <div
              key={stage.label}
              className="rounded-[22px] border border-border/70 bg-surface-muted/70 p-4"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                {stage.label}
              </p>
              <p className="mt-3 font-display text-3xl leading-none text-foreground">
                {stage.count}
              </p>
            </div>
          ))}
        </div>
      </section>

      <PayPeriodActions
        payPeriodId={detail.id}
        paymentDate={detail.paymentDate}
        statusCounts={detail.statusCounts}
        totalRecords={detail.totalRecords}
      />

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="space-y-6">
          <section className="app-panel rounded-[28px] p-5">
            <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="font-display text-2xl text-foreground">
                  Payroll records
                </h2>
                <p className="mt-2 text-sm text-muted">
                  Review employees that still need units, deductions, or approval.
                </p>
              </div>
              <div className="rounded-full border border-border/80 bg-surface-muted/70 px-4 py-2 text-sm text-muted">
                Payment date {detail.paymentDate}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-muted">
                  <tr>
                    <th className="pb-3 font-medium">Employee</th>
                    <th className="pb-3 font-medium text-right">Units</th>
                    <th className="pb-3 font-medium text-right">Base pay</th>
                    <th className="pb-3 font-medium text-right">Net pay</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.records.map((record) => {
                    const isSelected = record.id === selectedRecordId;

                    return (
                      <tr
                        key={record.id}
                        className={`border-t border-border/70 ${
                          isSelected ? "bg-primary/6" : ""
                        }`}
                      >
                        <td className="py-4">
                          <Link
                            href={`/payroll/${detail.id}?recordId=${record.id}`}
                            className="block"
                          >
                            <p className="font-medium text-foreground">
                              {record.employeeName}
                            </p>
                            <p className="text-xs text-muted">
                              {record.employeeCode} · {record.department}
                            </p>
                            <p className="mt-1 text-xs text-muted">
                              {record.salaryType} · {record.position}
                            </p>
                          </Link>
                        </td>
                        <td className="py-4 text-right text-foreground">
                          {record.payUnits}
                        </td>
                        <td className="py-4 text-right text-foreground">
                          {formatCurrency(record.basePay)}
                        </td>
                        <td className="py-4 text-right font-medium text-foreground">
                          {formatCurrency(record.netPay)}
                        </td>
                        <td className="py-4">
                          <StatusBadge
                            label={record.status}
                            tone={getRecordTone(record.status)}
                          />
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
              Run settings
            </h2>
            <p className="mt-2 text-sm text-muted">
              Adjust dates and payment scheduling for this payroll run.
            </p>
            <div className="mt-5">
              <PayPeriodForm payPeriod={detail} />
            </div>
          </section>
        </section>

        {selectedRecord ? (
          <PayrollRecordEditor record={selectedRecord} />
        ) : (
          <section className="app-panel rounded-[28px] p-5">
            <p className="text-sm text-muted">
              Select a payroll record to edit pay units and manual adjustments.
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
