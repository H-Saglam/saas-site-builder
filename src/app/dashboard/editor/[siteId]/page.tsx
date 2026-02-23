"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import imageCompression from "browser-image-compression";
import {
  ArrowLeft,
  Save,
  Loader2,
  Trash2,
  GripVertical,
  Eye,
  Image as ImageIcon,
  Type,
  Layout,
  Lock,
  Unlock,
  Music,
  Info,
  Layers,
  Sparkles,
  Monitor,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import type {
  SiteData,
  SlideFormData,
  MusicTrack,
  SlideType,
} from "@/lib/types";
import { GRADIENT_PRESETS, MUSIC_CATEGORIES, siteRowToData } from "@/lib/types";
import TemplateView from "@/components/template/TemplateView";

// ----- helpers -----
function emptySlide(order: number, type: SlideType = "photo"): SlideFormData {
  return {
    order,
    type,
    heading: "",
    description: "",
    gradient: GRADIENT_PRESETS[0].gradient,
    imageFile: null,
    imageUrl: "",
    collageFiles: [null, null, null],
    collageUrls: ["", "", ""],
    handPointerText: "",
  };
}

function defaultSlides(): SlideFormData[] {
  return [
    { ...emptySlide(1, "cover"), description: "Seninle başlayan hikayemiz...", gradient: GRADIENT_PRESETS[0].gradient },
    { ...emptySlide(2, "photo"), gradient: GRADIENT_PRESETS[1].gradient },
    { ...emptySlide(3, "photo"), gradient: GRADIENT_PRESETS[4].gradient },
    { ...emptySlide(4, "finale"), heading: "Seni çok seviyorum! ❤️", description: "Mutlu yıllar!", gradient: GRADIENT_PRESETS[8].gradient },
  ];
}

const SLIDE_TYPE_COLORS: Record<SlideType, string> = {
  cover: "border-l-amber-500",
  photo: "border-l-blue-500",
  collage: "border-l-purple-500",
  text: "border-l-green-500",
  finale: "border-l-rose-500",
};

const SLIDE_TYPE_LABELS: Record<SlideType, string> = {
  cover: "Kapak",
  photo: "Fotoğraf",
  collage: "Kolaj",
  text: "Metin",
  finale: "Final",
};

const SLUG_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const HEADING_REQUIRED_TYPES = new Set<SlideType>(["text", "finale"]);

function getValidationMessage(details: unknown): string | null {
  if (!details || typeof details !== "object") return null;
  const parsed = details as {
    formErrors?: unknown;
    fieldErrors?: Record<string, unknown>;
  };

  if (Array.isArray(parsed.formErrors)) {
    const formError = parsed.formErrors.find((msg) => typeof msg === "string" && msg.trim().length > 0);
    if (typeof formError === "string") return formError;
  }

  if (parsed.fieldErrors && typeof parsed.fieldErrors === "object") {
    for (const [field, fieldErrors] of Object.entries(parsed.fieldErrors)) {
      if (!Array.isArray(fieldErrors)) continue;
      const fieldError = fieldErrors.find((msg) => typeof msg === "string" && msg.trim().length > 0);
      if (typeof fieldError === "string") return `${field}: ${fieldError}`;
    }
  }

  return null;
}

export default function EditSitePage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const siteId = params.siteId as string;
  const isNewSite = siteId === "new";
  const templateParam = isNewSite ? searchParams.get("template") : null;

  const [loading, setLoading] = useState(!isNewSite);
  const [saving, setSaving] = useState(false);
  const [site, setSite] = useState<SiteData | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [editExpired, setEditExpired] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState<number>(0);

  // --- form state ---
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [slides, setSlides] = useState<SlideFormData[]>(isNewSite ? defaultSlides() : []);
  const [selectedMusicId, setSelectedMusicId] = useState<string | null>(null);
  const [musicTracks, setMusicTracks] = useState<MusicTrack[]>([]);

  // --- create mode: slug availability ---
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

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
    if (!isNewSite) return;
    const timer = setTimeout(() => {
      if (slug.length >= 3) checkSlug(slug);
      else setSlugAvailable(null);
    }, 500);
    return () => clearTimeout(timer);
  }, [slug, checkSlug, isNewSite]);

  // fetch site data on mount (edit mode only)
  useEffect(() => {
    if (isNewSite) return;
    async function fetchSite() {
      try {
        const res = await fetch(`/api/sites?siteId=${siteId}`);
        if (!res.ok) throw new Error("Site bulunamadı");
        const data = await res.json();
        const raw = data.site;
        const s: SiteData = siteRowToData(raw);
        setSite(s);
        setSlug(s.slug);
        setTitle(s.title);
        setRecipientName(s.recipientName);
        setIsPrivate(s.isPrivate);
        setSlides(
          s.slides.map((sl, i) => ({
            ...sl,
            order: i + 1,
            imageFile: null,
            collageFiles: [null, null, null],
            collageUrls: sl.collageUrls ?? ["", "", ""],
            handPointerText: sl.handPointerText ?? "",
          })) as SlideFormData[]
        );
        setSelectedMusicId(s.musicId ?? null);

        // Düzenleme süresi kontrolü (1 hafta)
        if (raw.created_at) {
          const createdAt = new Date(raw.created_at);
          const now = new Date();
          const daysSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
          const remaining = Math.max(0, 7 - daysSinceCreation);
          setDaysRemaining(Math.ceil(remaining));
          setEditExpired(daysSinceCreation > 7);
        }
      } catch {
        alert("Site yüklenirken hata oluştu.");
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    }
    fetchSite();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteId, isNewSite]);

  // fetch music tracks
  useEffect(() => {
    fetch("/api/music")
      .then((r) => r.json())
      .then((d) => setMusicTracks(d.tracks ?? []))
      .catch(() => {});
  }, []);

  // --- slide helpers ---
  function addSlide(type: SlideType) {
    if (slides.length >= 12) return;
    setSlides([...slides, emptySlide(slides.length + 1, type)]);
  }
  function removeSlide(index: number) {
    if (slides.length <= 3) return;
    setSlides(slides.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i + 1 })));
  }
  function updateSlide(index: number, patch: Partial<SlideFormData>) {
    setSlides(slides.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }

  // --- upload ---
  async function compressImage(file: File): Promise<File> {
    const compressedBlob = await imageCompression(file, {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: "image/webp",
    });

    const baseName = file.name.replace(/\.[^/.]+$/, "") || "image";
    return new File([compressedBlob], `${baseName}.webp`, {
      type: "image/webp",
      lastModified: Date.now(),
    });
  }

  async function uploadFile(file: File): Promise<string> {
    const compressedFile = await compressImage(file);
    const form = new FormData();
    form.append("file", compressedFile);
    const res = await fetch("/api/upload", {
      method: "POST",
      body: form,
    });
    if (!res.ok) throw new Error("Yükleme başarısız");
    const data = await res.json();
    return data.url;
  }

  // --- immediate upload for create mode ---
  async function handleImageUpload(index: number, file: File, collageIndex?: number) {
    try {
      const url = await uploadFile(file);
      if (collageIndex !== undefined) {
        const updated = [...slides];
        const urls = [...(updated[index].collageUrls ?? ["", "", ""])];
        urls[collageIndex] = url;
        updated[index] = { ...updated[index], collageUrls: urls };
        setSlides(updated);
      } else {
        updateSlide(index, { imageUrl: url });
      }
    } catch {
      alert("Fotoğraf yüklenirken hata oluştu");
    }
  }

  // --- save ---
  async function handleSave() {
    const normalizedSlug = slug.trim().toLowerCase();
    const normalizedTitle = title.trim();
    const normalizedRecipientName = recipientName.trim();

    if (isNewSite) {
      if (normalizedTitle.length < 2) {
        alert("Site başlığı en az 2 karakter olmalı");
        return;
      }
      if (normalizedRecipientName.length < 1) {
        alert("Alıcı adı boş olamaz");
        return;
      }
      if (normalizedSlug.length < 3) {
        alert("URL en az 3 karakter olmalı");
        return;
      }
      if (!SLUG_REGEX.test(normalizedSlug)) {
        alert("URL sadece küçük harf, rakam ve tire (-) içerebilir");
        return;
      }
      if (slugAvailable === false) {
        alert("Bu URL zaten kullanılıyor");
        return;
      }
    }

    if (isPrivate && (!password || password.length < 4)) {
      alert("Şifre en az 4 karakter olmalı");
      return;
    }

    if (isPrivate && password && password !== confirmPassword) {
      alert("Şifreler eşleşmiyor");
      return;
    }

    const missingRequiredHeading = slides.find(
      (slide) => HEADING_REQUIRED_TYPES.has(slide.type) && slide.heading.trim().length === 0
    );
    if (missingRequiredHeading) {
      alert(`${SLIDE_TYPE_LABELS[missingRequiredHeading.type]} slide'ı için başlık zorunlu`);
      return;
    }

    setSaving(true);
    try {
      // process slides for saving
      const processedSlides = await Promise.all(
        slides.map(async (s) => {
          let imageUrl = s.imageUrl ?? "";
          if (s.imageFile) imageUrl = await uploadFile(s.imageFile);
          let collageUrls = s.collageUrls ?? ["", "", ""];
          if (s.collageFiles) {
            collageUrls = await Promise.all(
              s.collageFiles.map(async (f, ci) => {
                if (f) return uploadFile(f);
                return collageUrls[ci] ?? "";
              })
            );
          }
          return {
            order: s.order,
            type: s.type,
            heading: s.heading,
            description: s.description,
            gradient: s.gradient,
            imageUrl,
            collageUrls,
            handPointerText: s.handPointerText,
          };
        })
      );

      if (isNewSite) {
        // --- CREATE ---
        const body = {
          title: normalizedTitle,
          recipientName: normalizedRecipientName,
          slug: normalizedSlug,
          slides: processedSlides,
          musicId: selectedMusicId,
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
        if (!res.ok) {
          const validationMessage = getValidationMessage(data.details);
          throw new Error(validationMessage ?? data.error ?? "Bir hata oluştu");
        }
        router.push(`/dashboard?created=${data.site.slug}`);
      } else {
        // --- EDIT ---
        const body: Record<string, unknown> = {
          id: siteId,
          slug,
          title,
          recipientName,
          slides: processedSlides,
          musicId: selectedMusicId,
          isPrivate,
        };
        if (password) body.password = password;

        const res = await fetch("/api/sites", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error ?? "Kaydetme başarısız");
        }
        alert("Site güncellendi ✅");
        router.push("/dashboard");
      }
    } catch (e: unknown) {
      alert((e as Error).message ?? "Hata oluştu");
    } finally {
      setSaving(false);
    }
  }

  // --- preview data ---
  const previewSlides = slides.map((s) => ({
    order: s.order,
    type: s.type,
    heading: s.heading,
    description: s.description,
    gradient: s.gradient,
    imageUrl: s.imageFile ? URL.createObjectURL(s.imageFile) : s.imageUrl,
    collageUrls: s.collageFiles?.map((f, ci) =>
      f ? URL.createObjectURL(f) : (s.collageUrls?.[ci] ?? "")
    ) ?? s.collageUrls,
    handPointerText: s.handPointerText,
  }));
  const selectedTrack = musicTracks.find((t) => t.id === selectedMusicId) ?? null;

  // music tracks filtered by category (create mode uses category filter)
  const filteredMusicTracks = selectedCategory === "all"
    ? musicTracks
    : musicTracks.filter((t) => t.category === selectedCategory);
  const normalizedCreateSlug = slug.trim().toLowerCase();
  const isCreateReady =
    title.trim().length >= 2 &&
    recipientName.trim().length >= 1 &&
    normalizedCreateSlug.length >= 3 &&
    SLUG_REGEX.test(normalizedCreateSlug) &&
    slugAvailable !== false &&
    slides.every((slide) => !HEADING_REQUIRED_TYPES.has(slide.type) || slide.heading.trim().length > 0) &&
    (!isPrivate || (password.length >= 4 && password === confirmPassword));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Full-screen preview overlay (mobile + desktop preview button)
  if (showPreview) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black">
        <button
          onClick={() => setShowPreview(false)}
          className="fixed top-4 right-4 z-[10000] bg-white/90 backdrop-blur-sm text-black px-4 py-2 rounded-lg shadow-lg font-semibold hover:bg-white transition-colors"
        >
          ← Editöre Dön
        </button>
        <TemplateView
          recipientName={recipientName || "İsim"}
          slides={previewSlides}
          musicTrack={selectedTrack}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-card border-b border-border shadow-sm">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Geri</span>
            </button>
            <div className="h-5 w-px bg-border" />
            <h1 className="text-lg font-semibold text-foreground">
              {isNewSite ? "Yeni Site Oluştur" : "Siteyi Düzenle"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {/* Mobile preview button */}
            <button
              onClick={() => setShowPreview(true)}
              className="lg:hidden flex items-center gap-2 bg-muted text-muted-foreground px-3 py-2 rounded-lg hover:bg-border transition-colors"
            >
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">Önizleme</span>
            </button>
            <button
              onClick={handleSave}
              disabled={saving || (!isNewSite && editExpired) || (isNewSite && !isCreateReady)}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2 rounded-lg hover:bg-accent disabled:opacity-50 transition-colors font-medium"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {!isNewSite && editExpired ? "Süre Doldu" : isNewSite ? "Oluştur" : "Kaydet"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: Split Screen */}
      <div className="max-w-[1440px] mx-auto flex">
        {/* Left: Form Panel */}
        <div className="w-full lg:w-[55%] p-4 lg:p-6 space-y-6 overflow-y-auto">
          {/* Template info banner */}
          {isNewSite && templateParam && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-5 py-4 rounded-xl flex items-start gap-3">
              <Sparkles className="h-5 w-5 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">Şablondan oluşturuluyor</p>
                <p className="text-sm mt-1">
                  Seçtiğiniz şablona göre alanlar önceden doldurulmuş olabilir. İstediğiniz gibi düzenleyebilirsiniz.
                </p>
              </div>
            </div>
          )}

          {/* Edit mode alerts */}
          {!isNewSite && editExpired && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl flex items-start gap-3">
              <Info className="h-5 w-5 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">Düzenleme süresi doldu</p>
                <p className="text-sm mt-1">
                  Site oluşturulduktan sonra sadece 1 hafta içinde düzenlenebilir. Artık bu siteyi güncelleyemezsiniz.
                </p>
              </div>
            </div>
          )}
          {!isNewSite && !editExpired && daysRemaining <= 3 && daysRemaining > 0 && (
            <div className="bg-amber-50 border border-amber-200 text-amber-700 px-5 py-4 rounded-xl flex items-start gap-3">
              <Info className="h-5 w-5 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">Düzenleme süreniz yakında doluyor</p>
                <p className="text-sm mt-1">
                  Bu siteyi düzenleyebilmeniz için {daysRemaining} gün kaldı. Değişiklikleri en kısa sürede kaydetmeyi unutmayın.
                </p>
              </div>
            </div>
          )}

          {/* Genel Bilgiler */}
          <section className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              Genel Bilgiler
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  {isNewSite ? "Site URL'si" : "Slug (URL)"}
                </label>
                {isNewSite ? (
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground whitespace-nowrap">ozelbirani.com/</span>
                      <input
                        value={slug}
                        onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                        placeholder="ahmet-ayse"
                        className="flex-1 bg-muted border border-border rounded-lg px-3 py-2.5 text-foreground focus:border-primary focus:ring-2 focus:ring-ring/20 outline-none transition-all"
                      />
                    </div>
                    {slug.length >= 3 && slugAvailable !== null && (
                      <p className={`text-xs mt-1.5 flex items-center gap-1 ${slugAvailable ? "text-green-600" : "text-red-600"}`}>
                        {slugAvailable ? (
                          <><CheckCircle2 className="h-3.5 w-3.5" /> Bu URL kullanılabilir</>
                        ) : (
                          <><XCircle className="h-3.5 w-3.5" /> Bu URL zaten kullanılıyor</>
                        )}
                      </p>
                    )}
                  </div>
                ) : (
                  <input
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-foreground focus:border-primary focus:ring-2 focus:ring-ring/20 outline-none transition-all"
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Site Başlığı</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={isNewSite ? "Örn: Sevgililer Günü Sürprizi" : ""}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-foreground focus:border-primary focus:ring-2 focus:ring-ring/20 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Alıcı Adı</label>
                <input
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder={isNewSite ? "Örn: Gözde" : ""}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-foreground focus:border-primary focus:ring-2 focus:ring-ring/20 outline-none transition-all"
                />
              </div>
            </div>

            {/* Gizlilik */}
            <div className="mt-5 p-4 bg-muted rounded-xl border border-border">
              <div className="flex items-center gap-3 mb-3">
                <button
                  onClick={() => setIsPrivate(!isPrivate)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isPrivate
                      ? "bg-amber-100 text-amber-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {isPrivate ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                  {isPrivate ? "Şifreli Site" : "Herkese Açık"}
                </button>
              </div>
              {isPrivate && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="password"
                    placeholder={isNewSite ? "Şifre (en az 4 karakter)" : "Yeni şifre (değiştirmek için)"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-card border border-border rounded-lg px-3 py-2.5 text-foreground focus:border-primary focus:ring-2 focus:ring-ring/20 outline-none transition-all"
                  />
                  <input
                    type="password"
                    placeholder="Şifre tekrar"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-card border border-border rounded-lg px-3 py-2.5 text-foreground focus:border-primary focus:ring-2 focus:ring-ring/20 outline-none transition-all"
                  />
                  {password && confirmPassword && password !== confirmPassword && (
                    <p className="text-xs text-red-600 md:col-span-2">Şifreler eşleşmiyor</p>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Müzik */}
          <section className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Music className="h-5 w-5 text-primary" /> Müzik
            </h2>

            {/* Category filter pills */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  selectedCategory === "all"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-border"
                }`}
              >
                Tümü
              </button>
              {MUSIC_CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    selectedCategory === cat.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-border"
                  }`}
                >
                  {cat.emoji} {cat.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                onClick={() => setSelectedMusicId(null)}
                className={`p-3 rounded-lg border text-left text-sm transition-all ${
                  !selectedMusicId
                    ? "border-primary bg-primary-light text-foreground font-medium"
                    : "border-border bg-muted text-muted-foreground hover:border-primary/40"
                }`}
              >
                Müzik Yok
              </button>
              {selectedCategory === "all" ? (
                // Group by category
                MUSIC_CATEGORIES.map((cat) => {
                  const catTracks = musicTracks.filter((t) => t.category === cat.value);
                  if (catTracks.length === 0) return null;
                  return (
                    <div key={cat.value}>
                      <p className="text-xs font-semibold text-muted-foreground mb-1.5">
                        {cat.emoji} {cat.label}
                      </p>
                      {catTracks.map((track) => (
                        <button
                          key={track.id}
                          onClick={() => setSelectedMusicId(track.id)}
                          className={`w-full p-3 rounded-lg border text-left text-sm mb-1.5 transition-all ${
                            selectedMusicId === track.id
                              ? "border-primary bg-primary-light text-foreground font-medium"
                              : "border-border bg-muted text-muted-foreground hover:border-primary/40"
                          }`}
                        >
                          {track.title} — {track.artist}
                        </button>
                      ))}
                    </div>
                  );
                })
              ) : (
                // Flat list for filtered category
                filteredMusicTracks.map((track) => (
                  <button
                    key={track.id}
                    onClick={() => setSelectedMusicId(track.id)}
                    className={`p-3 rounded-lg border text-left text-sm transition-all ${
                      selectedMusicId === track.id
                        ? "border-primary bg-primary-light text-foreground font-medium"
                        : "border-border bg-muted text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    {track.title} — {track.artist}
                  </button>
                ))
              )}
            </div>
          </section>

          {/* Slide'lar */}
          <section className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" />
                Slide&apos;lar ({slides.length}/12)
              </h2>
            </div>

            {/* Add slide buttons */}
            {slides.length < 12 && (
              <div className="grid grid-cols-3 gap-3 mb-5">
                <button
                  onClick={() => addSlide("photo")}
                  className="flex flex-col items-center gap-1.5 p-4 border-2 border-dashed border-border rounded-xl hover:border-primary hover:bg-primary-light/30 transition-all text-muted-foreground hover:text-primary"
                >
                  <ImageIcon className="h-5 w-5" />
                  <span className="text-xs font-medium">Fotoğraf</span>
                </button>
                <button
                  onClick={() => addSlide("collage")}
                  className="flex flex-col items-center gap-1.5 p-4 border-2 border-dashed border-border rounded-xl hover:border-primary hover:bg-primary-light/30 transition-all text-muted-foreground hover:text-primary"
                >
                  <Layout className="h-5 w-5" />
                  <span className="text-xs font-medium">Kolaj</span>
                </button>
                <button
                  onClick={() => addSlide("text")}
                  className="flex flex-col items-center gap-1.5 p-4 border-2 border-dashed border-border rounded-xl hover:border-primary hover:bg-primary-light/30 transition-all text-muted-foreground hover:text-primary"
                >
                  <Type className="h-5 w-5" />
                  <span className="text-xs font-medium">Metin</span>
                </button>
              </div>
            )}

            <div className="space-y-4">
              {slides.map((slide, i) => (
                <div
                  key={i}
                  className={`bg-card border border-border rounded-xl p-4 shadow-sm border-l-4 ${SLIDE_TYPE_COLORS[slide.type]}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-semibold text-foreground">
                        #{slide.order} — {SLIDE_TYPE_LABELS[slide.type]}
                      </span>
                    </div>
                    {slide.type !== "cover" && slide.type !== "finale" && slides.length > 3 && (
                      <button
                        onClick={() => removeSlide(i)}
                        className="text-red-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Başlık</label>
                      <input
                        value={slide.heading}
                        onChange={(e) => updateSlide(i, { heading: e.target.value })}
                        className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-ring/20 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Açıklama</label>
                      <input
                        value={slide.description}
                        onChange={(e) => updateSlide(i, { description: e.target.value })}
                        className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-ring/20 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Gradient seçimi */}
                  <div className="mt-3">
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Arka Plan Rengi</label>
                    <div className="flex gap-2 flex-wrap">
                      {GRADIENT_PRESETS.map((g, gi) => (
                        <button
                          key={gi}
                          onClick={() => updateSlide(i, { gradient: g.gradient })}
                          className={`w-10 h-10 rounded-full transition-all ${
                            slide.gradient.from === g.gradient.from
                              ? "ring-2 ring-primary ring-offset-2 scale-110"
                              : "hover:scale-105"
                          }`}
                          style={{
                            background: `linear-gradient(135deg, ${g.gradient.from}, ${g.gradient.to})`,
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Photo slide */}
                  {slide.type === "photo" && (
                    <div className="mt-3">
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Fotoğraf</label>
                      {slide.imageUrl && !slide.imageFile && (
                        <img src={slide.imageUrl} alt="" className="w-20 h-20 object-cover rounded-lg mb-2" />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (isNewSite) {
                            handleImageUpload(i, file);
                          } else {
                            updateSlide(i, { imageFile: file });
                          }
                        }}
                        className="text-sm text-muted-foreground"
                      />
                    </div>
                  )}

                  {/* Collage slide */}
                  {slide.type === "collage" && (
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {[0, 1, 2].map((ci) => (
                        <div key={ci}>
                          <label className="block text-xs font-medium text-muted-foreground mb-1">Foto {ci + 1}</label>
                          {slide.collageUrls?.[ci] && !slide.collageFiles?.[ci] && (
                            <img src={slide.collageUrls[ci]} alt="" className="w-16 h-16 object-cover rounded mb-1" />
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              if (isNewSite) {
                                handleImageUpload(i, file, ci);
                              } else {
                                const files = [...(slide.collageFiles ?? [null, null, null])];
                                files[ci] = file;
                                updateSlide(i, { collageFiles: files as [File | null, File | null, File | null] });
                              }
                            }}
                            className="text-xs w-full text-muted-foreground"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Finale */}
                  {slide.type === "finale" && (
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">Fotoğraf</label>
                        {slide.imageUrl && !slide.imageFile && (
                          <img src={slide.imageUrl} alt="" className="w-20 h-20 object-cover rounded-lg mb-2" />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            if (isNewSite) {
                              handleImageUpload(i, file);
                            } else {
                              updateSlide(i, { imageFile: file });
                            }
                          }}
                          className="text-sm text-muted-foreground"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">El İşareti Metni</label>
                        <input
                          value={slide.handPointerText}
                          onChange={(e) => updateSlide(i, { handPointerText: e.target.value })}
                          className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-ring/20 outline-none transition-all"
                          placeholder="👈 En güzel kare!"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Create mode info note */}
          {isNewSite && (
            <p className="text-xs text-muted-foreground px-1">
              Site &quot;Taslak&quot; olarak kaydedilecek. Dashboard&apos;dan Yayınla butonuyla canlıya alabilirsiniz.
            </p>
          )}
        </div>

        {/* Right: Live Preview Panel (Desktop only) */}
        <div className="hidden lg:block lg:w-[45%] border-l border-border">
          <div className="sticky top-16 h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-6 bg-muted/50">
            <div className="flex items-center gap-2 mb-4 text-muted-foreground">
              <Monitor className="h-4 w-4" />
              <span className="text-sm font-medium">Önizleme</span>
            </div>
            {/* Phone mockup frame */}
            <div className="relative w-[320px] h-[580px] bg-card border-2 border-border rounded-[2.5rem] shadow-lg overflow-hidden">
              {/* Phone notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-border rounded-b-2xl z-10" />
              {/* Preview content */}
              <div className="w-full h-full overflow-hidden">
                {slides.length > 0 ? (
                  <TemplateView
                    recipientName={recipientName || "İsim"}
                    slides={previewSlides}
                    musicTrack={selectedTrack}
                    embedded
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground px-6 text-center">
                    <Sparkles className="h-8 w-8 mb-3 opacity-40" />
                    <p className="text-sm">Slide ekledikçe önizleme burada görünecek</p>
                  </div>
                )}
              </div>
            </div>
            {/* Full preview button */}
            <button
              onClick={() => setShowPreview(true)}
              className="mt-4 flex items-center gap-2 text-sm text-primary hover:text-accent font-medium transition-colors"
            >
              <Eye className="h-4 w-4" />
              Tam Ekran Önizleme
            </button>
          </div>
        </div>
      </div>

      {/* Mobile floating preview button */}
      <button
        onClick={() => setShowPreview(true)}
        className="lg:hidden fixed bottom-6 right-6 z-30 bg-primary text-primary-foreground w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:bg-accent transition-colors"
      >
        <Eye className="h-5 w-5" />
      </button>
    </div>
  );
}
