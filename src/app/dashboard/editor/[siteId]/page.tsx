"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Loader2,
  Plus,
  Trash2,
  GripVertical,
  Eye,
  Image as ImageIcon,
  Type,
  Layout,
  Lock,
  Unlock,
  Music,
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

export default function EditSitePage() {
  const router = useRouter();
  const params = useParams();
  const siteId = params.siteId as string;

  const [loading, setLoading] = useState(true);
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
  const [slides, setSlides] = useState<SlideFormData[]>([]);
  const [selectedMusicId, setSelectedMusicId] = useState<string | null>(null);
  const [musicTracks, setMusicTracks] = useState<MusicTrack[]>([]);

  // fetch site data on mount
  useEffect(() => {
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
    // also fetch music
    fetch("/api/music")
      .then((r) => r.json())
      .then((d) => setMusicTracks(d.tracks ?? []))
      .catch(() => { });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteId]);

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
  async function uploadFile(file: File): Promise<string> {
    const form = new FormData();
    form.append("file", file);
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
      // upload new images
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

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
          recipientName={recipientName}
          slides={previewSlides}
          musicTrack={selectedTrack}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => router.push("/dashboard")} className="flex items-center gap-2 text-zinc-400 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Geri
        </button>
        <div className="flex gap-3">
          <button onClick={() => setShowPreview(true)} className="flex items-center gap-2 bg-zinc-800 text-zinc-300 px-4 py-2 rounded-lg hover:bg-zinc-700">
            <Eye className="h-4 w-4" /> Önizleme
          </button>
          <button onClick={handleSave} disabled={saving || editExpired} className="flex items-center gap-2 bg-white text-zinc-900 px-6 py-2 rounded-lg hover:bg-zinc-100 disabled:opacity-50">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {editExpired ? "Düzenleme Süresi Doldu" : "Kaydet"}
          </button>
        </div>
      </div>

      <h1 className="text-2xl font-bold mb-6 text-white">Siteyi Düzenle</h1>

      {/* Düzenleme süresi uyarısı */}
      {editExpired && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
          <p className="font-semibold">⚠️ Düzenleme süresi doldu</p>
          <p className="text-sm mt-1">
            Site oluşturulduktan sonra sadece 1 hafta içinde düzenlenebilir. Artık bu siteyi güncelleyemezsiniz.
          </p>
        </div>
      )}
      {!editExpired && daysRemaining <= 3 && daysRemaining > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-6">
          <p className="font-semibold">⏰ Düzenleme süreniz yakında doluyor</p>
          <p className="text-sm mt-1">
            Bu siteyi düzenleyebilmeniz için {daysRemaining} gün kaldı. Değişiklikleri en kısa sürede kaydetmeyi unutmayın.
          </p>
        </div>
      )}

      {/* Genel Bilgiler */}
      <section className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 text-white">Genel Bilgiler</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Slug (URL)</label>
            <input value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Site Başlığı</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Alıcı Adı</label>
            <input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
          </div>
        </div>

        {/* Gizlilik */}
        <div className="mt-4 p-4 bg-zinc-800 rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <button onClick={() => setIsPrivate(!isPrivate)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${isPrivate ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>
              {isPrivate ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
              {isPrivate ? "Şifreli Site" : "Herkese Açık"}
            </button>
          </div>
          {isPrivate && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input type="password" placeholder="Yeni şifre (değiştirmek için)" value={password} onChange={(e) => setPassword(e.target.value)} className="border rounded-lg px-3 py-2" />
              <input type="password" placeholder="Şifre tekrar" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="border rounded-lg px-3 py-2" />
            </div>
          )}
        </div>
      </section>

      {/* Müzik */}
      <section className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
          <Music className="h-5 w-5" /> Müzik
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button onClick={() => setSelectedMusicId(null)} className={`p-3 rounded-lg border text-left text-sm ${!selectedMusicId ? "border-rose-500/40 bg-rose-500/10" : ""}`}>
            Müzik Yok
          </button>
          {MUSIC_CATEGORIES.map((cat) => (
            <div key={cat.value}>
              <p className="text-xs font-semibold text-zinc-500 mb-1">{cat.emoji} {cat.label}</p>
              {musicTracks.filter((t) => t.category === cat.value).map((track) => (
                <button key={track.id} onClick={() => setSelectedMusicId(track.id)} className={`w-full p-3 rounded-lg border text-left text-sm mb-1 ${selectedMusicId === track.id ? "border-rose-500/40 bg-rose-500/10" : ""}`}>
                  {track.title} — {track.artist}
                </button>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Slide'lar */}
      <section className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Slide&apos;lar ({slides.length}/12)</h2>
          {slides.length < 12 && (
            <div className="flex gap-2">
              <button onClick={() => addSlide("photo")} className="flex items-center gap-1 text-sm bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded-lg hover:bg-zinc-700">
                <ImageIcon className="h-3 w-3" /> Fotoğraf
              </button>
              <button onClick={() => addSlide("collage")} className="flex items-center gap-1 text-sm bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded-lg hover:bg-zinc-700">
                <Layout className="h-3 w-3" /> Kolaj
              </button>
              <button onClick={() => addSlide("text")} className="flex items-center gap-1 text-sm bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded-lg hover:bg-zinc-700">
                <Type className="h-3 w-3" /> Metin
              </button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {slides.map((slide, i) => (
            <div key={i} className="border rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-zinc-400" />
                  <span className="text-sm font-semibold">
                    #{slide.order} — {slide.type === "cover" ? "Kapak" : slide.type === "photo" ? "Fotoğraf" : slide.type === "collage" ? "Kolaj" : slide.type === "text" ? "Metin" : "Final"}
                  </span>
                </div>
                {slide.type !== "cover" && slide.type !== "finale" && slides.length > 3 && (
                  <button onClick={() => removeSlide(i)} className="text-red-500 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Başlık</label>
                  <input value={slide.heading} onChange={(e) => updateSlide(i, { heading: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Açıklama</label>
                  <input value={slide.description} onChange={(e) => updateSlide(i, { description: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>

              {/* Gradient seçimi */}
              <div className="mt-3">
                <label className="block text-xs font-medium mb-1">Arka Plan Rengi</label>
                <div className="flex gap-2 flex-wrap">
                  {GRADIENT_PRESETS.map((g, gi) => (
                    <button key={gi} onClick={() => updateSlide(i, { gradient: g.gradient })} className={`w-8 h-8 rounded-full border-2 ${slide.gradient.from === g.gradient.from ? "border-rose-500 scale-110" : "border-transparent"}`} style={{ background: `linear-gradient(135deg, ${g.gradient.from}, ${g.gradient.to})` }} />
                  ))}
                </div>
              </div>

              {/* Photo slide */}
              {slide.type === "photo" && (
                <div className="mt-3">
                  <label className="block text-xs font-medium mb-1">Fotoğraf</label>
                  {slide.imageUrl && !slide.imageFile && (
                    <img src={slide.imageUrl} alt="" className="w-20 h-20 object-cover rounded-lg mb-2" />
                  )}
                  <input type="file" accept="image/*" onChange={(e) => updateSlide(i, { imageFile: e.target.files?.[0] ?? null })} className="text-sm" />
                </div>
              )}

              {/* Collage slide */}
              {slide.type === "collage" && (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {[0, 1, 2].map((ci) => (
                    <div key={ci}>
                      <label className="block text-xs font-medium mb-1">Foto {ci + 1}</label>
                      {slide.collageUrls?.[ci] && !slide.collageFiles?.[ci] && (
                        <img src={slide.collageUrls[ci]} alt="" className="w-16 h-16 object-cover rounded mb-1" />
                      )}
                      <input type="file" accept="image/*" onChange={(e) => {
                        const files = [...(slide.collageFiles ?? [null, null, null])];
                        files[ci] = e.target.files?.[0] ?? null;
                        updateSlide(i, { collageFiles: files as [File | null, File | null, File | null] });
                      }} className="text-xs w-full" />
                    </div>
                  ))}
                </div>
              )}

              {/* Finale */}
              {slide.type === "finale" && (
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">Fotoğraf</label>
                    {slide.imageUrl && !slide.imageFile && (
                      <img src={slide.imageUrl} alt="" className="w-20 h-20 object-cover rounded-lg mb-2" />
                    )}
                    <input type="file" accept="image/*" onChange={(e) => updateSlide(i, { imageFile: e.target.files?.[0] ?? null })} className="text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">El İşareti Metni</label>
                    <input value={slide.handPointerText} onChange={(e) => updateSlide(i, { handPointerText: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="👈 En güzel kare!" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
