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
      description="Use the same email assigned by HR. If an employee record already exists for that address, the portal account will connect automatically after signup."
    >
      <SignupForm />
    </AuthShell>
  );
}
