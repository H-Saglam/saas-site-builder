import type { SlideGradient } from "@/lib/types";
import SongBadge from "./SongBadge";

interface PhotoSlideProps {
  heading: string;
  description: string;
  imageUrl?: string | null;
  imageAlt?: string;
  gradient: SlideGradient;
  songTitle?: string;
  songArtist?: string;
  isActive: boolean;
  rotateLeft?: boolean;
}

export default function PhotoSlide({
  heading,
  description,
  imageUrl,
  imageAlt = "",
  gradient,
  songTitle,
  songArtist,
  isActive,
  rotateLeft,
}: PhotoSlideProps) {
  const normalizedImageUrl = imageUrl?.trim();

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
        <div className={`photo-frame animate-pop ${rotateLeft ? "rotate-left" : ""}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {normalizedImageUrl && <img src={normalizedImageUrl} alt={imageAlt || heading} />}
        </div>
        <h2 className="animate-up">{heading}</h2>
        {description && (
          <p className="animate-up delay-1">{description}</p>
        )}
      </div>
    </section>
  );
}
