"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import imageCompression from "browser-image-compression";
import { useForm } from "react-hook-form";
import {
  ArrowLeft,
  Save,
  Loader2,
  Eye,
  Image as ImageIcon,
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
import type { SlideData, SlideFormData, MusicTrack } from "@/lib/types";
import { GRADIENT_PRESETS, MUSIC_CATEGORIES, siteRowToData } from "@/lib/types";
import { TEMPLATES, type TemplateEditorFieldId } from "@/lib/templates";
import TemplateView from "@/components/template/TemplateView";

const DEFAULT_TEMPLATE_ID = "valentines";

type TemplateFormValues = {
  coverImageUrl: string;
  mainTitle: string;
  paragraph: string;
  musicId: string;
};

const TEMPLATE_FIELD_TO_FORM_KEY: Record<TemplateEditorFieldId, keyof TemplateFormValues> = {
  coverImage: "coverImageUrl",
  mainTitle: "mainTitle",
  paragraph: "paragraph",
  musicId: "musicId",
};

const REQUIRED_FIELD_MESSAGES: Record<TemplateEditorFieldId, string> = {
  coverImage: "Kapak fotoğrafı zorunlu.",
  mainTitle: "Ana başlık zorunlu.",
  paragraph: "Paragraf zorunlu.",
  musicId: "Bir müzik seçmelisiniz.",
};

function normalizeTemplateId(candidate: string | null | undefined): string {
  if (!candidate) return DEFAULT_TEMPLATE_ID;
  return TEMPLATES.some((template) => template.id === candidate) ? candidate : DEFAULT_TEMPLATE_ID;
}

function extractTemplateValues(slides: SlideData[]): Omit<TemplateFormValues, "musicId"> {
  const firstImageSlide = slides.find((slide) => slide.imageUrl && slide.imageUrl.length > 0);
  const firstHeadingSlide = slides.find((slide) => slide.heading && slide.heading.length > 0);
  const firstDescriptionSlide = slides.find((slide) => slide.description && slide.description.length > 0);

  return {
    coverImageUrl: firstImageSlide?.imageUrl ?? "",
    mainTitle: firstHeadingSlide?.heading ?? "",
    paragraph: firstDescriptionSlide?.description ?? "",
  };
}

function mapTemplateToSlides(
  templateId: string,
  values: Omit<TemplateFormValues, "musicId">
): SlideFormData[] {
  const normalizedValues = {
    coverImageUrl: values.coverImageUrl,
    mainTitle: values.mainTitle.trim(),
    paragraph: values.paragraph.trim(),
  };

  switch (templateId) {
    case "valentines":
    default:
      return [
        {
          order: 1,
          type: "cover",
          heading: normalizedValues.mainTitle,
          description: normalizedValues.paragraph,
          gradient: GRADIENT_PRESETS[0].gradient,
          imageUrl: normalizedValues.coverImageUrl,
          imageFile: null,
          collageFiles: [null, null, null],
          collageUrls: ["", "", ""],
          handPointerText: "",
        },
        {
          order: 2,
          type: "photo",
          heading: normalizedValues.mainTitle,
          description: normalizedValues.paragraph,
          gradient: GRADIENT_PRESETS[1].gradient,
          imageUrl: normalizedValues.coverImageUrl,
          imageFile: null,
          collageFiles: [null, null, null],
          collageUrls: ["", "", ""],
          handPointerText: "",
        },
        {
          order: 3,
          type: "text",
          heading: normalizedValues.mainTitle,
          description: normalizedValues.paragraph,
          gradient: GRADIENT_PRESETS[4].gradient,
          imageFile: null,
          collageFiles: [null, null, null],
          collageUrls: ["", "", ""],
          handPointerText: "",
        },
        {
          order: 4,
          type: "finale",
          heading: normalizedValues.mainTitle,
          description: normalizedValues.paragraph,
          gradient: GRADIENT_PRESETS[8].gradient,
          imageUrl: normalizedValues.coverImageUrl,
          imageFile: null,
          collageFiles: [null, null, null],
          collageUrls: ["", "", ""],
          handPointerText: "👈 En güzel kare!",
        },
      ];
  }
}

export default function EditSitePage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const siteId = params.siteId as string;
  const isNewSite = siteId === "new";
  const templateParam = isNewSite ? normalizeTemplateId(searchParams.get("template")) : null;

  const [loading, setLoading] = useState(!isNewSite);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editExpired, setEditExpired] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState<number>(0);
  const [templateId, setTemplateId] = useState(templateParam ?? DEFAULT_TEMPLATE_ID);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreviewUrl, setCoverImagePreviewUrl] = useState("");

  // --- form state ---
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [musicTracks, setMusicTracks] = useState<MusicTrack[]>([]);

  // --- create mode: slug availability ---
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const {
    register,
    watch,
    setValue,
    trigger,
    clearErrors,
    formState: { errors },
  } = useForm<TemplateFormValues>({
    defaultValues: {
      coverImageUrl: "",
      mainTitle: "",
      paragraph: "",
      musicId: "",
    },
  });

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

  const template = useMemo(
    () => TEMPLATES.find((item) => item.id === templateId) ?? TEMPLATES[0],
    [templateId]
  );
  const templateFields = useMemo(() => {
    if (template?.editorFields?.length) return template.editorFields;
    return TEMPLATES.find((item) => item.id === DEFAULT_TEMPLATE_ID)?.editorFields ?? [];
  }, [template]);
  const requiredFieldIds = useMemo(
    () => new Set(templateFields.filter((field) => field.required).map((field) => field.id)),
    [templateFields]
  );
  const requiredValidationFields = useMemo<(keyof TemplateFormValues)[]>(
    () =>
      templateFields
        .filter((field) => field.required)
        .map((field) => TEMPLATE_FIELD_TO_FORM_KEY[field.id]),
    [templateFields]
  );
  const coverImageRequired = requiredFieldIds.has("coverImage");
  const mainTitleRequired = requiredFieldIds.has("mainTitle");
  const paragraphRequired = requiredFieldIds.has("paragraph");
  const musicRequired = requiredFieldIds.has("musicId");
  const mainTitleValue = watch("mainTitle");
  const paragraphValue = watch("paragraph");
  const coverImageUrlValue = watch("coverImageUrl");
  const selectedMusicId = watch("musicId");

  useEffect(() => {
    if (!isNewSite || !templateParam) return;
    setTemplateId(templateParam);
  }, [isNewSite, templateParam]);

  useEffect(() => {
    if (!coverImageFile) {
      setCoverImagePreviewUrl("");
      return;
    }

    const url = URL.createObjectURL(coverImageFile);
    setCoverImagePreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [coverImageFile]);

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
        const s = siteRowToData(raw);
        const templateValues = extractTemplateValues(s.slides);
        setSlug(s.slug);
        setTitle(s.title);
        setRecipientName(s.recipientName);
        setIsPrivate(s.isPrivate);
        setTemplateId(normalizeTemplateId(s.templateId));
        setValue("coverImageUrl", templateValues.coverImageUrl);
        setValue("mainTitle", templateValues.mainTitle);
        setValue("paragraph", templateValues.paragraph);
        setValue("musicId", s.musicId ?? "");

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

  // --- save ---
  async function handleSave() {
    if (isPrivate && password && password !== confirmPassword) {
      alert("Şifreler eşleşmiyor");
      return;
    }
    setSaving(true);
    try {
      const isTemplateValid =
        requiredValidationFields.length > 0
          ? await trigger(requiredValidationFields)
          : true;
      if (!isTemplateValid) {
        setSaving(false);
        return;
      }

      const uploadedCoverImage =
        coverImageFile ? await uploadFile(coverImageFile) : coverImageUrlValue;

      const processedSlides = mapTemplateToSlides(templateId, {
        coverImageUrl: uploadedCoverImage,
        mainTitle: mainTitleValue,
        paragraph: paragraphValue,
      });

      if (isNewSite) {
        // --- CREATE ---
        const body = {
          title,
          recipientName,
          slug,
          templateId,
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
        if (!res.ok) throw new Error(data.error ?? "Bir hata oluştu");
        router.push(`/dashboard?created=${data.site.slug}`);
      } else {
        // --- EDIT ---
        const body: Record<string, unknown> = {
          id: siteId,
          slug,
          title,
          recipientName,
          templateId,
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
  const previewSlides = mapTemplateToSlides(templateId, {
    coverImageUrl: coverImagePreviewUrl || coverImageUrlValue,
    mainTitle: mainTitleValue,
    paragraph: paragraphValue,
  });
  const selectedTrack = musicTracks.find((t) => t.id === selectedMusicId) ?? null;

  // music tracks filtered by category (create mode uses category filter)
  const filteredMusicTracks = selectedCategory === "all"
    ? musicTracks
    : musicTracks.filter((t) => t.category === selectedCategory);
  const contentFields = templateFields.filter((field) => field.id !== "musicId");
  const coverImageProvided = Boolean(coverImageFile || coverImageUrlValue);
  const hasMissingRequiredTemplateField =
    (coverImageRequired && !coverImageProvided) ||
    (mainTitleRequired && !mainTitleValue.trim()) ||
    (paragraphRequired && !paragraphValue.trim()) ||
    (musicRequired && !selectedMusicId);
  const saveDisabled =
    saving ||
    (!isNewSite && editExpired) ||
    !title.trim() ||
    !recipientName.trim() ||
    !slug.trim() ||
    hasMissingRequiredTemplateField;

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
              disabled={saveDisabled}
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
          {isNewSite && template && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-5 py-4 rounded-xl flex items-start gap-3">
              <Sparkles className="h-5 w-5 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">Şablondan oluşturuluyor</p>
                <p className="text-sm mt-1">
                  <span className="font-medium">{template.name}</span> şablonu için sabit alanlar gösteriliyor.
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
              <input
                type="hidden"
                {...register("musicId", {
                  required: musicRequired ? REQUIRED_FIELD_MESSAGES.musicId : false,
                })}
              />
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
                          onClick={() =>
                            setValue("musicId", track.id, { shouldDirty: true, shouldValidate: true })
                          }
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
                    onClick={() =>
                      setValue("musicId", track.id, { shouldDirty: true, shouldValidate: true })
                    }
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
            {errors.musicId && (
              <p className="text-xs text-red-600 mt-2">{errors.musicId.message}</p>
            )}
          </section>

          {/* Şablon Alanları */}
          <section className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" />
                Şablon Alanları
              </h2>
              <span className="text-xs text-muted-foreground">{template?.name}</span>
            </div>
            <div className="space-y-5">
              {contentFields.map((field) => {
                if (field.id === "coverImage") {
                  return (
                    <div key={field.id}>
                      <label className="block text-sm font-medium text-foreground mb-1.5">
                        {field.label}
                      </label>
                      {field.helperText && (
                        <p className="text-xs text-muted-foreground mb-2">{field.helperText}</p>
                      )}
                      {(coverImagePreviewUrl || coverImageUrlValue) && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={coverImagePreviewUrl || coverImageUrlValue}
                          alt="Kapak önizleme"
                          className="w-28 h-28 object-cover rounded-lg mb-2 border border-border"
                        />
                      )}
                      <div className="flex items-center gap-3">
                        <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-muted border border-border text-sm cursor-pointer hover:border-primary/40 transition-colors">
                          <ImageIcon className="h-4 w-4" />
                          Fotoğraf Seç
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(event) => {
                              const file = event.target.files?.[0] ?? null;
                              setCoverImageFile(file);
                              if (file) clearErrors("coverImageUrl");
                            }}
                          />
                        </label>
                        {coverImageUrlValue && (
                          <button
                            type="button"
                            onClick={() => {
                              setCoverImageFile(null);
                              setValue("coverImageUrl", "", { shouldDirty: true, shouldValidate: true });
                            }}
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                          >
                            Mevcut görseli kaldır
                          </button>
                        )}
                      </div>
                      <input
                        type="hidden"
                        {...register("coverImageUrl", {
                          validate: (value) =>
                            !coverImageRequired ||
                            Boolean(value || coverImageFile) ||
                            REQUIRED_FIELD_MESSAGES.coverImage,
                        })}
                      />
                      {errors.coverImageUrl && (
                        <p className="text-xs text-red-600 mt-1.5">{errors.coverImageUrl.message}</p>
                      )}
                    </div>
                  );
                }

                if (field.id === "mainTitle") {
                  return (
                    <div key={field.id}>
                      <label className="block text-sm font-medium text-foreground mb-1.5">
                        {field.label}
                      </label>
                      <input
                        {...register("mainTitle", {
                          required: mainTitleRequired ? REQUIRED_FIELD_MESSAGES.mainTitle : false,
                        })}
                        placeholder={field.placeholder}
                        className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-foreground focus:border-primary focus:ring-2 focus:ring-ring/20 outline-none transition-all"
                      />
                      {errors.mainTitle && (
                        <p className="text-xs text-red-600 mt-1.5">{errors.mainTitle.message}</p>
                      )}
                    </div>
                  );
                }

                if (field.id === "paragraph") {
                  return (
                    <div key={field.id}>
                      <label className="block text-sm font-medium text-foreground mb-1.5">
                        {field.label}
                      </label>
                      <textarea
                        {...register("paragraph", {
                          required: paragraphRequired ? REQUIRED_FIELD_MESSAGES.paragraph : false,
                        })}
                        rows={5}
                        placeholder={field.placeholder}
                        className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-foreground focus:border-primary focus:ring-2 focus:ring-ring/20 outline-none transition-all resize-y"
                      />
                      {errors.paragraph && (
                        <p className="text-xs text-red-600 mt-1.5">{errors.paragraph.message}</p>
                      )}
                    </div>
                  );
                }

                return null;
              })}
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
                {previewSlides.length > 0 ? (
                  <TemplateView
                    recipientName={recipientName || "İsim"}
                    slides={previewSlides}
                    musicTrack={selectedTrack}
                    embedded
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground px-6 text-center">
                    <Sparkles className="h-8 w-8 mb-3 opacity-40" />
                    <p className="text-sm">Şablon alanları dolduruldukça önizleme burada görünecek</p>
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
