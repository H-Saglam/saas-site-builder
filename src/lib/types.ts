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
  templateId: string;
  slides: SlideData[];
  musicId: string | null;
  musicTrack?: MusicTrack;
  status: SiteStatus;
  packageType: PackageType;
  isPrivate: boolean;
  passwordHash: string | null;
  publishedAt: string | null;
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
  template_id: string;
  slides: SlideData[];
  music_id: string | null;
  status: SiteStatus;
  package_type: PackageType;
  is_private: boolean;
  password_hash: string | null;
  published_at: string | null;
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
// Editor Form Tipleri
// ============================================

export interface SiteFormData {
  title: string;
  recipientName: string;
  slug: string;
  slides: SlideFormData[];
  musicId: string | null;
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
