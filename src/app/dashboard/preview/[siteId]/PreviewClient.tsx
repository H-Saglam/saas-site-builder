"use client";

import { useRouter } from "next/navigation";
import type { SiteData } from "@/lib/types";
import TemplateView from "@/components/template/TemplateView";

const DRAFT_WATERMARK_TEXT = "ÖZEL BİR ANI - ÖNİZLEME";

export default function PreviewClient({ siteData }: { siteData: SiteData }) {
  const router = useRouter();
  const shouldShowDraftWatermark = siteData.status === "draft";

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Floating preview banner */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] bg-zinc-900/90 backdrop-blur-md border border-zinc-700/50 rounded-full px-5 py-2 flex items-center gap-3 shadow-2xl shadow-black/50">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        <span className="text-white text-xs font-medium">Önizleme</span>
        <span className="text-zinc-600 text-xs">— Yayında değil</span>
        <button
          onClick={() => router.back()}
          className="ml-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white px-3 py-1 rounded-full text-xs font-medium transition-colors"
        >
          ← Geri
        </button>
      </div>

      {/* Full-screen site preview */}
      <TemplateView
        recipientName={siteData.recipientName}
        slides={siteData.slides}
        musicTrack={siteData.musicTrack}
      />

      {shouldShowDraftWatermark && (
        <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden>
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-0 grid content-between grid-cols-2 place-items-center gap-8 p-6 sm:grid-cols-3 sm:gap-10 sm:p-10">
            {Array.from({ length: 18 }).map((_, index) => (
              <span
                key={`draft-watermark-${index}`}
                className="whitespace-nowrap select-none rotate-[-24deg] text-base font-semibold tracking-[0.28em] text-white/35 sm:text-xl"
              >
                {DRAFT_WATERMARK_TEXT}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
