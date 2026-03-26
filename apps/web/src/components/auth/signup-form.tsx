"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import { clientApiFetch } from "@/lib/api-client";

const fieldClassName =
  "mt-2 w-full rounded-md border border-border bg-white px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10";

export function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
          setError("Passwords do not match.");
          return;
        }

        setIsPending(true);

        startTransition(async () => {
          try {
            await clientApiFetch("/auth/sign-up/email", {
              method: "POST",
              body: JSON.stringify({
                name,
                email,
                password,
              }),
            });
            router.replace("/");
            router.refresh();
          } catch (requestError) {
            setError(
              requestError instanceof Error
                ? requestError.message
                : "Unable to create your account.",
            );
          } finally {
            setIsPending(false);
          }
        });
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-foreground" htmlFor="name">
            Full name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={fieldClassName}
            placeholder="Lin Myat Phyo"
            autoComplete="name"
            required
          />
        </div>

        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-foreground" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={fieldClassName}
            placeholder="you@company.com"
            autoComplete="email"
            required
          />
        </div>

        <div>
          <label
            className="text-sm font-medium text-foreground"
            htmlFor="password"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={fieldClassName}
            placeholder="At least 8 characters"
            minLength={8}
            autoComplete="new-password"
            required
          />
        </div>

        <div>
          <label
            className="text-sm font-medium text-foreground"
            htmlFor="confirm-password"
          >
            Confirm password
          </label>
          <input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className={fieldClassName}
            placeholder="Repeat password"
            minLength={8}
            autoComplete="new-password"
            required
          />
        </div>
      </div>

      <div className="rounded-md border border-border bg-surface px-4 py-3 text-sm leading-6 text-muted">
        If HR already created your employee record, signing up with the same email
        will connect your portal account automatically.
      </div>

      {error ? (
        <div
          className="rounded-md border border-[#e7c1bb] bg-[#fff7f5] px-4 py-3 text-sm text-[#a13a2b]"
          role="alert"
        >
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-foreground px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "Creating account..." : "Create account"}
      </button>

      <p className="text-sm text-muted">Only email and password are enabled in this build.</p>

      <p className="text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-foreground underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </form>
  );
}
