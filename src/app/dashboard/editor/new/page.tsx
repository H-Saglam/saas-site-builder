"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { SlideType, SlideGradient, MusicTrack } from "@/lib/types";
import { GRADIENT_PRESETS, MUSIC_CATEGORIES } from "@/lib/types";

// ============================================
// Types
// ============================================
interface SlideFormItem {
  type: SlideType;
  heading: string;
  description: string;
  gradient: SlideGradient;
  imageUrl: string;
  collageUrls: string[];
  handPointerText: string;
}

const DEFAULT_SLIDE: SlideFormItem = {
  type: "photo",
  heading: "",
  description: "",
  gradient: GRADIENT_PRESETS[0].gradient,
  imageUrl: "",
  collageUrls: ["", "", ""],
  handPointerText: "",
};

// ============================================
// Main Editor Component
// ============================================
export default function EditorPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [title, setTitle] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [slides, setSlides] = useState<SlideFormItem[]>([
    { ...DEFAULT_SLIDE, type: "cover", heading: "", description: "Seninle başlayan hikayemiz...", gradient: GRADIENT_PRESETS[0].gradient },
    { ...DEFAULT_SLIDE, type: "photo", gradient: GRADIENT_PRESETS[1].gradient },
    { ...DEFAULT_SLIDE, type: "photo", gradient: GRADIENT_PRESETS[4].gradient },
    { ...DEFAULT_SLIDE, type: "finale", heading: "Seni çok seviyorum! ❤️", description: "Mutlu yıllar!", gradient: GRADIENT_PRESETS[8].gradient },
  ]);
  const [musicId, setMusicId] = useState("");
  const [musicTracks, setMusicTracks] = useState<MusicTrack[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Müzik listesini yükle
  useEffect(() => {
    fetch("/api/music")
      .then((res) => res.json())
      .then((data) => setMusicTracks(data.tracks || []))
      .catch(console.error);
  }, []);

  // Slug kontrolü (debounced)
  const checkSlug = useCallback(async (s: string) => {
    if (s.length < 3) {
      setSlugAvailable(null);
      return;
    }
    try {
      const res = await fetch(`/api/check-slug?slug=${s}`);
      const data = await res.json();
      setSlugAvailable(data.available);
    } catch {
      setSlugAvailable(null);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (slug.length >= 3) checkSlug(slug);
    }, 500);
    return () => clearTimeout(timer);
  }, [slug, checkSlug]);

  // Slide yönetimi
  const addSlide = () => {
    if (slides.length >= 12) return;
    const newSlide = { ...DEFAULT_SLIDE, gradient: GRADIENT_PRESETS[slides.length % GRADIENT_PRESETS.length].gradient };
    // Finale'den önce ekle
    const finaleIndex = slides.findIndex((s) => s.type === "finale");
    if (finaleIndex >= 0) {
      const updated = [...slides];
      updated.splice(finaleIndex, 0, newSlide);
      setSlides(updated);
    } else {
      setSlides([...slides, newSlide]);
    }
  };

  const removeSlide = (index: number) => {
    if (slides.length <= 3) return;
    if (slides[index].type === "cover" || slides[index].type === "finale") return;
    setSlides(slides.filter((_, i) => i !== index));
  };

  const updateSlide = (index: number, field: string, value: string | string[] | SlideType | SlideGradient) => {
    const updated = [...slides];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (updated[index] as any)[field] = value;
    setSlides(updated);
  };

  // Fotoğraf yükleme
  const handleImageUpload = async (index: number, file: File, collageIndex?: number) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.url) {
        if (collageIndex !== undefined) {
          const updated = [...slides];
          const urls = [...updated[index].collageUrls];
          urls[collageIndex] = data.url;
          updated[index].collageUrls = urls;
          setSlides(updated);
        } else {
          updateSlide(index, "imageUrl", data.url);
        }
      } else {
        setError(data.error || "Yükleme hatası");
      }
    } catch {
      setError("Fotoğraf yüklenirken hata oluştu");
    }
  };

  // Formu kaydet
  const handleSave = async () => {
    setError("");
    setSaving(true);

    try {
      const body = {
        title,
        recipientName,
        slug,
        slides: slides.map((s) => ({
          type: s.type,
          heading: s.type === "cover" ? recipientName : s.heading,
          description: s.description,
          gradient: s.gradient,
          imageUrl: s.imageUrl || undefined,
          collageUrls: s.type === "collage" ? s.collageUrls : undefined,
          handPointerText: s.type === "finale" ? s.handPointerText : undefined,
        })),
        musicId,
        isPrivate,
        password: isPrivate ? password : undefined,
        confirmPassword: isPrivate ? confirmPassword : undefined,
      };

      const res = await fetch("/api/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        router.push(`/dashboard?created=${data.site.slug}`);
      } else {
        setError(data.error || "Bir hata oluştu");
      }
    } catch {
      setError("Kaydedilirken bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const totalSteps = 5;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Steps indicator */}
      <div className="flex items-center gap-2 mb-8">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div key={i} className="flex items-center gap-2 flex-1">
            <button
              onClick={() => setCurrentStep(i + 1)}
              className={`w-8 h-8 rounded-full text-sm font-bold flex items-center justify-center transition-all ${
                currentStep === i + 1
                  ? "bg-purple-600 text-white"
                  : currentStep > i + 1
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-500"
              }`}
            >
              {currentStep > i + 1 ? "✓" : i + 1}
            </button>
            {i < totalSteps - 1 && (
              <div className={`flex-1 h-1 rounded ${currentStep > i + 1 ? "bg-green-500" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {/* ============================================ */}
        {/* ADIM 1: Genel Bilgiler */}
        {/* ============================================ */}
        {currentStep === 1 && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-6">Genel Bilgiler</h2>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Site Başlığı</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Örn: Sevgililer Günü Sürprizi"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alıcının İsmi</label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Örn: Gözde"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
                <p className="text-xs text-gray-400 mt-1">Kapak slide&apos;ında &quot;{recipientName || "İsim"}...&quot; şeklinde görünecek</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Site URL&apos;si</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 whitespace-nowrap">lovesite.com/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    placeholder="ahmet-ayse"
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  />
                </div>
                {slug.length >= 3 && slugAvailable !== null && (
                  <p className={`text-xs mt-1 ${slugAvailable ? "text-green-600" : "text-red-600"}`}>
                    {slugAvailable ? "✓ Bu URL kullanılabilir" : "✗ Bu URL zaten kullanılıyor"}
                  </p>
                )}
              </div>

              {/* Şifre Koruma */}
              <div className="border-t border-gray-200 pt-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Şifre Koruması</label>
                    <p className="text-xs text-gray-400">Siteyi görmek için şifre gereksin</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPrivate(!isPrivate)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${isPrivate ? "bg-purple-600" : "bg-gray-300"}`}
                  >
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isPrivate ? "translate-x-6" : "translate-x-0.5"}`} />
                  </button>
                </div>

                {isPrivate && (
                  <div className="space-y-3 bg-purple-50 rounded-lg p-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Şifre</label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="En az 4 karakter"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Şifre Tekrar</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Şifreyi tekrar girin"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                      />
                      {password && confirmPassword && password !== confirmPassword && (
                        <p className="text-xs text-red-600 mt-1">Şifreler eşleşmiyor</p>
                      )}
                    </div>
                    <p className="text-xs text-purple-600">⚠️ Bu şifreyi ziyaretçilerinizle paylaşmanız gerekecek</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* ADIM 2: Slide Yönetimi */}
        {/* ============================================ */}
        {currentStep === 2 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Slide&apos;lar ({slides.length}/12)</h2>
              <button
                onClick={addSlide}
                disabled={slides.length >= 12}
                className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-200 transition-colors disabled:opacity-50"
              >
                + Slide Ekle
              </button>
            </div>

            <div className="space-y-4">
              {slides.map((slide, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="bg-gray-100 text-gray-600 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </span>
                      <select
                        value={slide.type}
                        onChange={(e) => updateSlide(index, "type", e.target.value as SlideType)}
                        disabled={slide.type === "cover" || slide.type === "finale"}
                        className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-700 disabled:opacity-50"
                      >
                        <option value="cover">Kapak</option>
                        <option value="photo">Fotoğraf</option>
                        <option value="collage">Kolaj (3 foto)</option>
                        <option value="text">Sadece Metin</option>
                        <option value="finale">Final</option>
                      </select>
                    </div>
                    {slide.type !== "cover" && slide.type !== "finale" && (
                      <button
                        onClick={() => removeSlide(index)}
                        className="text-red-400 hover:text-red-600 text-sm"
                        disabled={slides.length <= 3}
                      >
                        ✕ Kaldır
                      </button>
                    )}
                  </div>

                  {/* Heading & Description */}
                  {slide.type !== "cover" && (
                    <>
                      <input
                        type="text"
                        value={slide.heading}
                        onChange={(e) => updateSlide(index, "heading", e.target.value)}
                        placeholder="Başlık"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2 text-sm text-gray-800 focus:ring-1 focus:ring-purple-500 outline-none"
                      />
                    </>
                  )}
                  <textarea
                    value={slide.description}
                    onChange={(e) => updateSlide(index, "description", e.target.value)}
                    placeholder="Açıklama metni"
                    rows={2}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2 text-sm text-gray-800 focus:ring-1 focus:ring-purple-500 outline-none resize-none"
                  />

                  {/* Gradient Seçimi */}
                  <div className="mb-2">
                    <label className="text-xs text-gray-500 mb-1 block">Arka Plan Rengi</label>
                    <div className="flex flex-wrap gap-2">
                      {GRADIENT_PRESETS.map((preset, gi) => (
                        <button
                          key={gi}
                          onClick={() => updateSlide(index, "gradient", preset.gradient)}
                          title={preset.name}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${
                            slide.gradient.from === preset.gradient.from
                              ? "border-purple-500 scale-110"
                              : "border-transparent"
                          }`}
                          style={{
                            background: `linear-gradient(135deg, ${preset.gradient.from}, ${preset.gradient.to})`,
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Hand pointer (finale) */}
                  {slide.type === "finale" && (
                    <input
                      type="text"
                      value={slide.handPointerText}
                      onChange={(e) => updateSlide(index, "handPointerText", e.target.value)}
                      placeholder="El pointer metni (opsiyonel, örn: 👈 O el ne?)"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 focus:ring-1 focus:ring-purple-500 outline-none"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* ADIM 3: Fotoğraf Yükleme */}
        {/* ============================================ */}
        {currentStep === 3 && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-6">Fotoğraflar</h2>
            <div className="space-y-4">
              {slides.map((slide, index) => {
                if (slide.type === "text") return null;

                return (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm font-semibold text-gray-700">
                        Slide {index + 1}:
                      </span>
                      <span className="text-xs text-gray-400 capitalize">{slide.type}</span>
                    </div>

                    {slide.type === "collage" ? (
                      <div className="grid grid-cols-3 gap-3">
                        {[0, 1, 2].map((ci) => (
                          <div key={ci}>
                            {slide.collageUrls[ci] ? (
                              <div className="relative">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={slide.collageUrls[ci]}
                                  alt={`Kolaj ${ci + 1}`}
                                  className="w-full aspect-square object-cover rounded-lg"
                                />
                                <button
                                  onClick={() => {
                                    const urls = [...slide.collageUrls];
                                    urls[ci] = "";
                                    updateSlide(index, "collageUrls", urls);
                                  }}
                                  className="absolute top-1 right-1 bg-red-500 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center"
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <label className="w-full aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-purple-400 transition-colors">
                                <span className="text-gray-400 text-xl">+</span>
                                <input
                                  type="file"
                                  accept="image/jpeg,image/png,image/webp"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleImageUpload(index, file, ci);
                                  }}
                                />
                              </label>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div>
                        {slide.imageUrl ? (
                          <div className="relative inline-block">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={slide.imageUrl}
                              alt="Yüklenen"
                              className="w-32 h-32 object-cover rounded-lg"
                            />
                            <button
                              onClick={() => updateSlide(index, "imageUrl", "")}
                              className="absolute top-1 right-1 bg-red-500 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <label className="inline-flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-400 transition-colors">
                            <span className="text-gray-500 text-sm">📷 Fotoğraf Seç</span>
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleImageUpload(index, file);
                              }}
                            />
                          </label>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* ADIM 4: Müzik Seçimi */}
        {/* ============================================ */}
        {currentStep === 4 && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-6">Müzik Seçin</h2>

            {/* Kategori filtreleri */}
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === "all" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Tümü
              </button>
              {MUSIC_CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === cat.value
                      ? "bg-purple-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {cat.emoji} {cat.label}
                </button>
              ))}
            </div>

            {/* Müzik listesi */}
            {musicTracks.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-lg mb-2">🎵</p>
                <p>Müzik kütüphanesi henüz boş.</p>
                <p className="text-sm mt-1">Supabase&apos;e müzik ekledikten sonra burada görünecek.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {musicTracks
                  .filter((t) => selectedCategory === "all" || t.category === selectedCategory)
                  .map((track) => (
                    <button
                      key={track.id}
                      onClick={() => setMusicId(track.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-lg text-left transition-all ${
                        musicId === track.id
                          ? "bg-purple-100 border-2 border-purple-500"
                          : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      <div className="text-2xl">{musicId === track.id ? "🎵" : "♪"}</div>
                      <div>
                        <div className="font-semibold text-gray-800 text-sm">{track.title}</div>
                        <div className="text-xs text-gray-500">{track.artist}</div>
                      </div>
                      {musicId === track.id && (
                        <div className="ml-auto text-purple-600 text-sm font-semibold">Seçili ✓</div>
                      )}
                    </button>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================ */}
        {/* ADIM 5: Önizleme & Kaydet */}
        {/* ============================================ */}
        {currentStep === 5 && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-6">Önizleme & Kaydet</h2>

            {/* Her slayt ayrı ayrı önizleme */}
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
              {slides.map((slide, i) => (
                <div key={i} className="flex-shrink-0 snap-center">
                  <div className="text-xs text-gray-500 text-center mb-1 font-medium">
                    {i + 1}/{slides.length} — {slide.type === "cover" ? "Kapak" : slide.type === "photo" ? "Fotoğraf" : slide.type === "collage" ? "Kolaj" : slide.type === "text" ? "Metin" : "Final"}
                  </div>
                  <div
                    className="w-[240px] aspect-[9/16] rounded-2xl overflow-hidden shadow-lg border-2 border-gray-700 flex flex-col items-center justify-center text-white text-center p-4 relative"
                    style={{
                      background: `linear-gradient(135deg, ${slide.gradient.from}, ${slide.gradient.to})`,
                    }}
                  >
                    {/* Cover Slide */}
                    {slide.type === "cover" && (
                      <div className="flex flex-col items-center gap-3">
                        <h3 className="text-2xl font-bold drop-shadow-md">{recipientName || "İsim"}...</h3>
                        <p className="text-sm opacity-80">{slide.heading || "Alt başlık"}</p>
                        <div className="mt-4 text-xs opacity-60">Başlamak için dokun ❤️</div>
                      </div>
                    )}

                    {/* Photo Slide */}
                    {slide.type === "photo" && (
                      <div className="flex flex-col items-center gap-2 w-full">
                        {slide.imageUrl ? (
                          <div className="w-[70%] aspect-square rounded-lg overflow-hidden shadow-md border-2 border-white/30 rotate-[-2deg]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={slide.imageUrl} alt={slide.heading} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-[70%] aspect-square rounded-lg bg-white/20 flex items-center justify-center text-3xl">📷</div>
                        )}
                        <h3 className="text-lg font-bold mt-1 drop-shadow-md">{slide.heading || "Başlık"}</h3>
                        {slide.description && <p className="text-xs opacity-80 line-clamp-2">{slide.description}</p>}
                      </div>
                    )}

                    {/* Collage Slide */}
                    {slide.type === "collage" && (
                      <div className="flex flex-col items-center gap-2 w-full">
                        <div className="flex gap-1 w-[85%]">
                          {[0, 1, 2].map((idx) => (
                            <div key={idx} className="flex-1 aspect-square rounded overflow-hidden border border-white/30">
                              {slide.collageUrls[idx] ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={slide.collageUrls[idx]} alt={`Kolaj ${idx + 1}`} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-white/20 flex items-center justify-center text-lg">📷</div>
                              )}
                            </div>
                          ))}
                        </div>
                        <h3 className="text-lg font-bold mt-1 drop-shadow-md">{slide.heading || "Başlık"}</h3>
                        {slide.description && <p className="text-xs opacity-80 line-clamp-2">{slide.description}</p>}
                      </div>
                    )}

                    {/* Text Slide */}
                    {slide.type === "text" && (
                      <div className="flex flex-col items-center gap-3 px-2">
                        <h3 className="text-xl font-bold drop-shadow-md">{slide.heading || "Başlık"}</h3>
                        {slide.description && <p className="text-sm opacity-80 leading-relaxed line-clamp-4">{slide.description}</p>}
                      </div>
                    )}

                    {/* Finale Slide */}
                    {slide.type === "finale" && (
                      <div className="flex flex-col items-center gap-2">
                        {slide.imageUrl ? (
                          <div className="w-[60%] aspect-square rounded-lg overflow-hidden shadow-md border-2 border-white/30">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={slide.imageUrl} alt="Final" className="w-full h-full object-cover" />
                            {slide.handPointerText && (
                              <div className="text-xs mt-1 opacity-70">👆 {slide.handPointerText}</div>
                            )}
                          </div>
                        ) : (
                          <div className="w-[60%] aspect-square rounded-lg bg-white/20 flex items-center justify-center text-3xl">🎉</div>
                        )}
                        <h3 className="text-xl font-bold mt-1 drop-shadow-md">{slide.heading || "Son"}</h3>
                        {slide.description && <p className="text-xs opacity-80 line-clamp-2">{slide.description}</p>}
                        <div className="mt-2 px-3 py-1 bg-white/20 rounded-full text-xs">Başa Dön ↺</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Özet bilgi */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4 mt-4">
              <h3 className="font-semibold text-gray-800 mb-3 text-sm">Özet</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-gray-500">Başlık:</span> <span className="font-medium">{title || "-"}</span></div>
                <div><span className="text-gray-500">Alıcı:</span> <span className="font-medium">{recipientName || "-"}</span></div>
                <div><span className="text-gray-500">URL:</span> <span className="font-medium">/{slug || "-"}</span></div>
                <div><span className="text-gray-500">Slide:</span> <span className="font-medium">{slides.length} adet</span></div>
                <div><span className="text-gray-500">Şifre:</span> <span className="font-medium">{isPrivate ? "Var 🔒" : "Yok"}</span></div>
                <div><span className="text-gray-500">Müzik:</span> <span className="font-medium">{musicTracks.find((t) => t.id === musicId)?.title || "Seçilmedi"}</span></div>
              </div>
            </div>

            <p className="text-xs text-gray-400 mb-4">
              ℹ️ Site &quot;Taslak&quot; olarak kaydedilecek. Dashboard&apos;dan Yayınla butonuyla canlıya alabilirsiniz.
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
            disabled={currentStep === 1}
            className="px-6 py-2.5 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-30"
          >
            ← Geri
          </button>

          {currentStep < totalSteps ? (
            <button
              onClick={() => setCurrentStep((s) => Math.min(totalSteps, s + 1))}
              className="px-6 py-2.5 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              İleri →
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={saving || !title || !recipientName || !slug}
              className="px-8 py-2.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {saving ? "Kaydediliyor..." : "Kaydet & Taslak Oluştur 💾"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
