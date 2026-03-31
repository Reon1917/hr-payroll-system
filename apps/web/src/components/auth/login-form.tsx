"use client";

import Link from "next/link";
import { startTransition, useState } from "react";
import { clientApiFetch } from "@/lib/api-client";

const fieldClassName =
  "mt-2 w-full rounded-md border border-border bg-white px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);
        setIsPending(true);

        startTransition(async () => {
          try {
            await clientApiFetch("/auth/sign-in/email", {
              method: "POST",
              body: JSON.stringify({
                email,
                password,
              }),
            });
            window.location.assign("/");
          } catch (requestError) {
            setError(
              requestError instanceof Error
                ? requestError.message
                : "Unable to sign in.",
            );
          } finally {
            setIsPending(false);
          }
        });
      }}
    >
      <div>
        <label className="text-sm font-medium text-foreground" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={fieldClassName}
          placeholder="admin@company.test"
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
          placeholder="Enter your password"
          autoComplete="current-password"
          required
        />
      </div>

      <div className="rounded-md border border-border bg-surface px-4 py-3 text-sm leading-6 text-muted">
        This shared demo uses email and password only. Sign in with your own
        signup for a personal portal, or use the seeded demo credentials for a
        populated walkthrough.
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
        {isPending ? "Signing in..." : "Sign in"}
      </button>

      <p className="text-sm text-muted">
        Email and password are the active sign-in method in this demo build.
      </p>

      <p className="text-center text-sm text-muted">
        Need an account?{" "}
        <Link href="/signup" className="font-semibold text-foreground underline underline-offset-4">
          Create one
        </Link>
      </p>
    </form>
  );
}
