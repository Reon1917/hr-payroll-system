export function StatusBadge({
  label,
  tone,
}: {
  label: string;
  tone: "neutral" | "primary" | "success" | "danger" | "warning";
}) {
  const toneClasses = {
    neutral: "border-[#dbe4ee] bg-[#f8fafc] text-[#334155]",
    primary: "border-[#bfdbfe] bg-[#eff6ff] text-[#1d4ed8]",
    success: "border-[#bbf7d0] bg-[#f0fdf4] text-[#15803d]",
    danger: "border-[#fecaca] bg-[#fef2f2] text-[#b91c1c]",
    warning: "border-[#fde68a] bg-[#fffbeb] text-[#b45309]",
  };

  return (
    <span
      className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.08em] ${toneClasses[tone]}`}
    >
      {label}
    </span>
  );
}
