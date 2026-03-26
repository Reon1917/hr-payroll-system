"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { EmployeeForm } from "@/components/forms/employee-form";

export function CreateWorkerModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const closeModal = () => setIsOpen(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-md bg-[#3b82f6] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2563eb]"
      >
        Create worker
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 bg-slate-900/20 px-4 py-6 backdrop-blur-[1px]"
          onClick={closeModal}
        >
          <div className="mx-auto flex h-full max-w-5xl items-start">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="create-worker-title"
              className="flex max-h-full w-full flex-col overflow-hidden rounded-xl border border-[#d7e0ea] bg-[#f8fafc]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-6 border-b border-[#d7e0ea] bg-white px-6 py-5">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#2563eb]">
                    Employee setup
                  </p>
                  <h2
                    id="create-worker-title"
                    className="mt-2 text-[2rem] font-semibold tracking-[-0.02em] text-[#0f172a]"
                  >
                    Create worker
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[#64748b]">
                    Add a payroll-ready employee profile for Thai nationals or
                    foreign workers without leaving the directory view.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-md border border-[#cbd5e1] bg-white px-3 py-2 text-sm font-medium text-[#0f172a] transition hover:bg-[#f8fafc]"
                >
                  Close
                </button>
              </div>

              <div className="max-h-[calc(100vh-8rem)] overflow-y-auto bg-[#f5f7fb] px-6 py-6">
                <EmployeeForm
                  mode="create"
                  variant="modal"
                  onCancel={closeModal}
                  onSuccess={() => {
                    closeModal();
                    router.refresh();
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
