"use client";

import { useState, useEffect, useCallback } from "react";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import TemplatePickerModal from "@/components/TemplatePickerModal";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showPicker, setShowPicker] = useState(false);

  const openPicker = useCallback(() => setShowPicker(true), []);

  // Dashboard sayfasındaki butonlardan da modal açılabilmesi için
  useEffect(() => {
    window.addEventListener("open-template-picker", openPicker);
    return () => window.removeEventListener("open-template-picker", openPicker);
  }, [openPicker]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="text-xl font-bold text-purple-700">
            💝 Özel Bir Anı
          </Link>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowPicker(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors"
            >
              + Yeni Site
            </button>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>

      {/* Şablon Seçim Modalı */}
      <TemplatePickerModal open={showPicker} onClose={() => setShowPicker(false)} />
    </div>
  );
}
