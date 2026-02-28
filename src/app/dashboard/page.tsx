"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Plus,
  Search,
  ExternalLink,
  Eye,
  Clock,
  Globe,
  Download,
  Pencil,
  Trash2,
  Gift,
  FolderOpen,
  Music,
  Sparkles,
  Upload,
  MessageCircle,
  Send,
} from "lucide-react";
import { MUSIC_CATEGORIES, type MusicTrack } from "@/lib/types";

interface SiteItem {
  id: string;
  slug: string;
  title: string;
  recipient_name: string;
  template_id: string;
  status: string;
  package_type: string;
  is_private: boolean;
  created_at: string;
  slides: { gradient?: { from: string; to: string }; imageUrl?: string }[];
}

type FilterType = "all" | "active" | "draft" | "archived";

type MockMusicMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

const AI_MUSIC_INSPIRATION_CHIPS = [
  "Lush Pads",
  "Catchy Hook",
  "Latin Brass",
  "Uplifting",
  "Lo-fi Beats",
  "Dreamy Reverb",
] as const;

const AI_MUSIC_CHAT_MOCK_MESSAGES: MockMusicMessage[] = [
  { id: "music-chat-1", role: "user", text: "Create a warm pop song for a birthday surprise." },
  { id: "music-chat-2", role: "assistant", text: "Great direction. I can blend acoustic guitar and soft piano with a bright chorus." },
  { id: "music-chat-3", role: "user", text: "Keep it uplifting and around two minutes." },
  { id: "music-chat-4", role: "assistant", text: "Perfect. I will keep the tempo upbeat and the arrangement compact for a short-form edit." },
];

function getTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);

  if (diffMin < 1) return "Az önce";
  if (diffMin < 60) return `${diffMin} dk önce`;
  if (diffHours < 24) return `${diffHours} saat önce`;
  if (diffDays < 7) return `${diffDays} gün önce`;
  if (diffWeeks < 4) return `${diffWeeks} hafta önce`;
  return date.toLocaleDateString("tr-TR");
}

function getTimeRemaining(createdAt: string, durationDays: number) {
  const created = new Date(createdAt);
  const now = new Date();
  const expiresAt = new Date(created.getTime() + durationDays * 24 * 60 * 60 * 1000);
  const diff = expiresAt.getTime() - now.getTime();

  if (diff <= 0) return { expired: true, text: "Süresi doldu", days: 0 };

  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));

  if (days > 30) return { expired: false, text: `${days} gün`, days };
  if (days > 0) return { expired: false, text: `${days}g ${hours}s`, days };
  return { expired: false, text: `${hours} saat`, days };
}

