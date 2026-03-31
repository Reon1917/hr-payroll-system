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
      description="This is a shared demo build. Sign in with your own account or use one of the seeded demo users for a populated walkthrough."
    >
      <LoginForm />
    </AuthShell>
  );
}
