"use client";

import type { EmployeeDetail } from "@hr-payroll/shared";
import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import { clientApiFetch } from "@/lib/api-client";

export function PortalAccountPanel({ employee }: { employee: EmployeeDetail }) {
  const router = useRouter();
  const [provisionPassword, setProvisionPassword] = useState("Employee123!");
  const [resetPassword, setResetPassword] = useState("Employee123!");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleAction = (path: string, password: string) => {
    setMessage(null);
    setError(null);
    setIsPending(true);

    startTransition(async () => {
      try {
        const response = await clientApiFetch<{
          portalAccount?: { temporaryPassword?: string };
          temporaryPassword?: string;
        }>(path, {
          method: "POST",
          body: JSON.stringify({ password }),
        });

        setMessage(
          `Temporary password: ${
            response.portalAccount?.temporaryPassword ??
            response.temporaryPassword ??
            password
          }`,
        );
        router.refresh();
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to update portal account.",
        );
      } finally {
        setIsPending(false);
      }
    });
  };

  return (
    <div className="app-panel rounded-[28px] p-5">
      <h2 className="font-display text-2xl text-foreground">Portal access</h2>
      <p className="mt-2 text-sm text-muted">
        {employee.linkedAuthUserId
          ? "Reset the employee portal password."
          : "Create an employee portal account with a temporary password."}
      </p>

      <div className="mt-5 space-y-4">
        {!employee.linkedAuthUserId ? (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Temporary password
            </label>
            <input
              value={provisionPassword}
              onChange={(event) => setProvisionPassword(event.target.value)}
              className="app-input w-full rounded-2xl px-3.5 py-3 text-sm outline-none"
            />
            <button
              type="button"
              onClick={() =>
                handleAction(
                  `/employees/${employee.id}/provision-account`,
                  provisionPassword,
                )
              }
              className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-strong"
            >
              {isPending ? "Provisioning..." : "Provision portal account"}
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Reset password
            </label>
            <input
              value={resetPassword}
              onChange={(event) => setResetPassword(event.target.value)}
              className="app-input w-full rounded-2xl px-3.5 py-3 text-sm outline-none"
            />
            <button
              type="button"
              onClick={() =>
                handleAction(
                  `/employees/${employee.id}/reset-password`,
                  resetPassword,
                )
              }
              className="rounded-2xl border border-border/80 bg-surface/60 px-5 py-3 text-sm font-medium text-foreground transition hover:border-primary/30 hover:bg-surface"
            >
              {isPending ? "Resetting..." : "Reset portal password"}
            </button>
          </div>
        )}

        {message ? (
          <p className="rounded-2xl border border-emerald-300/25 bg-emerald-300/10 px-4 py-3 text-sm text-success">
            {message}
          </p>
        ) : null}

        {error ? (
          <p className="rounded-2xl border border-red-300/25 bg-red-300/10 px-4 py-3 text-sm text-danger">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
