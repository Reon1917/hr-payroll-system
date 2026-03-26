"use client";

import type { StatusCounts } from "@hr-payroll/shared";
import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import { clientApiFetch } from "@/lib/api-client";

function getNextAction(input: {
  totalRecords: number;
  statusCounts: StatusCounts;
}):
  | {
      path: string;
      label: string;
      description: string;
      body?: Record<string, unknown>;
    }
  | null {
  if (input.totalRecords === 0) {
    return {
      path: "generate-drafts",
      label: "Generate drafts",
      description: "Create payroll rows for active employees in this cycle.",
    };
  }

  if (input.statusCounts.draft > 0) {
    return {
      path: "calculate",
      label: "Calculate payroll",
      description: "Lock in the current draft values and move records to review.",
    };
  }

  if (input.statusCounts.calculated > 0) {
    return {
      path: "approve",
      label: "Approve payroll",
      description: "Approve the reviewed payroll totals before payment.",
    };
  }

  if (input.statusCounts.approved > 0) {
    return {
      path: "mark-paid",
      label: "Mark paid",
      description: "Record that the manual bank transfer has completed.",
    };
  }

  return null;
}

export function PayPeriodActions({
  payPeriodId,
  paymentDate,
  statusCounts,
  totalRecords,
}: {
  payPeriodId: string;
  paymentDate: string;
  statusCounts: StatusCounts;
  totalRecords: number;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const nextAction = getNextAction({
    totalRecords,
    statusCounts,
  });

  const runAction = (path: string, body?: Record<string, unknown>) => {
    setMessage(null);
    setError(null);
    setIsPending(true);

    startTransition(async () => {
      try {
        await clientApiFetch(`/pay-periods/${payPeriodId}/${path}`, {
          method: "POST",
          body: body ? JSON.stringify(body) : undefined,
        });
        setMessage("Payroll run updated.");
        router.refresh();
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Action failed.",
        );
      } finally {
        setIsPending(false);
      }
    });
  };

  return (
    <div className="app-panel rounded-[28px] p-5">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Next action
          </p>
          <h2 className="mt-3 font-display text-2xl text-foreground">
            {nextAction?.label ?? "Payroll complete"}
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            {nextAction?.description ??
              "This payroll run is fully paid. Reopen only if a bookkeeping correction is needed."}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {nextAction ? (
            <button
              type="button"
              onClick={() =>
                runAction(
                  nextAction.path,
                  nextAction.path === "mark-paid"
                    ? {
                        paymentDate,
                        paymentNote: "Manual transfer completed",
                        paymentReference: "MANUAL-BATCH",
                      }
                    : undefined,
                )
              }
              className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-strong"
            >
              {isPending ? "Saving..." : nextAction.label}
            </button>
          ) : null}

          <button
            type="button"
            onClick={() => runAction("generate-drafts")}
            className="rounded-2xl border border-border/80 bg-surface/60 px-4 py-3 text-sm font-medium text-foreground transition hover:border-primary/30 hover:bg-surface"
          >
            Refresh drafts
          </button>
          <button
            type="button"
            onClick={() => runAction("reopen")}
            className="rounded-2xl border border-border/80 bg-surface/60 px-4 py-3 text-sm font-medium text-foreground transition hover:border-primary/30 hover:bg-surface"
          >
            Reopen
          </button>
          <button
            type="button"
            onClick={() => runAction("cancel")}
            className="rounded-2xl border border-red-300/25 bg-red-300/10 px-4 py-3 text-sm font-medium text-danger transition hover:bg-red-300/16"
          >
            Cancel
          </button>
        </div>
      </div>

      {message ? <p className="mt-4 text-sm text-success">{message}</p> : null}
      {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
    </div>
  );
}
