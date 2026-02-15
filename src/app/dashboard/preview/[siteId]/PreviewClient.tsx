"use client";

import { useRouter } from "next/navigation";
import type { SiteData } from "@/lib/types";
import TemplateView from "@/components/template/TemplateView";

export default function PreviewClient({ siteData }: { siteData: SiteData }) {
  const router = useRouter();

  return (
    <div className="relative">
      {/* Önizleme banner */}
      <div className="fixed top-0 left-0 right-0 z-[200] bg-yellow-400 text-yellow-900 text-center py-2 px-4 text-sm font-semibold shadow-md">
        ⚠️ ÖNİZLEME — Bu site henüz yayında değil
        <button
          onClick={() => router.back()}
          className="ml-4 bg-yellow-600 text-white px-3 py-1 rounded text-xs hover:bg-yellow-700"
        >
          ← Geri Dön
        </button>
      </div>
      <div className="pt-10">
        <TemplateView
          recipientName={siteData.recipientName}
          slides={siteData.slides}
          musicTrack={siteData.musicTrack}
        />
      </div>
    </div>
  );
}
