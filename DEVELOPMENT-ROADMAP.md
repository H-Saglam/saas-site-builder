# Özel Bir Anı - Eksik Özellikler ve Geliştirme Yol Haritası

## Bağlam

Proje, kullanıcıların özel günler için interaktif dijital hikaye siteleri oluşturmasını sağlayan bir SaaS platformu. Mevcut durumda temel akış (site oluştur → düzenle → ödeme yap → yayınla) çalışıyor. Ancak bir SaaS ürününün production-ready olması için gereken birçok kritik özellik eksik. Bu doküman, tüm eksiklikleri öncelik sırasına göre listeliyor.

---

## A. KRİTİK ÖNCELİK (Gelir & Kullanıcı Deneyimi)

### 1. Şablon Sistemi Tamamlama
- **Durum:** 6 şablondan sadece 1'i (valentines) aktif
- **Eksikler:** birthday, friendship, wedding, travel, graduation şablonları "coming soon"
- **Dosyalar:** `src/lib/templates.ts`, `src/components/template/`
- **İş:** Her şablon için farklı renk paleti, slide düzeni ve varsayılan içerik tanımla

### 2. E-posta Bildirim Sistemi
- **Durum:** Hiç yok
- **Gerekli bildirimler:**
  - Ödeme başarılı onayı
  - Site süresi dolmadan 7/3/1 gün önce uyarı
  - Düzenleme süresi dolmadan hatırlatma
  - Hoş geldiniz e-postası (kayıt sonrası)
- **Teknoloji:** Resend veya Postmark (Next.js ile kolay entegrasyon)
- **Dosyalar:** Yeni `src/lib/email.ts`, e-posta şablonları

### 3. Zamanlanmış Görevler (Cron Jobs)
- **Durum:** Süresi dolan siteler DB'de "expired" olarak işaretlenmiyor
- **Mevcut:** Sadece sayfa yüklenirken runtime kontrolü var
- **Gerekli:**
  - Günlük cron: süresi dolan siteleri `expired` yap
  - Süre dolum uyarı e-postaları tetikle
- **Teknoloji:** Vercel Cron veya Supabase pg_cron
- **Dosyalar:** Yeni `src/app/api/cron/` endpoint'leri

### 4. Kullanıcı Ayarlar Sayfası
- **Durum:** Sidebar'da link var ama sayfa yok
- **Gerekli:**
  - Profil bilgileri görüntüleme/düzenleme
  - Hesap silme
  - Bildirim tercihleri
- **Dosyalar:** Yeni `src/app/dashboard/settings/page.tsx`

### 5. Site Analitikleri (Kullanıcı İçin)
- **Durum:** Hiç yok - kullanıcılar sitelerinin kaç kez görüntülendiğini bilmiyor
- **Gerekli:**
  - Görüntülenme sayacı (sites tablosuna `view_count` kolonu)
  - Dashboard'da basit istatistikler
- **Dosyalar:** `supabase/schema.sql`, `src/app/[slug]/page.tsx`, `src/app/dashboard/page.tsx`

---

## B. YÜKSEK ÖNCELİK (Ürün Kalitesi)

### 6. Hata İzleme (Error Tracking)
- **Durum:** Sadece `console.error()` var
- **Gerekli:** Sentry entegrasyonu
- **Dosyalar:** Yeni `src/lib/sentry.ts`, `next.config.ts` güncelleme

### 7. React Error Boundaries
- **Durum:** Hiç yok - component crash olursa tüm sayfa çöker
- **Gerekli:**
  - `src/app/dashboard/error.tsx`
  - `src/app/dashboard/editor/[siteId]/error.tsx`
  - `src/app/[slug]/error.tsx`
  - Global `src/app/error.tsx`

### 8. Sosyal Paylaşım & QR Kod
- **Durum:** Hiç yok
- **Gerekli:**
  - Yayınlanan siteye paylaşım butonları (WhatsApp, Instagram, Kopyala)
  - QR kod oluşturma (hediye kartına yapıştırmak için)
  - Dashboard'da paylaşım seçenekleri
- **Dosyalar:** Yeni `src/components/ShareButtons.tsx`, `src/components/QRCode.tsx`

### 9. OpenGraph Görsel Üretimi
- **Durum:** OG metadata var ama görsel yok
- **Gerekli:** Sosyal medyada paylaşılınca preview görsel
- **Teknoloji:** Next.js `ImageResponse` (built-in OG image generation)
- **Dosyalar:** Yeni `src/app/[slug]/opengraph-image.tsx`

### 10. SEO Dosyaları
- **Durum:** robots.txt ve sitemap.xml yok
- **Gerekli:**
  - `src/app/robots.ts` - Arama motoru kuralları
  - `src/app/sitemap.ts` - Dinamik sitemap (aktif siteler)

### 11. Webhook Retry Mekanizması
- **Durum:** Shopier callback başarısız olursa ödeme kaybolur
- **Gerekli:**
  - İdempotency key kontrolü
  - Başarısız ödemeleri tespit etme
  - Admin panelde "bekleyen ödemeler" listesi
- **Dosyalar:** `src/app/api/shopier-callback/route.ts`

---

## C. ORTA ÖNCELİK (Özellik Tamamlama)

### 12. Admin Kullanıcı Yönetimi
- **Durum:** Admin panelde kullanıcı yönetimi yok
- **Gerekli:**
  - Kullanıcı listesi (Clerk API üzerinden)
  - Kullanıcı bazlı site listesi
  - Kullanıcı detay sayfası
- **Dosyalar:** Yeni `src/app/admin/users/page.tsx`

