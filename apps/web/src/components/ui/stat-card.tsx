import type { ReactNode } from "react";

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: ReactNode;
}) {
  return (
    <div className="min-w-0 overflow-hidden rounded-xl border border-[#dbe4ee] bg-white p-5">
      <div className="mb-4 h-1.5 w-10 rounded-full bg-[#dbeafe]" />
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#64748b]">
        {label}
      </p>
      <p className="mt-3 max-w-full text-[clamp(1.9rem,2.6vw,3rem)] font-semibold leading-[0.94] tracking-[-0.03em] text-[#0f172a] [overflow-wrap:anywhere]">
        {value}
      </p>
      {hint ? (
        <div className="mt-3 text-sm leading-6 text-[#64748b]">{hint}</div>
      ) : null}
    </div>
  );
}
