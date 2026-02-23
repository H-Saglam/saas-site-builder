"use client";

import { memo } from "react";
import type { SlideGradient } from "@/lib/types";
import SongBadge from "./SongBadge";
import ConfettiCanvas from "./ConfettiCanvas";

interface CoverSlideProps {
  recipientName: string;
  subtitle: string;
  gradient: SlideGradient;
  songTitle?: string;
  songArtist?: string;
  isActive: boolean;
  isFirstTap: boolean;
}

function CoverSlide({
  recipientName,
  subtitle,
  gradient,
  songTitle,
  songArtist,
  isActive,
  isFirstTap,
}: CoverSlideProps) {
  return (
    <section
      className={`slide ${isActive ? "active" : ""}`}
      style={{
        background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`,
      }}
    >
      {songTitle && songArtist && (
        <SongBadge title={songTitle} artist={songArtist} />
      )}
      <div className="content">
        <h1 className="animate-up">{recipientName}...</h1>
        <p className="animate-up delay-1">{subtitle}</p>
        {isFirstTap && (
          <div className="tap-hint">Başlamak için dokun ❤️</div>
        )}
      </div>
    </section>
  );
}

// Wrapped in React.memo to prevent unnecessary re-renders when other slides are active.
export default memo(CoverSlide);

// ============================================
// Finale Slide
// ============================================

interface FinaleSlideProps {
  heading: string;
  description: string;
  imageUrl?: string;
  handPointerText?: string;
  gradient: SlideGradient;
  songTitle?: string;
  songArtist?: string;
  isActive: boolean;
  onReplay: () => void;
}

function FinaleSlideComponent({
  heading,
  description,
  imageUrl,
  handPointerText,
  gradient,
  songTitle,
  songArtist,
  isActive,
  onReplay,
}: FinaleSlideProps) {
  const normalizedImageUrl = imageUrl?.trim();

  return (
    <section
      className={`slide slide-finale ${isActive ? "active" : ""}`}
      style={{
        background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`,
      }}
    >
      {songTitle && songArtist && (
        <SongBadge title={songTitle} artist={songArtist} />
      )}
      <div className="content">
        {normalizedImageUrl && (
          <div className="photo-frame animate-pop">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={normalizedImageUrl} alt="Final" />
            {handPointerText && (
              <div className="hand-pointer">{handPointerText}</div>
            )}
          </div>
        )}
        <h1 className="animate-up delay-1">{heading}</h1>
        {description && (
          <p className="animate-up delay-2">{description}</p>
        )}
        <button className="replay-btn" onClick={onReplay}>
          Başa Dön ↺
        </button>
      </div>
      <ConfettiCanvas trigger={isActive} />
    </section>
  );
}

// Wrapped in React.memo to prevent unnecessary re-renders when other slides are active.
export const FinaleSlide = memo(FinaleSlideComponent);
