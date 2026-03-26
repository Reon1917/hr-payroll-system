"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface NavItem {
  section: string;
  href: string;
  label: string;
  icon: "dashboard" | "employees" | "payroll" | "reports" | "settings";
}

function NavIcon({ icon }: { icon: NavItem["icon"] }) {
  const iconClassName = "h-4 w-4 text-current";

  if (icon === "dashboard") {
    return (
      <svg viewBox="0 0 16 16" fill="none" className={iconClassName}>
        <rect x="2" y="2" width="5" height="5" rx="1.2" stroke="currentColor" />
        <rect x="9" y="2" width="5" height="5" rx="1.2" stroke="currentColor" />
        <rect x="2" y="9" width="5" height="5" rx="1.2" stroke="currentColor" />
        <rect x="9" y="9" width="5" height="5" rx="1.2" stroke="currentColor" />
      </svg>
    );
  }

  if (icon === "employees") {
    return (
      <svg viewBox="0 0 16 16" fill="none" className={iconClassName}>
        <circle cx="8" cy="5" r="2.5" stroke="currentColor" />
        <path d="M3 13c.7-2.1 2.34-3.15 5-3.15S12.3 10.9 13 13" stroke="currentColor" strokeLinecap="round" />
      </svg>
    );
  }

  if (icon === "payroll") {
    return (
      <svg viewBox="0 0 16 16" fill="none" className={iconClassName}>
        <rect x="3" y="2.5" width="10" height="11" rx="1.6" stroke="currentColor" />
        <path d="M5.5 6h5M5.5 8.5h5M5.5 11h3" stroke="currentColor" strokeLinecap="round" />
      </svg>
    );
  }

  if (icon === "reports") {
    return (
      <svg viewBox="0 0 16 16" fill="none" className={iconClassName}>
        <path d="M3 12.5h10" stroke="currentColor" strokeLinecap="round" />
        <path d="M5 10V6.5M8 10V4M11 10V7.5" stroke="currentColor" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 16 16" fill="none" className={iconClassName}>
      <circle cx="8" cy="8" r="5" stroke="currentColor" />
      <path d="M8 5.5v2.7l1.8 1.2" stroke="currentColor" strokeLinecap="round" />
    </svg>
  );
}

export function SidebarNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const groupedItems = items.reduce<Record<string, NavItem[]>>((groups, item) => {
    groups[item.section] ??= [];
    groups[item.section].push(item);
    return groups;
  }, {});

  return (
    <nav className="space-y-7">
      {Object.entries(groupedItems).map(([section, sectionItems]) => (
        <div key={section} className="space-y-2">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#64748b]">
            {section}
          </p>
          <div className="space-y-1">
            {sectionItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center gap-3 rounded-xl border px-3.5 py-3 text-[15px] font-medium transition ${
                    isActive
                      ? "border-[#bfdbfe] bg-white text-[#0f172a]"
                      : "border-transparent text-[#64748b] hover:border-[#dbe4ee] hover:bg-white hover:text-[#0f172a]"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-lg border ${
                      isActive
                        ? "border-[#bfdbfe] bg-[#eff6ff] text-[#2563eb]"
                        : "border-[#dbe4ee] bg-[#f8fafc] text-[#64748b]"
                    }`}
                  >
                    <NavIcon icon={item.icon} />
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
