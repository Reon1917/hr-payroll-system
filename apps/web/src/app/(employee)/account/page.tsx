import { PageHeader } from "@/components/layout/page-header";
import { requireEmployee } from "@/lib/session";

export default async function AccountPage() {
  const user = await requireEmployee();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Account"
        description="Your connected employee portal account."
      />

      <section className="rounded-xl border border-border bg-white p-5">
        <dl className="space-y-3 text-sm">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted">Name</dt>
            <dd className="font-medium text-foreground">{user.name}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted">Email</dt>
            <dd className="font-medium text-foreground">{user.email}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted">Role</dt>
            <dd className="font-medium capitalize text-foreground">{user.role}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted">Employee link</dt>
            <dd className="font-medium text-foreground">
              {user.employeeId ? "Connected" : "Pending HR linkage"}
            </dd>
          </div>
        </dl>
      </section>

      {!user.employeeId ? (
        <section className="rounded-xl border border-[#d8e4ff] bg-[#f6f9ff] p-5">
          <h2 className="text-lg font-semibold text-foreground">
            Account created successfully
          </h2>
          <p className="mt-2 text-sm leading-7 text-muted">
            HR still needs to connect this login to your employee record before
            payslips and payroll history appear in the portal.
          </p>
        </section>
      ) : null}

      <section className="rounded-xl border border-border bg-white p-5">
        <h2 className="text-lg font-semibold text-foreground">Google login</h2>
        <p className="mt-2 text-sm text-muted">
          Google login is visible in the UI roadmap but remains disabled in this
          MVP. Email and password are the active sign-in method.
        </p>
      </section>
    </div>
  );
}
