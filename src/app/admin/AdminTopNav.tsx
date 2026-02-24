"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, ShieldCheck } from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", label: "Operations", icon: ShieldCheck },
  { href: "/admin/financial", label: "Financial", icon: BarChart3 },
];

export default function AdminTopNav() {
  const pathname = usePathname();

  return (
    <nav className="inline-flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-1">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
