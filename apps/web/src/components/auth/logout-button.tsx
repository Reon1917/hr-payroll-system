"use client";

import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import { clientApiFetch } from "@/lib/api-client";

export function LogoutButton() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        setIsPending(true);
        startTransition(async () => {
          try {
            await clientApiFetch("/auth/sign-out", {
              method: "POST",
            });
            router.replace("/login");
            router.refresh();
          } finally {
            setIsPending(false);
          }
        });
      }}
      className="rounded-md border border-[#cbd5e1] bg-white px-4 py-2.5 text-sm font-medium text-[#0f172a] transition hover:border-[#94a3b8] hover:bg-[#f8fafc]"
    >
      {isPending ? "Signing out..." : "Sign out"}
    </button>
  );
}
