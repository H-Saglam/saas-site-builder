"use client";

import { useState, useEffect, useCallback } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import TemplatePickerModal from "@/components/TemplatePickerModal";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Ana Sayfa", icon: "🏠" },
  { href: "/dashboard", label: "Sitelerim", icon: "📄", active: true },
  { href: "/dashboard", label: "Müzik Kütüphanesi", icon: "🎵" },
  { href: "/dashboard", label: "Ayarlar", icon: "⚙️" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showPicker, setShowPicker] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useUser();

  const openPicker = useCallback(() => setShowPicker(true), []);

  useEffect(() => {
    window.addEventListener("open-template-picker", openPicker);
    return () => window.removeEventListener("open-template-picker", openPicker);
  }, [openPicker]);

  const isEditor = pathname.includes("/editor/");

  if (isEditor) {
    return (
      <div className="min-h-screen bg-zinc-950">
        {/* Editor Header */}
        <header className="bg-zinc-900 border-b border-zinc-800 px-6 py-3 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <span className="text-lg">💝</span>
            <span className="text-sm font-bold text-white tracking-tight">Özel Bir Anı</span>
            <span className="text-zinc-600 mx-1">/</span>
            <span className="text-sm text-zinc-400 group-hover:text-zinc-200 transition-colors">← Dashboard</span>
          </Link>
          <UserButton afterSignOutUrl="/" />
        </header>
        <main className="p-6 lg:p-8">{children}</main>
        <TemplatePickerModal open={showPicker} onClose={() => setShowPicker(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-zinc-900 border-r border-zinc-800 text-white flex flex-col transition-transform duration-200 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
      >
        {/* Logo */}
        <div className="px-6 py-6 border-b border-zinc-800">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-xl">💝</span>
            <span className="text-lg font-bold tracking-tight text-white">Özel Bir Anı</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = item.active || pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                  ? "bg-rose-500/15 text-rose-400"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                  }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="px-4 py-4 border-t border-zinc-800">
          <div className="flex items-center gap-3 px-2">
            <UserButton afterSignOutUrl="/" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-200 truncate">
                {user?.firstName || user?.username || "Kullanıcı"}
              </p>
              <p className="text-xs text-zinc-500 truncate">
                {user?.primaryEmailAddress?.emailAddress || ""}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Mobile top bar */}
        <div className="lg:hidden bg-zinc-900 border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-zinc-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-sm font-bold text-white">💝 Özel Bir Anı</span>
          <UserButton afterSignOutUrl="/" />
        </div>

        <main className="p-6 lg:p-8">{children}</main>
      </div>

      <TemplatePickerModal open={showPicker} onClose={() => setShowPicker(false)} />
    </div>
  );
}
