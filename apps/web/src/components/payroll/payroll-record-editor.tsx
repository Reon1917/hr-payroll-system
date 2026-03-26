"use client";

import type { PayrollRecordDetail } from "@hr-payroll/shared";
import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import { clientApiFetch } from "@/lib/api-client";
import { formatCurrency } from "@/lib/format";

type EditableAdjustment = PayrollRecordDetail["adjustments"][number];

const inputClassName =
  "app-input w-full rounded-2xl px-3.5 py-3 text-sm outline-none transition";

export function PayrollRecordEditor({ record }: { record: PayrollRecordDetail }) {
  const router = useRouter();
  const [payUnits, setPayUnits] = useState(String(record.payUnits));
  const [adjustments, setAdjustments] = useState<EditableAdjustment[]>(
    record.adjustments,
  );
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const updateAdjustment = (
    index: number,
    field: keyof EditableAdjustment,
    value: string,
  ) => {
    setAdjustments((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: field === "amount" ? Number(value) : value,
            }
          : item,
      ),
    );
  };

  const additionsTotal = adjustments
    .filter((adjustment) => adjustment.kind === "addition")
    .reduce((total, adjustment) => total + Number(adjustment.amount), 0);
  const deductionsTotal = adjustments
    .filter((adjustment) => adjustment.kind === "deduction")
    .reduce((total, adjustment) => total + Number(adjustment.amount), 0);

  return (
    <div className="space-y-6">
      <section className="app-panel rounded-[28px] p-5">
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Selected record
          </p>
          <h2 className="mt-3 font-display text-2xl text-foreground">
            {record.employeeName}
          </h2>
          <p className="mt-2 text-sm text-muted">
            {record.employeeCode} · {record.department} · {record.salaryType}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-[22px] border border-border/70 bg-surface-muted/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              Base pay
            </p>
            <p className="mt-3 font-display text-3xl text-foreground">
              {formatCurrency(record.basePay)}
            </p>
          </div>
          <div className="rounded-[22px] border border-border/70 bg-surface-muted/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              Net pay
            </p>
            <p className="mt-3 font-display text-3xl text-foreground">
              {formatCurrency(record.netPay)}
            </p>
          </div>
          <div className="rounded-[22px] border border-border/70 bg-surface-muted/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              Additions
            </p>
            <p className="mt-3 font-display text-3xl text-foreground">
              {formatCurrency(additionsTotal)}
            </p>
          </div>
          <div className="rounded-[22px] border border-border/70 bg-surface-muted/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              Deductions
            </p>
            <p className="mt-3 font-display text-3xl text-foreground">
              {formatCurrency(deductionsTotal)}
            </p>
          </div>
        </div>
      </section>

      <section className="app-panel rounded-[28px] p-5">
        <h2 className="font-display text-2xl text-foreground">Adjustments</h2>
        <p className="mt-2 text-sm text-muted">
          Update pay units and manual additions or deductions for this employee.
        </p>

        <div className="mt-5 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Pay units</label>
            <input
              type="number"
              step="0.01"
              value={payUnits}
              disabled={record.salaryType === "monthly"}
              onChange={(event) => setPayUnits(event.target.value)}
              className={`${inputClassName} disabled:cursor-not-allowed disabled:border-border/40 disabled:bg-surface-muted/60 disabled:text-muted`}
            />
          </div>

          <div className="space-y-3">
            {adjustments.map((adjustment, index) => (
              <div
                key={adjustment.id ?? `${adjustment.kind}-${index}`}
                className="rounded-[22px] border border-border/70 bg-surface-muted/70 p-4"
              >
                <div className="grid gap-3 md:grid-cols-2">
                  <select
                    value={adjustment.kind}
                    onChange={(event) =>
                      updateAdjustment(index, "kind", event.target.value)
                    }
                    className={inputClassName}
                  >
                    <option value="addition">Addition</option>
                    <option value="deduction">Deduction</option>
                  </select>
                  <input
                    value={adjustment.label}
                    onChange={(event) =>
                      updateAdjustment(index, "label", event.target.value)
                    }
                    placeholder="Label"
                    className={inputClassName}
                  />
                </div>

                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <select
                    value={adjustment.type}
                    onChange={(event) =>
                      updateAdjustment(index, "type", event.target.value)
                    }
                    className={inputClassName}
                  >
                    <option value="overtime">Overtime</option>
                    <option value="bonus">Bonus</option>
                    <option value="allowance">Allowance</option>
                    <option value="other_addition">Other addition</option>
                    <option value="unpaid_leave">Unpaid leave</option>
                    <option value="late_penalty">Late penalty</option>
                    <option value="tax">Tax</option>
                    <option value="social_security">Social security</option>
                    <option value="loan">Loan</option>
                    <option value="other_deduction">Other deduction</option>
                  </select>
                  <input
                    type="number"
                    step="0.01"
                    value={String(adjustment.amount)}
                    onChange={(event) =>
                      updateAdjustment(index, "amount", event.target.value)
                    }
                    className={inputClassName}
                  />
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() =>
                setAdjustments((current) => [
                  ...current,
                  {
                    id: `new-${current.length}`,
                    kind: "addition",
                    type: "bonus",
                    label: "",
                    amount: 0,
                    note: null,
                  },
                ])
              }
              className="rounded-2xl border border-border/80 bg-surface/60 px-4 py-3 text-sm font-medium text-foreground transition hover:border-primary/30 hover:bg-surface"
            >
              Add adjustment
            </button>
          </div>

          {error ? <p className="text-sm text-danger">{error}</p> : null}
          {notice ? <p className="text-sm text-success">{notice}</p> : null}

          <button
            type="button"
            onClick={() => {
              setError(null);
              setNotice(null);
              setIsPending(true);

              startTransition(async () => {
                try {
                  await clientApiFetch(`/payroll-records/${record.id}`, {
                    method: "PATCH",
                    body: JSON.stringify({
                      payUnits: Number(payUnits),
                      adjustments: adjustments.map((adjustment) => ({
                        kind: adjustment.kind,
                        type: adjustment.type,
                        label: adjustment.label,
                        amount: Number(adjustment.amount),
                        note: adjustment.note,
                      })),
                    }),
                  });
                  setNotice("Payroll record updated.");
                  router.refresh();
                } catch (requestError) {
                  setError(
                    requestError instanceof Error
                      ? requestError.message
                      : "Unable to update payroll record.",
                  );
                } finally {
                  setIsPending(false);
                }
              });
            }}
            className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-strong"
          >
            {isPending ? "Saving..." : "Save payroll record"}
          </button>
        </div>
      </section>
    </div>
  );
}
