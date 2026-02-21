import type { SlideGradient } from "@/lib/types";
import SongBadge from "./SongBadge";

interface CollageSlideProps {
  heading: string;
  description: string;
  collageUrls: string[];
  gradient: SlideGradient;
  songTitle?: string;
  songArtist?: string;
  isActive: boolean;
}

export default function CollageSlide({
  heading,
  description,
  collageUrls,
  gradient,
  songTitle,
  songArtist,
  isActive,
}: CollageSlideProps) {
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
        <div className="collage">
          {collageUrls.map((url, index) => {
            const normalizedUrl = url?.trim();
            if (!normalizedUrl) return null;

            return (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={index}
                src={normalizedUrl}
                className={`c-img c-${index + 1} animate-pop delay-${index + 1}`}
                alt={`Kolaj ${index + 1}`}
              />
            );
          })}
        </div>
        <h2 className="animate-up">{heading}</h2>
        {description && (
          <p className="animate-up delay-1">{description}</p>
        )}
      </div>
    </section>
  );
}
