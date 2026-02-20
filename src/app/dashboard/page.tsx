"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
} from "lucide-react";

interface SiteItem {
  id: string;
  slug: string;
  title: string;
  recipient_name: string;
  status: string;
  package_type: string;
  is_private: boolean;
  created_at: string;
  slides: { gradient?: { from: string; to: string }; imageUrl?: string }[];
}

type FilterType = "all" | "active" | "draft" | "archived";

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

export default function DashboardPage() {
  const [sites, setSites] = useState<SiteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/sites")
      .then((res) => res.json())
      .then((data) => {
        setSites(data.sites || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

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

  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: "Tüm Projeler" },
    { key: "active", label: "Aktif" },
    { key: "draft", label: "Taslaklar" },
    { key: "archived", label: "Arşiv" },
  ];

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
            className={`px-4 py-2 text-sm font-medium transition-all rounded-lg ${
              filter === f.key
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

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
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1 ${
                      editRemaining.days <= 2 ? "bg-amber-50 text-amber-600" : "bg-muted text-muted-foreground"
                    }`}>
                      <Clock className="w-3 h-3" /> {editRemaining.text} kaldı
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-muted text-muted-foreground inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Süre doldu
                    </span>
                  )}
                  {liveRemaining && !liveRemaining.expired && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1 ${
                      liveRemaining.days <= 30 ? "bg-red-50 text-red-600" : "bg-muted text-muted-foreground"
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
