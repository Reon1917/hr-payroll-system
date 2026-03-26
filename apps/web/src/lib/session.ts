import type { CurrentUser } from "@hr-payroll/shared";
import { redirect } from "next/navigation";
import { serverApiFetch } from "./api-server";

export async function getCurrentUser(): Promise<CurrentUser | null> {
  return serverApiFetch<CurrentUser>("/me", undefined, {
    allowUnauthorized: true,
    allowUnavailable: true,
  });
}

export function getDefaultRouteForUser(user: CurrentUser): string {
  if (user.role === "admin") {
    return "/dashboard";
  }

  return user.employeeId ? "/portal" : "/account";
}

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireAdmin(): Promise<CurrentUser> {
  const user = await requireUser();

  if (user.role !== "admin") {
    redirect("/portal");
  }

  return user;
}

export async function requireEmployee(): Promise<CurrentUser> {
  const user = await requireUser();

  if (user.role !== "employee") {
    redirect("/dashboard");
  }

  return user;
}
