"use client";

import type { EmployeeDetail } from "@hr-payroll/shared";
import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import { clientApiFetch } from "@/lib/api-client";

interface EmployeeFormValues {
  employeeCode: string;
  fullName: string;
  email: string;
  employmentStatus: string;
  workerType: "thai" | "foreign";
  nationality: string;
  nationalId: string;
  passportNumber: string;
  taxId: string;
  socialSecurityNumber: string;
  socialSecurityEnabled: boolean;
  hireDate: string;
  department: string;
  position: string;
  salaryType: string;
  baseRate: string;
  bankName: string;
  bankAccountName: string;
  bankAccountNumber: string;
  workPermitNumber: string;
  workPermitExpiryDate: string;
  visaType: string;
  visaExpiryDate: string;
}

const inputClassName =
  "w-full rounded-md border border-[#cbd5e1] bg-white px-4 py-3 text-[15px] text-[#0f172a] outline-none transition placeholder:text-[#94a3b8] focus:border-[#60a5fa] focus:shadow-[0_0_0_3px_rgba(219,234,254,1)]";
const sectionClassName = "rounded-xl border border-[#dbe4ee] bg-white p-5";
const labelClassName = "text-sm font-semibold text-[#1e293b]";

function getInitialValues(employee?: EmployeeDetail): EmployeeFormValues {
  return {
    employeeCode: employee?.employeeCode ?? "",
    fullName: employee?.fullName ?? "",
    email: employee?.email ?? "",
    employmentStatus: employee?.employmentStatus ?? "active",
    workerType: employee?.workerType ?? "thai",
    nationality: employee?.nationality ?? "Thai",
    nationalId: employee?.nationalId ?? "",
    passportNumber: employee?.passportNumber ?? "",
    taxId: employee?.taxId ?? "",
    socialSecurityNumber: employee?.socialSecurityNumber ?? "",
    socialSecurityEnabled: employee?.socialSecurityEnabled ?? true,
    hireDate: employee?.hireDate ?? "",
    department: employee?.department ?? "",
    position: employee?.position ?? "",
    salaryType: employee?.salaryType ?? "monthly",
    baseRate: employee ? String(employee.baseRate) : "",
    bankName: employee?.bankName ?? "",
    bankAccountName: employee?.bankAccountName ?? "",
    bankAccountNumber: employee?.bankAccountNumber ?? "",
    workPermitNumber: employee?.workPermitNumber ?? "",
    workPermitExpiryDate: employee?.workPermitExpiryDate ?? "",
    visaType: employee?.visaType ?? "",
    visaExpiryDate: employee?.visaExpiryDate ?? "",
  };
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#2563eb]">
          {eyebrow}
        </p>
        <h2 className="mt-2 text-xl font-semibold text-[#0f172a]">{title}</h2>
      </div>
      <p className="max-w-xl text-sm leading-6 text-[#64748b]">{description}</p>
    </div>
  );
}

