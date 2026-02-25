import {
  MusicCategory,
  MusicRow,
  MusicTrack,
  SiteData,
  SiteRow,
} from "./types";

// ============================================
// Dönüştürme Fonksiyonları
// ============================================

export function siteRowToData(row: SiteRow, musicTrack?: MusicTrack): SiteData {
  return {
    id: row.id,
    userId: row.user_id,
    slug: row.slug,
    title: row.title,
    recipientName: row.recipient_name,
    templateId: row.template_id,
    slides: row.slides,
    musicId: row.music_id,
    musicTrack,
    status: row.status,
    packageType: row.package_type,
    isPrivate: row.is_private,
    passwordHash: row.password_hash,
    publishedAt: row.published_at,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function musicRowToTrack(row: MusicRow): MusicTrack {
  return {
    id: row.id,
    title: row.title,
    artist: row.artist,
    category: row.category as MusicCategory,
    fileUrl: row.file_url,
    durationSeconds: row.duration_seconds ?? undefined,
  };
}
