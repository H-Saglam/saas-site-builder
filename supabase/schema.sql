-- ============================================
-- LoveSite - Supabase Veritabanı Şeması
-- Bu dosyayı Supabase SQL Editor'de çalıştırın
-- ============================================

-- UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Sites Tablosu
-- ============================================
CREATE TABLE IF NOT EXISTS sites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  slides JSONB NOT NULL DEFAULT '[]',
  music_id UUID REFERENCES music_library(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'paid', 'active', 'expired')),
  package_type TEXT DEFAULT 'standard' CHECK (package_type IN ('standard', 'premium')),
  is_private BOOLEAN DEFAULT false,
  password_hash TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Müzik Kütüphanesi Tablosu
-- ============================================
CREATE TABLE IF NOT EXISTS music_library (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('romantic', 'joyful', 'melancholic', 'energetic')),
  file_url TEXT NOT NULL,
  duration_seconds INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_sites_slug ON sites(slug);
CREATE INDEX IF NOT EXISTS idx_sites_user_id ON sites(user_id);
CREATE INDEX IF NOT EXISTS idx_sites_status ON sites(status);
CREATE INDEX IF NOT EXISTS idx_music_category ON music_library(category);

-- ============================================
-- RLS (Row Level Security) Politikaları
-- ============================================
-- NOT: Tüm yazma işlemleri (INSERT/UPDATE/DELETE) sunucu tarafında
-- Service Role Key ile yapılır (RLS'i bypass eder).
-- Bu yüzden client (anon key) tarafında yazma izni VERİLMEZ.
-- Sadece SELECT için public erişim açıktır (public site görüntüleme + müzik listeleme).

-- Sites tablosu için RLS aktif et
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;

-- Herkes okuyabilir (public siteler için gerekli)
CREATE POLICY "Sites are viewable by everyone" ON sites
  FOR SELECT USING (true);

-- INSERT/UPDATE/DELETE -> Anon key ile YASAKLI
-- (Service Role key RLS'i otomatik bypass eder, ek policy gerekmez)

-- Müzik kütüphanesi - herkes okuyabilir (sadece SELECT)
ALTER TABLE music_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Music is viewable by everyone" ON music_library
  FOR SELECT USING (true);

-- ============================================
-- Storage Bucket'ları (Supabase Dashboard'dan da oluşturulabilir)
-- ============================================
-- NOT: Bu komutlar Supabase Dashboard > Storage bölümünden manuel oluşturulmalı:
-- 1. "user-uploads" bucket (Public)
-- 2. "music-files" bucket (Public)

-- ============================================
-- Örnek Müzik Verileri (Test için)
-- ============================================
INSERT INTO music_library (title, artist, category, file_url, duration_seconds) VALUES
  ('Romantik Piyano', 'LoveSite Music', 'romantic', 'https://example.com/romantic-piano.mp3', 180),
  ('Neşeli Gitar', 'LoveSite Music', 'joyful', 'https://example.com/joyful-guitar.mp3', 150),
  ('Hüzünlü Keman', 'LoveSite Music', 'melancholic', 'https://example.com/melancholic-violin.mp3', 200),
  ('Enerjik Beat', 'LoveSite Music', 'energetic', 'https://example.com/energetic-beat.mp3', 160)
ON CONFLICT DO NOTHING;

-- Eski tehlikeli policy'leri kaldır
DROP POLICY IF EXISTS "Users can insert their own sites" ON sites;
DROP POLICY IF EXISTS "Users can update their own sites" ON sites;
DROP POLICY IF EXISTS "Users can delete their own sites" ON sites;
