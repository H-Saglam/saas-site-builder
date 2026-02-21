"use client";

import { useState, useEffect, useCallback } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileText, Music, Settings, Menu, ChevronLeft, Sparkles } from "lucide-react";
import TemplatePickerModal from "@/components/TemplatePickerModal";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Ana Sayfa", icon: Home },
  { href: "/dashboard", label: "Sitelerim", icon: FileText, active: true },
  { href: "/dashboard", label: "Müzik Kütüphanesi", icon: Music },
  { href: "/dashboard", label: "Ayarlar", icon: Settings },
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
  const isPreview = pathname.includes("/preview/");

  // Preview: full-screen, no sidebar/header
  if (isPreview) {
    return <>{children}</>;
  }

  if (isEditor) {
    return (
      <div className="min-h-screen bg-background">
        {/* Editor Header */}
        <header className="bg-card border-b border-border px-6 py-3 flex items-center justify-between shadow-sm">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-sm font-bold text-foreground tracking-tight">Özel Bir Anı</span>
            <span className="text-border mx-1">/</span>
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors flex items-center gap-1">
              <ChevronLeft className="w-3.5 h-3.5" />
              Dashboard
            </span>
          </Link>
          <UserButton afterSignOutUrl="/" />
        </header>
        <main className="p-6 lg:p-8">{children}</main>
        <TemplatePickerModal open={showPicker} onClose={() => setShowPicker(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border flex flex-col shadow-sm transition-transform duration-200 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
      >
        {/* Logo */}
        <div className="px-6 py-6 border-b border-sidebar-border">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-lg font-bold tracking-tight text-foreground">Özel Bir Anı</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = item.active || pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                  ? "bg-primary-light text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
              >
                <Icon className="w-4.5 h-4.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="px-4 py-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-2">
            <UserButton afterSignOutUrl="/" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user?.firstName || user?.username || "Kullanıcı"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.primaryEmailAddress?.emailAddress || ""}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Mobile top bar */}
        <div className="lg:hidden bg-card border-b border-border px-4 py-3 flex items-center justify-between shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-foreground">Özel Bir Anı</span>
          </div>
          <UserButton afterSignOutUrl="/" />
        </div>

        <main className="p-6 lg:p-8">{children}</main>
      </div>

      <TemplatePickerModal open={showPicker} onClose={() => setShowPicker(false)} />
    </div>
  );
}
