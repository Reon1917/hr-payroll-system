import type { EmployeeSummary } from "@hr-payroll/shared";
import { WORKER_TYPE_LABELS } from "@hr-payroll/shared";
import Link from "next/link";
import { CreateWorkerModal } from "@/components/employees/create-worker-modal";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { serverApiFetch, withQuery } from "@/lib/api-server";
import { formatCurrency, formatDate } from "@/lib/format";

function hasComplianceGap(employee: EmployeeSummary): boolean {
  if (employee.workerType === "thai" && !employee.nationalId) {
    return true;
  }

  if (
    employee.workerType === "foreign" &&
    (!employee.passportNumber || !employee.nationality)
  ) {
    return true;
  }

  return employee.socialSecurityEnabled && !employee.socialSecurityNumber;
}

function getIdentityLines(employee: EmployeeSummary): [string, string, string] {
  if (employee.workerType === "thai") {
    return [
      employee.nationalId ?? "Thai ID pending",
      employee.nationality ?? "Thai national",
      employee.taxId ? `Tax ID ${employee.taxId}` : "Tax ID pending",
    ];
  }

  return [
    employee.passportNumber ?? "Passport pending",
    employee.nationality ?? "Nationality pending",
    employee.taxId ? `Tax ID ${employee.taxId}` : "Tax ID pending",
  ];
}

function getStatutoryLines(employee: EmployeeSummary): [string, string] {
  return [
    employee.socialSecurityEnabled
      ? employee.socialSecurityNumber
        ? `SSO ${employee.socialSecurityNumber}`
        : "SSO pending"
      : "SSO excluded",
    employee.workerType === "foreign"
      ? "Foreign worker profile"
      : "Thai worker profile",
  ];
}