export function EmployeeForm({
  employee,
  mode,
  onSuccess,
  onCancel,
  variant = "page",
}: {
  employee?: EmployeeDetail;
  mode: "create" | "edit";
  onSuccess?: (employee: EmployeeDetail) => void;
  onCancel?: () => void;
  variant?: "page" | "modal";
}) {
  const router = useRouter();
  const [values, setValues] = useState<EmployeeFormValues>(getInitialValues(employee));
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const isForeignWorker = values.workerType === "foreign";
  const isModal = variant === "modal";

  const updateValue = <K extends keyof EmployeeFormValues>(
    name: K,
    value: EmployeeFormValues[K],
  ) => {
    setValues((current) => ({
      ...current,
      [name]: value,
    }));
  };

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);
        setNotice(null);
        setIsPending(true);

        startTransition(async () => {
          try {
            const payload = {
              ...values,
              nationality:
                values.workerType === "thai" && !values.nationality.trim()
                  ? "Thai"
                  : values.nationality,
              baseRate: Number(values.baseRate),
            };
            const response = await clientApiFetch<EmployeeDetail>(
              mode === "create" ? "/employees" : `/employees/${employee?.id}`,
              {
                method: mode === "create" ? "POST" : "PATCH",
                body: JSON.stringify(payload),
              },
            );

            if (mode === "create") {
              if (onSuccess) {
                onSuccess(response);
              } else {
                router.push(`/employees/${response.id}`);
              }
            } else {
              setNotice("Employee details updated.");
              onSuccess?.(response);
              router.refresh();
            }
          } catch (requestError) {
            setError(
              requestError instanceof Error
                ? requestError.message
                : "Unable to save employee.",
            );
          } finally {
            setIsPending(false);
          }
        });
      }}
    >
      <section className={sectionClassName}>
        <SectionHeader
          eyebrow="Profile"
          title="Worker identity"
          description="Capture the fields needed for Thai employees and foreign workers in one payroll profile."
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="space-y-2">
            <label className={labelClassName}>Employee ID</label>
            <input
              value={values.employeeCode}
              onChange={(event) => updateValue("employeeCode", event.target.value)}
              className={inputClassName}
              required
            />
          </div>
          <div className="space-y-2">
            <label className={labelClassName}>Full name</label>
            <input
              value={values.fullName}
              onChange={(event) => updateValue("fullName", event.target.value)}
              className={inputClassName}
              required
            />
          </div>
          <div className="space-y-2">
            <label className={labelClassName}>Email</label>
            <input
              type="email"
              value={values.email}
              onChange={(event) => updateValue("email", event.target.value)}
              className={inputClassName}
              required
            />
          </div>
          <div className="space-y-2">
            <label className={labelClassName}>Employment status</label>
            <select
              value={values.employmentStatus}
              onChange={(event) =>
                updateValue("employmentStatus", event.target.value)
              }
              className={inputClassName}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="resigned">Resigned</option>
              <option value="terminated">Terminated</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className={labelClassName}>Worker type</label>
            <select
              value={values.workerType}
              onChange={(event) => {
                const workerType = event.target.value as EmployeeFormValues["workerType"];
                updateValue("workerType", workerType);
                if (workerType === "thai" && !values.nationality.trim()) {
                  updateValue("nationality", "Thai");
                }
              }}
              className={inputClassName}
            >
              <option value="thai">Thai national</option>
              <option value="foreign">Foreign employee</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className={labelClassName}>Hire date</label>
            <input
              type="date"
              value={values.hireDate}
              onChange={(event) => updateValue("hireDate", event.target.value)}
              className={inputClassName}
            />
          </div>
          <div className="space-y-2">
            <label className={labelClassName}>Nationality</label>
            <input
              value={values.nationality}
              onChange={(event) => updateValue("nationality", event.target.value)}
              className={inputClassName}
              required={isForeignWorker}
            />
          </div>
          <div className="space-y-2">
            <label className={labelClassName}>Thai national ID</label>
            <input
              value={values.nationalId}
              onChange={(event) => updateValue("nationalId", event.target.value)}
              className={inputClassName}
              placeholder="13-digit citizen ID"
              required={!isForeignWorker}
            />
          </div>
          <div className="space-y-2">
            <label className={labelClassName}>Tax ID / TIN</label>
            <input
              value={values.taxId}
              onChange={(event) => updateValue("taxId", event.target.value)}
              className={inputClassName}
              placeholder="Optional if same as national ID"
            />
          </div>
          <div className="space-y-2">
            <label className={labelClassName}>Passport number</label>
            <input
              value={values.passportNumber}
              onChange={(event) =>
                updateValue("passportNumber", event.target.value)
              }
              className={inputClassName}
              placeholder="Required for foreign employees"
              required={isForeignWorker}
            />
          </div>
        </div>
      </section>

      <section className={sectionClassName}>
        <SectionHeader
          eyebrow="Compliance"
          title="Statutory profile"
          description="Keep social security and work authorization details beside payroll setup so month-end review is faster."
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="space-y-2">
            <label className={labelClassName}>Social security number</label>
            <input
              value={values.socialSecurityNumber}
              onChange={(event) =>
                updateValue("socialSecurityNumber", event.target.value)
              }
              disabled={!values.socialSecurityEnabled}
              className={`${inputClassName} disabled:cursor-not-allowed disabled:border-[#e2e8f0] disabled:bg-[#f8fafc] disabled:text-[#94a3b8]`}
              placeholder="Enter SSO member number"
            />
          </div>
          <div className="space-y-2">
            <label className={labelClassName}>Social security status</label>
            <label className="flex min-h-[52px] items-center justify-between rounded-md border border-[#dbe4ee] bg-[#f8fafc] px-4">
              <span className="text-sm text-[#0f172a]">
                Include in SSO payroll tracking
              </span>
              <input
                type="checkbox"
                checked={values.socialSecurityEnabled}
                onChange={(event) =>
                  updateValue("socialSecurityEnabled", event.target.checked)
                }
                className="h-4 w-4 accent-[var(--primary)]"
              />
            </label>
          </div>
          <div className="space-y-2">
            <label className={labelClassName}>Work permit number</label>
            <input
              value={values.workPermitNumber}
              onChange={(event) =>
                updateValue("workPermitNumber", event.target.value)
              }
              className={inputClassName}
              placeholder={
                isForeignWorker
                  ? "Recommended for foreign employees"
                  : "Not required for Thai workers"
              }
            />
          </div>
          <div className="space-y-2">
            <label className={labelClassName}>Work permit expiry</label>
            <input
              type="date"
              value={values.workPermitExpiryDate}
              onChange={(event) =>
                updateValue("workPermitExpiryDate", event.target.value)
              }
              className={inputClassName}
            />
          </div>
          <div className="space-y-2">
            <label className={labelClassName}>Visa type</label>
            <input
              value={values.visaType}
              onChange={(event) => updateValue("visaType", event.target.value)}
              className={inputClassName}
              placeholder="Non-B, Smart Visa, etc."
            />
          </div>
          <div className="space-y-2">
            <label className={labelClassName}>Visa expiry</label>
            <input
              type="date"
              value={values.visaExpiryDate}
              onChange={(event) => updateValue("visaExpiryDate", event.target.value)}
              className={inputClassName}
            />
          </div>
        </div>
      </section>

      <section className={sectionClassName}>
        <SectionHeader
          eyebrow="Payroll"
          title="Pay profile"
          description="Core payroll settings and transfer destination used during each run."
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="space-y-2">
            <label className={labelClassName}>Department</label>
            <input
              value={values.department}
              onChange={(event) => updateValue("department", event.target.value)}
              className={inputClassName}
              required
            />
          </div>
          <div className="space-y-2">
            <label className={labelClassName}>Position</label>
            <input
              value={values.position}
              onChange={(event) => updateValue("position", event.target.value)}
              className={inputClassName}
              required
            />
          </div>
          <div className="space-y-2">
            <label className={labelClassName}>Salary type</label>
            <select
              value={values.salaryType}
              onChange={(event) => updateValue("salaryType", event.target.value)}
              className={inputClassName}
            >
              <option value="monthly">Monthly salary</option>
              <option value="daily">Daily wage</option>
              <option value="hourly">Hourly wage</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className={labelClassName}>Base rate (THB)</label>
            <input
              type="number"
              step="0.01"
              value={values.baseRate}
              onChange={(event) => updateValue("baseRate", event.target.value)}
              className={inputClassName}
              required
            />
          </div>
          <div className="space-y-2">
            <label className={labelClassName}>Bank name</label>
            <input
              value={values.bankName}
              onChange={(event) => updateValue("bankName", event.target.value)}
              className={inputClassName}
              required
            />
          </div>
          <div className="space-y-2">
            <label className={labelClassName}>Bank account name</label>
            <input
              value={values.bankAccountName}
              onChange={(event) =>
                updateValue("bankAccountName", event.target.value)
              }
              className={inputClassName}
              required
            />
          </div>
          <div className="space-y-2 md:col-span-2 xl:col-span-1">
            <label className={labelClassName}>Bank account number</label>
            <input
              value={values.bankAccountNumber}
              onChange={(event) =>
                updateValue("bankAccountNumber", event.target.value)
              }
              className={inputClassName}
              required
            />
          </div>
        </div>
      </section>

      <div
        className={`flex flex-col gap-3 ${
          isModal ? "border-t border-[#dbe4ee] pt-5" : ""
        } md:flex-row md:items-center md:justify-between`}
      >
        <div className="space-y-3">
          {error ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {notice ? (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {notice}
            </div>
          ) : null}
        </div>

        <div className="flex flex-col-reverse gap-3 md:flex-row">
          {onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-md border border-[#cbd5e1] bg-white px-5 py-3 text-sm font-medium text-[#0f172a] transition hover:bg-[#f8fafc]"
            >
              Cancel
            </button>
          ) : null}
          <button
            type="submit"
            className="rounded-md bg-[#3b82f6] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2563eb]"
          >
            {isPending
              ? "Saving..."
              : mode === "create"
                ? "Create employee"
                : "Save changes"}
          </button>
        </div>
      </div>
    </form>
  );
}
