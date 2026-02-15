import type { SlideGradient } from "@/lib/types";
import SongBadge from "./SongBadge";

interface TextSlideProps {
  heading: string;
  description: string;
  gradient: SlideGradient;
  songTitle?: string;
  songArtist?: string;
  isActive: boolean;
}

export default function TextSlide({
  heading,
  description,
  gradient,
  songTitle,
  songArtist,
  isActive,
}: TextSlideProps) {
  return (
    <section
      className={`slide slide-text ${isActive ? "active" : ""}`}
      style={{
        background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`,
      }}
    >
      {songTitle && songArtist && (
        <SongBadge title={songTitle} artist={songArtist} />
      )}
      <div className="content">
        <div className="text-content">
          <h2 className="animate-up">{heading}</h2>
          {description && (
            <p className="animate-up delay-1">{description}</p>
          )}
        </div>
      </div>
    </section>
  );
}
