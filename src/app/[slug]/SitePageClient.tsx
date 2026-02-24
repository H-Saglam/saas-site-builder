"use client";

import type { SiteData } from "@/lib/types";
import TemplateView from "@/components/template/TemplateView";

interface SitePageClientProps {
  siteData: SiteData;
}

export default function SitePageClient({ siteData }: SitePageClientProps) {
  return (
    <TemplateView
      recipientName={siteData.recipientName}
      slides={siteData.slides}
      musicTrack={siteData.musicTrack}
    />
  );
}