export default async function EmployeesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const employees =
    (await serverApiFetch<EmployeeSummary[]>(
      withQuery("/employees", {
        search: typeof params.search === "string" ? params.search : undefined,
        employmentStatus:
          typeof params.employmentStatus === "string"
            ? params.employmentStatus
            : undefined,
        workerType:
          typeof params.workerType === "string" ? params.workerType : undefined,
        salaryType:
          typeof params.salaryType === "string" ? params.salaryType : undefined,
      }),
    )) ?? [];

  const thaiEmployees = employees.filter((employee) => employee.workerType === "thai");
  const foreignEmployees = employees.filter(
    (employee) => employee.workerType === "foreign",
  );
  const complianceGaps = employees.filter(hasComplianceGap);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employees"
        description="Maintain payroll-ready employee records with Thai identity details, foreign work authorization, and payment setup in one place."
        actions={<CreateWorkerModal />}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Headcount" value={String(employees.length)} />
        <StatCard
          label="Thai nationals"
          value={String(thaiEmployees.length)}
          hint="Employees using Thai ID based payroll records."
        />
        <StatCard
          label="Foreign workers"
          value={String(foreignEmployees.length)}
          hint="Passport and work authorization tracking."
        />
        <StatCard
          label="Needs compliance check"
          value={String(complianceGaps.length)}
          hint="Missing identity or statutory information."
        />
      </div>

      <section className="rounded-xl border border-[#dbe4ee] bg-white p-6">
        <div className="mb-6 flex flex-col gap-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-[2rem] font-semibold tracking-[-0.02em] text-[#0f172a]">
                Payroll directory
              </h2>
              <p className="mt-2 text-base leading-7 text-[#64748b]">
                Search by employee code, identity document, nationality, or
                department.
              </p>
            </div>
            <p className="text-sm font-medium text-[#64748b]">
              {employees.length} employee records
            </p>
          </div>

          <form className="grid gap-3 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-4 lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)_minmax(0,1fr)_auto_auto]">
            <input
              type="text"
              name="search"
              defaultValue={typeof params.search === "string" ? params.search : ""}
              placeholder="Search employee"
              className="rounded-md border border-[#cbd5e1] bg-white px-4 py-3 text-base text-[#0f172a] outline-none transition placeholder:text-[#94a3b8] focus:border-[#60a5fa] focus:shadow-[0_0_0_3px_rgba(219,234,254,1)]"
            />
            <select
              name="employmentStatus"
              defaultValue={
                typeof params.employmentStatus === "string"
                  ? params.employmentStatus
                  : ""
              }
              className="rounded-md border border-[#cbd5e1] bg-white px-4 py-3 text-base text-[#0f172a] outline-none transition focus:border-[#60a5fa] focus:shadow-[0_0_0_3px_rgba(219,234,254,1)]"
            >
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="resigned">Resigned</option>
              <option value="terminated">Terminated</option>
            </select>
            <select
              name="workerType"
              defaultValue={
                typeof params.workerType === "string" ? params.workerType : ""
              }
              className="rounded-md border border-[#cbd5e1] bg-white px-4 py-3 text-base text-[#0f172a] outline-none transition focus:border-[#60a5fa] focus:shadow-[0_0_0_3px_rgba(219,234,254,1)]"
            >
              <option value="">All worker types</option>
              <option value="thai">Thai national</option>
              <option value="foreign">Foreign employee</option>
            </select>
            <button
              type="submit"
              className="rounded-md bg-[#3b82f6] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#2563eb]"
            >
              Filter
            </button>
            <Link
              href="/employees"
              className="rounded-md border border-[#cbd5e1] bg-white px-4 py-3 text-center text-sm font-medium text-[#0f172a] transition hover:bg-[#f8fafc]"
            >
              Clear
            </Link>
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-[15px]">
            <thead className="border-y border-[#e2e8f0] bg-[#f8fafc] text-sm text-[#64748b]">
              <tr>
                <th className="px-4 py-3 font-semibold">Employee</th>
                <th className="px-4 py-3 font-semibold">Identity</th>
                <th className="px-4 py-3 font-semibold">Payroll</th>
                <th className="px-4 py-3 font-semibold">Statutory</th>
                <th className="px-4 py-3 text-right font-semibold">Base rate</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0]">
              {employees.map((employee) => {
                const missingCompliance = hasComplianceGap(employee);
                const [identityPrimary, identitySecondary, identityTertiary] =
                  getIdentityLines(employee);
                const [statutoryPrimary, statutorySecondary] =
                  getStatutoryLines(employee);

                return (
                  <tr
                    key={employee.id}
                    className="align-top transition hover:bg-[#f8fbff]"
                  >
                    <td className="px-4 py-4">
                      <Link href={`/employees/${employee.id}`} className="block">
                        <p className="text-base font-semibold text-[#0f172a]">
                          {employee.fullName}
                        </p>
                        <p className="text-sm text-[#64748b]">
                          {employee.employeeCode} · {employee.email}
                        </p>
                        <p className="mt-1 text-sm text-[#64748b]">
                          Joined {formatDate(employee.hireDate)}
                        </p>
                      </Link>
                    </td>
                    <td className="px-4 py-4 text-sm text-[#64748b]">
                      <p className="font-semibold text-[#0f172a]">
                        {WORKER_TYPE_LABELS[employee.workerType]}
                      </p>
                      <p className="mt-1">{identityPrimary}</p>
                      <p className="mt-1">{identitySecondary}</p>
                      <p className="mt-1 text-xs">{identityTertiary}</p>
                    </td>
                    <td className="px-4 py-4 text-sm text-[#64748b]">
                      <p className="font-semibold text-[#0f172a]">
                        {employee.department}
                      </p>
                      <p className="mt-1">
                        {employee.position} · {employee.salaryType}
                      </p>
                      <p className="mt-1 text-xs">
                        Joined {formatDate(employee.hireDate)}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-sm text-[#64748b]">
                      <p className="font-semibold text-[#0f172a]">{statutoryPrimary}</p>
                      <p className="mt-1">{statutorySecondary}</p>
                    </td>
                    <td className="px-4 py-4 text-right text-base font-semibold text-[#0f172a]">
                      {formatCurrency(employee.baseRate)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-2">
                        <StatusBadge
                          label={employee.employmentStatus}
                          tone={
                            employee.employmentStatus === "active"
                              ? "success"
                              : "neutral"
                          }
                        />
                        {missingCompliance ? (
                          <StatusBadge label="Action needed" tone="warning" />
                        ) : (
                          <StatusBadge label="Ready" tone="primary" />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {employees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-base text-[#64748b]">
                    No employees match the current filters.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