function DashboardPageContent() {
  const [sites, setSites] = useState<SiteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");
  const [musicTracks, setMusicTracks] = useState<MusicTrack[]>([]);
  const [musicLibraryCategory, setMusicLibraryCategory] = useState<string>("all");
  const [songDescription, setSongDescription] = useState("");
  const [includeAudio, setIncludeAudio] = useState(false);
  const [includeLyrics, setIncludeLyrics] = useState(false);
  const [instrumentalOnly, setInstrumentalOnly] = useState(false);
  const [selectedInspirationChips, setSelectedInspirationChips] = useState<string[]>([]);
  const [selectedMusicFileName, setSelectedMusicFileName] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentSuccess = searchParams.get("payment") === "success";

  useEffect(() => {
    fetch("/api/sites")
      .then((res) => res.json())
      .then((data) => {
        setSites(data.sites || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/music")
      .then((res) => res.json())
      .then((data) => setMusicTracks(data.tracks || []))
      .catch(() => setMusicTracks([]));
  }, []);

  useEffect(() => {
    if (!paymentSuccess) return;

    const timer = setTimeout(() => {
      router.replace("/dashboard", { scroll: false });
    }, 3500);

    return () => clearTimeout(timer);
  }, [paymentSuccess, router]);

  const handleDelete = async (siteId: string) => {
    if (!confirm("Bu siteyi silmek istediğinize emin misiniz?")) return;
    const res = await fetch(`/api/sites?siteId=${siteId}`, { method: "DELETE" });
    if (res.ok) setSites(sites.filter((s) => s.id !== siteId));
  };

  const filteredSites = sites.filter((site) => {
    if (filter === "active" && site.status !== "active") return false;
    if (filter === "draft" && site.status !== "draft") return false;
    if (filter === "archived" && site.status !== "expired") return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        site.title.toLowerCase().includes(q) ||
        site.recipient_name.toLowerCase().includes(q) ||
        site.slug.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredMusicTracks = musicLibraryCategory === "all"
    ? musicTracks
    : musicTracks.filter((track) => track.category === musicLibraryCategory);

  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: "Tüm Projeler" },
    { key: "active", label: "Aktif" },
    { key: "draft", label: "Taslaklar" },
    { key: "archived", label: "Arşiv" },
  ];

  const toggleInspirationChip = (chip: string) => {
    setSelectedInspirationChips((prev) => (
      prev.includes(chip)
        ? prev.filter((item) => item !== chip)
        : [...prev, chip]
    ));
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 pt-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card border border-border rounded-xl overflow-hidden animate-pulse">
            <div className="h-36 bg-muted" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
              <div className="flex gap-2 pt-2">
                <div className="h-8 bg-muted rounded-lg flex-1" />
                <div className="h-8 bg-muted rounded-lg flex-1" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {paymentSuccess && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-lg">
          Ödeme başarılı. Siteniz canlıya alındı.
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">Hikayeleriniz</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Dijital hikaye sitelerinizi yönetin ve yeni projeler oluşturun.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Projelerde ara..."
              className="pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 w-56"
            />
          </div>
          {/* Create Button */}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("open-template-picker"))}
            className="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-accent transition-colors flex items-center gap-2 whitespace-nowrap shadow-sm"
          >
            <Plus className="w-4 h-4" /> Yeni Site
          </button>
        </div>
      </div>

      {/* Filter Tabs — Pill / Segment Control */}
      <div className="bg-muted p-1 rounded-xl inline-flex mb-6">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 text-sm font-medium transition-all rounded-lg ${filter === f.key
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
              }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Music Library */}
      <section className="bg-card border border-border rounded-xl p-6 shadow-sm mb-8">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Music className="w-5 h-5 text-primary" />
              Music Library
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Track listing and AI mock tools for music ideation.
            </p>
          </div>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-primary-light text-primary">
            {musicTracks.length} tracks
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          <button
            type="button"
            onClick={() => setMusicLibraryCategory("all")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${musicLibraryCategory === "all"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-border"
              }`}
          >
            Tümü
          </button>
          {MUSIC_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setMusicLibraryCategory(cat.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${musicLibraryCategory === cat.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-border"
                }`}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          {filteredMusicTracks.length === 0 && (
            <p className="md:col-span-2 text-sm text-muted-foreground border border-border rounded-lg bg-muted px-3 py-3">
              Bu kategoride müzik bulunamadı.
            </p>
          )}
          {filteredMusicTracks.map((track) => (
            <div
              key={track.id}
              className="p-3 rounded-lg border border-border bg-muted text-sm text-foreground/90"
            >
              <p className="font-medium text-foreground truncate">{track.title}</p>
              <p className="text-xs text-muted-foreground mt-1 truncate">{track.artist}</p>
            </div>
          ))}
        </div>

        {/* // AI Music Section (moved to Music Library) */}
        <div className="mt-6 border-t border-border pt-6">
          <h3 className="text-base font-semibold text-foreground">AI Music Generator</h3>

          <div className="mt-4 space-y-4">
            <article className="bg-muted/45 border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-primary" />
                <h4 className="text-sm font-semibold text-foreground">Generator Card</h4>
              </div>

              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Song Description</label>
              <textarea
                value={songDescription}
                onChange={(e) => setSongDescription(e.target.value)}
                placeholder="Describe the style, mood, and instrumentation..."
                className="w-full min-h-[96px] resize-y bg-card border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/20 outline-none transition-all"
              />

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setIncludeAudio((prev) => !prev)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${includeAudio
                    ? "bg-primary-light text-primary border-primary/60"
                    : "bg-card text-muted-foreground border-border hover:border-primary/40"
                    }`}
                >
                  +Audio
                </button>
                <button
                  type="button"
                  onClick={() => setIncludeLyrics((prev) => !prev)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${includeLyrics
                    ? "bg-primary-light text-primary border-primary/60"
                    : "bg-card text-muted-foreground border-border hover:border-primary/40"
                    }`}
                >
                  +Lyrics
                </button>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setInstrumentalOnly((prev) => !prev)}
                  className={`relative w-11 h-6 rounded-full border transition-colors ${instrumentalOnly
                    ? "bg-primary border-primary"
                    : "bg-card border-border"
                    }`}
                  aria-pressed={instrumentalOnly}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-primary-foreground transition-all ${instrumentalOnly ? "right-0.5" : "left-0.5"
                      }`}
                  />
                </button>
                <span className="text-xs text-muted-foreground">Instrumental</span>
              </div>

              <div className="mt-3">
                <p className="text-xs font-medium text-muted-foreground mb-2">Inspiration</p>
                <div className="flex flex-wrap gap-2">
                  {AI_MUSIC_INSPIRATION_CHIPS.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => toggleInspirationChip(chip)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${selectedInspirationChips.includes(chip)
                        ? "bg-primary-light text-primary border-primary/60"
                        : "bg-card text-muted-foreground border-border hover:border-primary/40"
                        }`}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                className="mt-4 w-full sm:w-auto px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-accent transition-colors"
              >
                Generate
              </button>
            </article>

            <article className="bg-muted/45 border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Upload className="w-4 h-4 text-primary" />
                <h4 className="text-sm font-semibold text-foreground">Upload Music Card</h4>
              </div>

              <label
                htmlFor="dashboardMusicUpload"
                className="flex flex-col items-center justify-center gap-2 border border-dashed border-border rounded-xl bg-card px-4 py-6 text-center cursor-pointer hover:border-primary/60 transition-colors"
              >
                <span className="text-sm font-medium text-foreground">Select audio file</span>
                <span className="text-xs text-muted-foreground">MP3, WAV, AIFF</span>
              </label>
              <input
                id="dashboardMusicUpload"
                type="file"
                accept=".mp3,.wav,.aiff"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  setSelectedMusicFileName(file?.name ?? "");
                }}
                className="sr-only"
              />

              <div className="mt-3 text-xs rounded-lg border border-border bg-card px-3 py-2 text-muted-foreground break-all">
                {selectedMusicFileName || "No file selected"}
              </div>
            </article>

            <article className="bg-muted/45 border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <MessageCircle className="w-4 h-4 text-primary" />
                <h4 className="text-sm font-semibold text-foreground">Chat (Mock) Card</h4>
              </div>

              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="p-3 flex flex-col gap-2.5 max-h-72 overflow-y-auto">
                  {AI_MUSIC_CHAT_MOCK_MESSAGES.map((msg) => (
                    <div
                      key={msg.id}
                      className={`max-w-[88%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed break-words ${msg.role === "user"
                        ? "self-end rounded-br-md bg-primary text-primary-foreground shadow-[0_0_0_1px_rgba(244,63,94,0.3),0_0_18px_rgba(244,63,94,0.2)]"
                        : "self-start rounded-bl-md border border-border bg-muted text-foreground"
                        }`}
                    >
                      {msg.text}
                    </div>
                  ))}
                </div>

                <div className="border-t border-border p-3 flex items-center gap-2">
                  <input
                    type="text"
                    disabled
                    placeholder="Chat will be enabled after AI integration..."
                    className="flex-1 bg-muted border border-border rounded-full px-3 py-2 text-sm text-muted-foreground cursor-not-allowed"
                  />
                  <button
                    type="button"
                    disabled
                    className="w-9 h-9 rounded-full bg-muted border border-border text-muted-foreground flex items-center justify-center cursor-not-allowed opacity-70"
                    aria-label="Send"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {/* "Start a New Story" Card */}
        <button
          onClick={() => window.dispatchEvent(new CustomEvent("open-template-picker"))}
          className="group bg-card rounded-xl border-2 border-dashed border-border hover:border-primary transition-all flex flex-col items-center justify-center text-center p-8"
        >
          <div className="w-12 h-12 rounded-xl bg-muted group-hover:bg-primary-light flex items-center justify-center mb-4 transition-all group-hover:scale-110">
            <Plus className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <h3 className="font-medium text-foreground group-hover:text-primary transition-colors text-sm mb-1">Yeni Hikaye Oluştur</h3>
          <p className="text-[11px] text-muted-foreground max-w-[160px] leading-relaxed">
            Bir şablon seçerek başlayın
          </p>
        </button>

        {/* Site Cards */}
        {filteredSites.map((site) => {
          const gradient = site.slides?.[0]?.gradient;
          const coverImage = site.slides?.[0]?.imageUrl;
          const editRemaining = getTimeRemaining(site.created_at, 7);
          const liveRemaining = site.status === "active" ? getTimeRemaining(site.created_at, 365) : null;

          const statusConfig: Record<string, { classes: string; label: string }> = {
            active: { classes: "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200", label: "Yayında" },
            draft: { classes: "bg-stone-100 text-stone-500 ring-1 ring-stone-200", label: "Taslak" },
            paid: { classes: "bg-blue-50 text-blue-600 ring-1 ring-blue-200", label: "Ödendi" },
            expired: { classes: "bg-red-50 text-red-600 ring-1 ring-red-200", label: "Süresi Doldu" },
          };
          const st = statusConfig[site.status] || { classes: "bg-stone-100 text-stone-500 ring-1 ring-stone-200", label: site.status };

          return (
            <div
              key={site.id}
              className="bg-card border border-border rounded-xl shadow-sm overflow-hidden hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 flex flex-col"
            >
              {/* Cover — clickable */}
              <div
                className="relative h-36 overflow-hidden flex-shrink-0 cursor-pointer group/cover"
                onClick={() => {
                  if (site.status === "active") {
                    window.open(`/${site.slug}`, "_blank");
                  } else {
                    router.push(`/dashboard/preview/${site.id}`);
                  }
                }}
              >
                {coverImage ? (
                  <img
                    src={coverImage}
                    alt={site.title}
                    className="w-full h-full object-cover group-hover/cover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{
                      background: gradient
                        ? `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`
                        : "linear-gradient(135deg, #667eea, #764ba2)",
                    }}
                  >
                    <Gift className="w-8 h-8 text-white/70" />
                  </div>
                )}
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover/cover:bg-black/30 transition-colors flex items-center justify-center">
                  <span className="text-white text-xs font-semibold bg-black/50 px-3 py-1.5 rounded-full opacity-0 group-hover/cover:opacity-100 transition-opacity backdrop-blur-sm flex items-center gap-1.5">
                    {site.status === "active" ? (
                      <><ExternalLink className="w-3 h-3" /> Siteyi Aç</>
                    ) : (
                      <><Eye className="w-3 h-3" /> Önizleme</>
                    )}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 flex flex-col flex-1">
                {/* Title & Status */}
                <h3 className="font-semibold text-foreground text-sm truncate">
                  {site.recipient_name}&apos;e Özel
                </h3>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${st.classes}`}>
                    {st.label}
                  </span>
                  <span className="text-muted-foreground text-[11px]">{site.slides?.length || 0} slide</span>
                  {site.status === "active" && (
                    <>
                      <span className="text-border text-[11px]">·</span>
                      <span className="text-[11px] text-muted-foreground truncate">/{site.slug}</span>
                    </>
                  )}
                </div>

                {/* Countdown badges */}
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {!editRemaining.expired ? (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1 ${editRemaining.days <= 2 ? "bg-amber-50 text-amber-600" : "bg-muted text-muted-foreground"
                      }`}>
                      <Clock className="w-3 h-3" /> {editRemaining.text} kaldı
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-muted text-muted-foreground inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Süre doldu
                    </span>
                  )}
                  {liveRemaining && !liveRemaining.expired && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1 ${liveRemaining.days <= 30 ? "bg-red-50 text-red-600" : "bg-muted text-muted-foreground"
                      }`}>
                      <Globe className="w-3 h-3" /> {liveRemaining.text} kaldı
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-auto pt-4">
                  {/* Yayınla (only for non-active) */}
                  {site.status !== "active" && (
                    <button
                      onClick={() => router.push(`/checkout?siteId=${site.id}&name=${encodeURIComponent(site.recipient_name + "'e Özel")}`)}
                      className="flex-1 text-center py-2 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-accent transition-colors"
                    >
                      Yayınla
                    </button>
                  )}

                  {/* ZIP İndir (only for active) */}
                  {site.status === "active" && (
                    <a
                      href={`/api/download/${site.id}`}
                      className="flex-1 text-center py-2 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-accent transition-colors inline-flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" /> ZIP İndir
                    </a>
                  )}

                  {/* Düzenle (only if edit not expired) */}
                  {!editRemaining.expired && (
                    <Link
                      href={`/dashboard/editor/${site.id}`}
                      className="flex-1 text-center py-2 rounded-lg text-xs font-semibold bg-muted text-muted-foreground hover:bg-border hover:text-foreground transition-colors inline-flex items-center justify-center gap-1.5"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Düzenle
                    </Link>
                  )}

                  {/* Sil */}
                  <button
                    onClick={() => handleDelete(site.id)}
                    className="px-3 py-2 rounded-lg text-xs font-semibold bg-muted text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-colors flex-shrink-0"
                    title="Siteyi Sil"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty filtered state */}
      {filteredSites.length === 0 && sites.length > 0 && (
        <div className="text-center py-12">
          <FolderOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">
            {search ? `"${search}" ile eşleşen proje bulunamadı.` : "Bu kategoride proje yok."}
          </p>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="pt-8 text-sm text-muted-foreground">Yükleniyor...</div>}>
      <DashboardPageContent />
    </Suspense>
  );
}
