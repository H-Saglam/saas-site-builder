interface SongBadgeProps {
  title: string;
  artist: string;
}

export default function SongBadge({ title, artist }: SongBadgeProps) {
  return (
    <div className="song-badge">
      <div className="equalizer">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <div className="song-info">
        <span className="song-title">{title}</span>
        <span className="artist">{artist}</span>
      </div>
    </div>
  );
}
