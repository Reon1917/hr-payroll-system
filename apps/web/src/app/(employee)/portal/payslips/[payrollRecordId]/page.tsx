import type { PayslipView } from "@hr-payroll/shared";
import { PageHeader } from "@/components/layout/page-header";
import { PrintButton } from "@/components/ui/print-button";
import { serverApiFetch } from "@/lib/api-server";
import { formatCurrency, formatDate } from "@/lib/format";

export default async function PayslipPage({
  params,
}: {
  params: Promise<{ payrollRecordId: string }>;
}) {
  const { payrollRecordId } = await params;
  const payslip = await serverApiFetch<PayslipView>(
    `/me/payslips/${payrollRecordId}`,
  );

  if (!payslip) {
    throw new Error("Payslip not found.");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Payslip · ${payslip.payPeriodName}`}
        description="Print-friendly payslip view for browser PDF saving."
        actions={<PrintButton />}
      />

      <section className="rounded-xl border border-border bg-white p-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-sm text-muted">Employee</p>
            <p className="mt-1 text-lg font-semibold text-foreground">
              {payslip.employee.fullName}
            </p>
            <p className="text-sm text-muted">
              {payslip.employee.employeeCode} · {payslip.employee.position}
            </p>
          </div>
          <div className="text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted">Pay period</span>
              <span className="font-medium text-foreground">
                {payslip.payPeriodName}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-muted">Payment date</span>
              <span className="font-medium text-foreground">
                {formatDate(payslip.paymentDate)}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-lg bg-surface p-4">
            <p className="text-sm text-muted">Base pay</p>
            <p className="mt-1 text-xl font-semibold text-foreground">
              {formatCurrency(payslip.basePay)}
            </p>
          </div>
          <div className="rounded-lg bg-surface p-4">
            <p className="text-sm text-muted">Additions</p>
            <p className="mt-1 text-xl font-semibold text-foreground">
              {formatCurrency(payslip.additionsTotal)}
            </p>
          </div>
          <div className="rounded-lg bg-surface p-4">
            <p className="text-sm text-muted">Deductions</p>
            <p className="mt-1 text-xl font-semibold text-foreground">
              {formatCurrency(payslip.deductionsTotal)}
            </p>
          </div>
          <div className="rounded-lg bg-blue-50 p-4">
            <p className="text-sm text-blue-700">Net pay</p>
            <p className="mt-1 text-xl font-semibold text-blue-900">
              {formatCurrency(payslip.netPay)}
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              Additions
            </h2>
            <div className="mt-3 space-y-2">
              {payslip.additions.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
                >
                  <span>{item.label}</span>
                  <span className="font-medium">{formatCurrency(item.amount)}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              Deductions
            </h2>
            <div className="mt-3 space-y-2">
              {payslip.deductions.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
                >
                  <span>{item.label}</span>
                  <span className="font-medium">{formatCurrency(item.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
