import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";
import { getCurrentUser, getDefaultRouteForUser } from "@/lib/session";

export default async function SignupPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect(getDefaultRouteForUser(user));
  }

  return (
    <AuthShell
      mode="signup"
      title="Create payroll account"
      description="Create a public demo account. If the email already matches an imported employee, the account links automatically; otherwise the system provisions a personal demo employee profile for you."
    >
      <SignupForm />
    </AuthShell>
  );
}
