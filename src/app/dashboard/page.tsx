"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-zinc-500">
          <div className="w-5 h-5 border-2 border-zinc-600 border-t-zinc-400 rounded-full animate-spin" />
          Yükleniyor...
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Hikayeleriniz</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Dijital hikaye sitelerinizi yönetin ve yeni projeler oluşturun.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Projelerde ara..."
              className="pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500/50 w-56"
            />
          </div>
          {/* Create Button */}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("open-template-picker"))}
            className="bg-rose-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-rose-600 transition-colors flex items-center gap-2 whitespace-nowrap shadow-sm"
          >
            <span className="text-lg leading-none">+</span> Yeni Site
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 mb-6 border-b border-zinc-800 pb-px">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${filter === f.key
              ? "text-white"
              : "text-zinc-500 hover:text-zinc-300"
              }`}
          >
            {f.label}
            {filter === f.key && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {/* "Start a New Story" Card */}
        <button
          onClick={() => window.dispatchEvent(new CustomEvent("open-template-picker"))}
          className="group bg-zinc-900 rounded-2xl border border-dashed border-zinc-800 hover:border-zinc-600 transition-all flex flex-col items-center justify-center text-center p-8"
        >
          <div className="w-12 h-12 rounded-xl bg-zinc-800 group-hover:bg-rose-500/10 flex items-center justify-center mb-4 transition-all group-hover:scale-110">
            <svg className="w-5 h-5 text-zinc-500 group-hover:text-rose-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h3 className="font-medium text-zinc-300 group-hover:text-white transition-colors text-sm mb-1">Yeni Hikaye Oluştur</h3>
          <p className="text-[11px] text-zinc-600 max-w-[160px] leading-relaxed">
            Bir şablon seçerek başlayın
          </p>
        </button>

        {/* Site Cards */}
        {filteredSites.map((site) => {
          const gradient = site.slides?.[0]?.gradient;
          const coverImage = site.slides?.[0]?.imageUrl;
          const editRemaining = getTimeRemaining(site.created_at, 7);
          const liveRemaining = site.status === "active" ? getTimeRemaining(site.created_at, 365) : null;

          const statusConfig: Record<string, { color: string; label: string }> = {
            active: { color: "bg-emerald-400", label: "Yayında" },
            draft: { color: "bg-zinc-500", label: "Taslak" },
            paid: { color: "bg-blue-400", label: "Ödendi" },
            expired: { color: "bg-red-400", label: "Süresi Doldu" },
          };
          const st = statusConfig[site.status] || { color: "bg-zinc-500", label: site.status };

          return (
            <div
              key={site.id}
              className="bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800/50 hover:border-zinc-700 transition-all flex flex-col"
            >
              {/* Cover — clickable */}
              <div
                className="relative h-32 overflow-hidden flex-shrink-0 cursor-pointer group/cover"
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
                    className="w-full h-full flex items-center justify-center text-3xl"
                    style={{
                      background: gradient
                        ? `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`
                        : "linear-gradient(135deg, #667eea, #764ba2)",
                    }}
                  >
                    💝
                  </div>
                )}
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover/cover:bg-black/30 transition-colors flex items-center justify-center">
                  <span className="text-white text-xs font-semibold bg-black/50 px-3 py-1.5 rounded-full opacity-0 group-hover/cover:opacity-100 transition-opacity backdrop-blur-sm">
                    {site.status === "active" ? "🔗 Siteyi Aç" : "👁 Önizleme"}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 flex flex-col flex-1">
                {/* Title & Status */}
                <h3 className="font-semibold text-white text-sm truncate">
                  {site.recipient_name}&apos;e Özel
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${st.color}`} />
                  <span className="text-[11px] text-zinc-500">{st.label}</span>
                  <span className="text-zinc-700 text-[11px]">·</span>
                  <span className="text-[11px] text-zinc-600">{site.slides?.length || 0} slide</span>
                  {site.status === "active" && (
                    <>
                      <span className="text-zinc-700 text-[11px]">·</span>
                      <span className="text-[11px] text-zinc-500 truncate">/{site.slug}</span>
                    </>
                  )}
                </div>

                {/* Countdown badges */}
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {!editRemaining.expired ? (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${editRemaining.days <= 2 ? "bg-amber-500/10 text-amber-400" : "bg-zinc-800 text-zinc-400"
                      }`}>
                      ✏️ {editRemaining.text} kaldı
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-zinc-800 text-zinc-600">
                      ✏️ Süre doldu
                    </span>
                  )}
                  {liveRemaining && !liveRemaining.expired && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${liveRemaining.days <= 30 ? "bg-red-500/10 text-red-400" : "bg-zinc-800 text-zinc-400"
                      }`}>
                      🌐 {liveRemaining.text} kaldı
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-auto pt-4">
                  {/* Yayınla (only for non-active) */}
                  {site.status !== "active" && (
                    <button
                      onClick={() => router.push(`/checkout?siteId=${site.id}&name=${encodeURIComponent(site.recipient_name + "'e Özel")}`)}
                      className="flex-1 text-center py-2 rounded-lg text-xs font-semibold bg-rose-500 text-white hover:bg-rose-600 transition-colors"
                    >
                      Yayınla
                    </button>
                  )}

                  {/* ZIP İndir (only for active) */}
                  {site.status === "active" && (
                    <a
                      href={`/api/download/${site.id}`}
                      className="flex-1 text-center py-2 rounded-lg text-xs font-semibold bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
                    >
                      📦 ZIP İndir
                    </a>
                  )}

                  {/* Düzenle (only if edit not expired) */}
                  {!editRemaining.expired && (
                    <Link
                      href={`/dashboard/editor/${site.id}`}
                      className="flex-1 text-center py-2 rounded-lg text-xs font-semibold bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
                    >
                      Düzenle
                    </Link>
                  )}

                  {/* Sil */}
                  <button
                    onClick={() => handleDelete(site.id)}
                    className="px-3 py-2 rounded-lg text-xs font-semibold bg-zinc-800 text-zinc-500 hover:bg-red-500/10 hover:text-red-400 transition-colors flex-shrink-0"
                    title="Siteyi Sil"
                  >
                    🗑
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
          <p className="text-zinc-500 text-sm">
            {search ? `"${search}" ile eşleşen proje bulunamadı.` : "Bu kategoride proje yok."}
          </p>
        </div>
      )}
    </div>
  );
}