### 13. Admin Gelişmiş Analitik
- **Durum:** Basit KPI kartları var, trend analizi yok
- **Gerekli:**
  - Günlük/haftalık/aylık gelir grafiği
  - Site oluşturma trendi
  - Dönüşüm oranı trendi
  - Şablon kullanım dağılımı (zaman bazlı)
- **Dosyalar:** `src/app/admin/financial/page.tsx`

### 14. İletişim / Destek Sayfası
- **Durum:** Hiç yok
- **Gerekli:**
  - İletişim formu
  - SSS (FAQ) bölümü
  - WhatsApp/e-posta destek linki
- **Dosyalar:** Yeni `src/app/contact/page.tsx`, `src/app/faq/page.tsx`

### 15. Global Rate Limiting
- **Durum:** Sadece `/api/verify-password` endpoint'inde var
- **Gerekli:**
  - Tüm API endpoint'leri için rate limiting
  - Image upload için özellikle (abuse prevention)
  - Site oluşturma limiti (spam engelleme)
- **Dosyalar:** Yeni `src/lib/rate-limit.ts`, tüm API route'larına entegrasyon

### 16. Loading & Skeleton States
- **Durum:** Basit spinner var, skeleton UI yok
- **Gerekli:**
  - Dashboard için skeleton kartlar
  - Editor yüklenirken skeleton
  - `loading.tsx` dosyaları
- **Dosyalar:** Yeni `src/app/dashboard/loading.tsx`, `src/app/admin/loading.tsx`

---

## D. DÜŞÜK ÖNCELİK (Gelecek Geliştirmeler)

### 17. Site Kopyalama / Çoğaltma
- Mevcut siteyi şablon olarak kullanarak yeni site oluşturma
- **Dosyalar:** `src/app/api/sites/route.ts`

### 18. Sürükle-Bırak Slide Sıralama
- Mevcut: Yukarı/aşağı ok butonları
- **Gerekli:** Drag & drop desteği
- **Teknoloji:** @dnd-kit/core

### 19. Auto-Save (Otomatik Kaydetme)
- Draft durumundaki sitelerin düzenlerken otomatik kaydı
- **Dosyalar:** `src/app/dashboard/editor/[siteId]/page.tsx`

### 20. Undo/Redo
- Editor'de geri al / ileri al desteği
- **Dosyalar:** Editor sayfası

### 21. Müzik Kütüphanesi Sayfası
- **Durum:** Sidebar'da link var ama sayfa yok
- Dashboard'da müzik dinleme/keşfetme sayfası
- **Dosyalar:** Yeni `src/app/dashboard/music/page.tsx`

### 22. Admin Müzik & Şablon Yönetimi
- Admin panelden müzik ekleme/silme
- Şablon yönetimi (aktif/pasif, sıralama)
- **Dosyalar:** Yeni `src/app/admin/music/page.tsx`, `src/app/admin/templates/page.tsx`

### 23. CI/CD Pipeline
- GitHub Actions ile otomatik test ve deploy
- **Dosyalar:** Yeni `.github/workflows/ci.yml`

### 24. Çoklu Dil Desteği (i18n)
- Tüm UI Türkçe hardcoded
- İngilizce dil desteği ekleme
- **Teknoloji:** next-intl

### 25. Gelişmiş Görsel Düzenleme
- Görsel kırpma/döndürme
- Filtre uygulama
- **Teknoloji:** react-image-crop

### 26. Health Check Endpoint
- `/api/health` - Uptime monitoring için
- DB bağlantı kontrolü
- **Dosyalar:** Yeni `src/app/api/health/route.ts`

---

## Özet Tablo

| # | Özellik | Öncelik | Durum |
|---|---------|---------|-------|
| 1 | Şablon tamamlama (5 şablon) | Kritik | 1/6 aktif |
| 2 | E-posta bildirimleri | Kritik | Yok |
| 3 | Cron jobs (süre dolumu) | Kritik | Yok |
| 4 | Ayarlar sayfası | Kritik | Yok |
| 5 | Site görüntülenme sayacı | Kritik | Yok |
| 6 | Sentry hata izleme | Yüksek | Yok |
| 7 | Error boundaries | Yüksek | Yok |
| 8 | Sosyal paylaşım & QR | Yüksek | Yok |
| 9 | OG görsel üretimi | Yüksek | Yok |
| 10 | robots.txt & sitemap | Yüksek | Yok |
| 11 | Webhook retry | Yüksek | Yok |
| 12 | Admin kullanıcı yönetimi | Orta | Yok |
| 13 | Admin gelişmiş analitik | Orta | Kısmen |
| 14 | İletişim/destek sayfası | Orta | Yok |
| 15 | Global rate limiting | Orta | Kısmen |
| 16 | Skeleton loading states | Orta | Kısmen |
| 17 | Site kopyalama | Düşük | Yok |
| 18 | Drag & drop slide | Düşük | Yok |
| 19 | Auto-save | Düşük | Yok |
| 20 | Undo/redo | Düşük | Yok |
| 21 | Müzik kütüphanesi sayfası | Düşük | Yok |
| 22 | Admin müzik/şablon yönetimi | Düşük | Yok |
| 23 | CI/CD pipeline | Düşük | Yok |
| 24 | Çoklu dil (i18n) | Düşük | Yok |
| 25 | Görsel düzenleme | Düşük | Yok |
| 26 | Health check endpoint | Düşük | Yok |

---

## Doğrulama

Her özellik implementasyonu sonrası:
1. `bun test` ile mevcut testlerin geçtiğini doğrula
2. `bun run build` ile build hatası olmadığını kontrol et
3. İlgili sayfayı tarayıcıda manuel test et
4. Yeni eklenen API endpoint'lerini curl/Postman ile test et

claude --resume aedbef6a-0d75-4cb0-bab2-90f63f64a850                                                             
