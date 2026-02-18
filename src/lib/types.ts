// ============================================
// Slide Tipleri
// ============================================

export type SlideType = "cover" | "photo" | "collage" | "text" | "finale";

export interface SlideGradient {
  from: string;
  to: string;
}

export interface SlideData {
  order: number;
  type: SlideType;
  heading: string;
  description: string;
  gradient: SlideGradient;
  imageUrl?: string;        // photo & cover & finale tipleri için
  collageUrls?: string[];   // collage tipi için (3 resim)
  imageAlt?: string;
  handPointerText?: string; // finale slide'ındaki el pointer metni
}

// ============================================
// Müzik Tipleri
// ============================================

export type MusicCategory = "romantic" | "joyful" | "melancholic" | "energetic";

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  category: MusicCategory;
  fileUrl: string;
  durationSeconds?: number;
}

// ============================================
// Site Tipleri
// ============================================

export type SiteStatus = "draft" | "paid" | "active" | "expired";
export type PackageType = "standard" | "premium";

export interface SiteData {
  id: string;
  userId: string;
  slug: string;
  title: string;
  recipientName: string;
  slides: SlideData[];
  musicId: string | null;
  musicTrack?: MusicTrack;
  status: SiteStatus;
  packageType: PackageType;
  isPrivate: boolean;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Veritabanı Row Tipi (Supabase snake_case)
// ============================================

export interface SiteRow {
  id: string;
  user_id: string;
  slug: string;
  title: string;
  recipient_name: string;
  slides: SlideData[];
  music_id: string | null;
  status: SiteStatus;
  package_type: PackageType;
  is_private: boolean;
  password_hash: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MusicRow {
  id: string;
  title: string;
  artist: string;
  category: MusicCategory;
  file_url: string;
  duration_seconds: number | null;
  created_at: string;
}

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
    slides: row.slides,
    musicId: row.music_id,
    musicTrack,
    status: row.status,
    packageType: row.package_type,
    isPrivate: row.is_private,
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

// ============================================
// Editor Form Tipleri
// ============================================

export interface SiteFormData {
  title: string;
  recipientName: string;
  slug: string;
  slides: SlideFormData[];
  musicId: string;
  isPrivate: boolean;
  password?: string;
  confirmPassword?: string;
}

export interface SlideFormData {
  order: number;
  type: SlideType;
  heading: string;
  description: string;
  gradient: SlideGradient;
  imageFile?: File | null;
  imageUrl?: string;
  collageFiles?: (File | null)[];
  collageUrls?: string[];
  handPointerText?: string;
}

// ============================================
// Gradient Presets
// ============================================

export const GRADIENT_PRESETS: { name: string; gradient: SlideGradient }[] = [
  { name: "Mor Gece", gradient: { from: "#2b0a3d", to: "#511a68" } },
  { name: "Kahve", gradient: { from: "#3E2723", to: "#5D4037" } },
  { name: "Karanlık", gradient: { from: "#000000", to: "#434343" } },
  { name: "Okyanus", gradient: { from: "#1A237E", to: "#3949AB" } },
  { name: "Aşk", gradient: { from: "#880E4F", to: "#C2185B" } },
  { name: "Gün Batımı", gradient: { from: "#EF6C00", to: "#FFA726" } },
  { name: "Evren", gradient: { from: "#512DA8", to: "#7E57C2" } },
  { name: "Altın", gradient: { from: "#F9A825", to: "#FBC02D" } },
  { name: "Ateş", gradient: { from: "#BF360C", to: "#E64A19" } },
  { name: "Orman", gradient: { from: "#1B5E20", to: "#4CAF50" } },
  { name: "Gece Mavisi", gradient: { from: "#0D47A1", to: "#42A5F5" } },
  { name: "Pembe Rüya", gradient: { from: "#AD1457", to: "#F48FB1" } },
  { name: "Turkuaz", gradient: { from: "#006064", to: "#4DD0E1" } },
  { name: "Lavanta", gradient: { from: "#4A148C", to: "#CE93D8" } },
  { name: "Gül Kurusu", gradient: { from: "#4E342E", to: "#A1887F" } },
];

// ============================================
// Müzik Kategorileri
// ============================================

export const MUSIC_CATEGORIES: { value: MusicCategory; label: string; emoji: string }[] = [
  { value: "romantic", label: "Romantik", emoji: "💕" },
  { value: "joyful", label: "Neşeli", emoji: "🎉" },
  { value: "melancholic", label: "Hüzünlü", emoji: "🥺" },
  { value: "energetic", label: "Enerjik", emoji: "⚡" },
];
