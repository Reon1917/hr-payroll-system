import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#2563eb]">
          Payroll workspace
        </p>
        <div>
          <h1 className="text-[2.4rem] font-semibold tracking-[-0.03em] text-[#0f172a]">
            {title}
          </h1>
          <p className="mt-2 max-w-3xl text-base leading-8 text-[#475569]">
            {description}
          </p>
        </div>
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
