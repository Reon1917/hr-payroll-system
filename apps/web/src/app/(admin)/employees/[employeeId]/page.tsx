import type { EmployeeDetail } from "@hr-payroll/shared";
import { WORKER_TYPE_LABELS } from "@hr-payroll/shared";
import { EmployeeForm } from "@/components/forms/employee-form";
import { PortalAccountPanel } from "@/components/forms/portal-account-panel";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { serverApiFetch } from "@/lib/api-server";
import { formatCurrency, formatDate } from "@/lib/format";

export default async function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ employeeId: string }>;
}) {
  const { employeeId } = await params;
  const employee = await serverApiFetch<EmployeeDetail>(`/employees/${employeeId}`);

  if (!employee) {
    throw new Error("Employee not found.");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={employee.fullName}
        description="Review worker identity, payroll settings, compliance details, and employee portal access from one profile."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Worker type" value={WORKER_TYPE_LABELS[employee.workerType]} />
        <StatCard
          label="Primary document"
          value={
            employee.workerType === "thai"
              ? employee.nationalId ?? "Pending"
              : employee.passportNumber ?? "Pending"
          }
        />
        <StatCard label="Hire date" value={formatDate(employee.hireDate)} />
        <StatCard label="Base rate" value={formatCurrency(employee.baseRate)} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <section className="space-y-6">
          <div className="app-panel rounded-[28px] p-5">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl text-foreground">
                  Employee profile
                </h2>
                <p className="mt-2 text-sm text-muted">
                  Keep payroll-ready data current before each monthly run.
                </p>
              </div>
              <StatusBadge
                label={employee.employmentStatus}
                tone={employee.employmentStatus === "active" ? "success" : "neutral"}
              />
            </div>
            <EmployeeForm employee={employee} mode="edit" />
          </div>
        </section>

        <div className="space-y-6">
          <PortalAccountPanel employee={employee} />

          <section className="app-panel rounded-[28px] p-5">
            <h2 className="font-display text-2xl text-foreground">
              Compliance snapshot
            </h2>
            <dl className="mt-5 space-y-4 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted">Nationality</dt>
                <dd className="font-medium text-foreground">
                  {employee.nationality ?? "-"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted">Tax ID</dt>
                <dd className="font-medium text-foreground">
                  {employee.taxId ?? "-"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted">Social security</dt>
                <dd className="font-medium text-foreground">
                  {employee.socialSecurityEnabled
                    ? employee.socialSecurityNumber ?? "Pending"
                    : "Excluded"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted">Work permit</dt>
                <dd className="text-right font-medium text-foreground">
                  <div>{employee.workPermitNumber ?? "-"}</div>
                  <div className="text-xs text-muted">
                    Expires {formatDate(employee.workPermitExpiryDate)}
                  </div>
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted">Visa</dt>
                <dd className="text-right font-medium text-foreground">
                  <div>{employee.visaType ?? "-"}</div>
                  <div className="text-xs text-muted">
                    Expires {formatDate(employee.visaExpiryDate)}
                  </div>
                </dd>
              </div>
            </dl>
          </section>

          <section className="app-panel rounded-[28px] p-5">
            <h2 className="font-display text-2xl text-foreground">Bank details</h2>
            <dl className="mt-5 space-y-4 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted">Bank</dt>
                <dd className="font-medium text-foreground">{employee.bankName}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted">Account name</dt>
                <dd className="font-medium text-foreground">
                  {employee.bankAccountName}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted">Account number</dt>
                <dd className="font-medium text-foreground">
                  {employee.bankAccountNumber}
                </dd>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
}
