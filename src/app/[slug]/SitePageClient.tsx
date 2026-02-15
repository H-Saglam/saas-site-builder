"use client";

import { useState } from "react";
import type { SiteData, SlideGradient } from "@/lib/types";
import TemplateView from "@/components/template/TemplateView";
import PasswordGate from "@/components/template/PasswordGate";

interface SitePageClientProps {
  siteData: SiteData;
  isPrivate: boolean;
  slug: string;
  firstSlideGradient: SlideGradient;
}

export default function SitePageClient({
  siteData,
  isPrivate,
  slug,
  firstSlideGradient,
}: SitePageClientProps) {
  const [verified, setVerified] = useState(!isPrivate);

  if (!verified) {
    return (
      <PasswordGate
        gradient={firstSlideGradient}
        slug={slug}
        onVerified={() => setVerified(true)}
      />
    );
  }

  return (
    <TemplateView
      recipientName={siteData.recipientName}
      slides={siteData.slides}
      musicTrack={siteData.musicTrack}
    />
  );
}
