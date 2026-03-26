import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { getCurrentUser, getDefaultRouteForUser } from "@/lib/session";

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect(getDefaultRouteForUser(user));
  }

  return (
    <AuthShell
      mode="login"
      title="Sign in to payroll"
      description="Use the email attached to your payroll workspace or employee portal account."
    >
      <LoginForm />
    </AuthShell>
  );
}
