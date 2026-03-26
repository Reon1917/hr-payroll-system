import { PageHeader } from "@/components/layout/page-header";
import { requireAdmin } from "@/lib/session";

export default async function SettingsPage() {
  const user = await requireAdmin();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Minimal account and authentication settings for the MVP."
      />

      <section className="app-panel rounded-[28px] p-5">
        <h2 className="font-display text-2xl text-foreground">Account</h2>
        <dl className="mt-4 space-y-3 text-sm">
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
        </dl>
      </section>

      <section className="app-panel rounded-[28px] p-5">
        <h2 className="font-display text-2xl text-foreground">Google login</h2>
        <p className="mt-2 text-sm text-muted">
          Google sign-in is intentionally scaffold-only in this MVP. The UI is
          present, but the provider remains disabled until a later phase.
        </p>
      </section>
    </div>
  );
}
