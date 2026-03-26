"use client";

import type { PayPeriodSummary } from "@hr-payroll/shared";
import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import { clientApiFetch } from "@/lib/api-client";

function initialValues(payPeriod?: PayPeriodSummary) {
  return {
    name: payPeriod?.name ?? "",
    startDate: payPeriod?.startDate ?? "",
    endDate: payPeriod?.endDate ?? "",
    paymentDate: payPeriod?.paymentDate ?? "",
  };
}

export function PayPeriodForm({
  payPeriod,
}: {
  payPeriod?: PayPeriodSummary;
}) {
  const router = useRouter();
  const [values, setValues] = useState(initialValues(payPeriod));
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const isEdit = Boolean(payPeriod);
  const inputClassName =
    "w-full rounded-md border border-[#cbd5e1] bg-white px-4 py-3 text-[15px] text-[#0f172a] outline-none transition placeholder:text-[#94a3b8] focus:border-[#60a5fa] focus:shadow-[0_0_0_3px_rgba(219,234,254,1)]";

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);
        setIsPending(true);

        startTransition(async () => {
          try {
            const response = await clientApiFetch<PayPeriodSummary>(
              isEdit ? `/pay-periods/${payPeriod?.id}` : "/pay-periods",
              {
                method: isEdit ? "PATCH" : "POST",
                body: JSON.stringify(values),
              },
            );

            router.push(`/payroll/${response.id}`);
            router.refresh();
          } catch (requestError) {
            setError(
              requestError instanceof Error
                ? requestError.message
                : "Unable to save pay period.",
            );
          } finally {
            setIsPending(false);
          }
        });
      }}
    >
      {[
        ["name", "Period name", "text"],
        ["startDate", "Start date", "date"],
        ["endDate", "End date", "date"],
        ["paymentDate", "Payment date", "date"],
      ].map(([field, label, type]) => (
        <div key={field} className="space-y-2">
          <label className="text-sm font-semibold text-[#1e293b]">{label}</label>
          <input
            type={type}
            value={values[field as keyof typeof values]}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                [field]: event.target.value,
              }))
            }
            className={inputClassName}
            required
          />
        </div>
      ))}

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        className="w-full rounded-md bg-[#3b82f6] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2563eb]"
      >
        {isPending ? "Saving..." : isEdit ? "Save period" : "Create period"}
      </button>
    </form>
  );
}
