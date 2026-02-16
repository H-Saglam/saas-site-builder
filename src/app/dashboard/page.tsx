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
  const [activating, setActivating] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
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

  useEffect(() => {
    const handler = () => setMenuOpen(null);
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, []);

  const handleDelete = async (siteId: string) => {
    if (!confirm("Bu siteyi silmek istediğinize emin misiniz?")) return;
    const res = await fetch(`/api/sites?siteId=${siteId}`, { method: "DELETE" });
    if (res.ok) setSites(sites.filter((s) => s.id !== siteId));
  };

  const handleActivate = async (site: SiteItem) => {
    setActivating(site.id);
    try {
      const res = await fetch("/api/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId: site.id }),
      });
      const data = await res.json();

      if (data.success) {
        setSites(sites.map((s) => s.id === site.id ? { ...s, status: "active" } : s));
        alert("Site canlıya alındı! ✅");
      } else if (data.needsPayment) {
        router.push(`/checkout?siteId=${site.id}&name=${encodeURIComponent(site.recipient_name + "'e Özel")}`);
      } else {
        alert(data.message || data.error || "Bir hata oluştu");
      }
    } catch {
      alert("Bir hata oluştu");
    } finally {
      setActivating(null);
    }
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

  const statusBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string; label: string }> = {
      active: { bg: "bg-emerald-500", text: "text-white", label: "Aktif" },
      draft: { bg: "bg-zinc-600", text: "text-zinc-200", label: "Taslak" },
      paid: { bg: "bg-blue-500", text: "text-white", label: "Ödendi" },
      expired: { bg: "bg-red-500/80", text: "text-white", label: "Süresi Doldu" },
    };
    const c = config[status] || { bg: "bg-zinc-600", text: "text-white", label: status };
    return (
      <span className={`absolute top-3 right-3 ${c.bg} ${c.text} text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm uppercase tracking-wide`}>
        {c.label}
      </span>
    );
  };

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
            className="bg-white text-zinc-900 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-zinc-100 transition-colors flex items-center gap-2 whitespace-nowrap shadow-sm"
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
          className="group bg-zinc-900 rounded-2xl border border-zinc-800 hover:border-rose-500/30 transition-all flex flex-col items-center justify-center text-center p-10 min-h-[280px] hover:shadow-lg hover:shadow-rose-500/5"
        >
          <div className="w-14 h-14 bg-zinc-800 group-hover:bg-rose-500/10 rounded-full flex items-center justify-center mb-4 transition-colors">
            <span className="text-2xl text-zinc-500 group-hover:text-rose-400 transition-colors">+</span>
          </div>
          <h3 className="font-semibold text-white mb-1">Yeni Hikaye Oluştur</h3>
          <p className="text-xs text-zinc-500 max-w-[180px] leading-relaxed">
            Bir şablon seçerek anılarınızı kaydetmeye başlayın.
          </p>
        </button>

        {/* Site Cards */}
        {filteredSites.map((site) => {
          const gradient = site.slides?.[0]?.gradient;
          const coverImage = site.slides?.[0]?.imageUrl;
          const editRemaining = getTimeRemaining(site.created_at, 7);

          return (
            <div
              key={site.id}
              className="group bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden hover:border-zinc-700 hover:shadow-lg transition-all"
            >
              {/* Cover */}
              <div className="relative h-40 overflow-hidden">
                {coverImage ? (
                  <img
                    src={coverImage}
                    alt={site.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-white text-4xl"
                    style={{
                      background: gradient
                        ? `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`
                        : "linear-gradient(135deg, #667eea, #764ba2)",
                    }}
                  >
                    💝
                  </div>
                )}
                {statusBadge(site.status)}
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-1">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-white truncate text-sm">
                      {site.recipient_name}&apos;e Özel
                    </h3>
                    <p className="text-xs text-zinc-500 mt-0.5">{getTimeAgo(site.created_at)} güncellendi</p>
                  </div>
                  {/* 3-dot menu */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(menuOpen === site.id ? null : site.id);
                      }}
                      className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      •••
                    </button>
                    {menuOpen === site.id && (
                      <div className="absolute right-0 top-8 bg-zinc-800 border border-zinc-700 rounded-xl shadow-lg py-1 w-40 z-20">
                        <Link
                          href={`/dashboard/editor/${site.id}`}
                          className="block px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700 transition-colors"
                        >
                          ✏️ Düzenle
                        </Link>
                        {site.status === "active" && (
                          <Link
                            href={`/${site.slug}`}
                            target="_blank"
                            className="block px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700 transition-colors"
                          >
                            🔗 Siteyi Aç
                          </Link>
                        )}
                        {site.status !== "active" && (
                          <button
                            onClick={() => handleActivate(site)}
                            disabled={activating === site.id}
                            className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700 transition-colors disabled:opacity-50"
                          >
                            🚀 Yayınla
                          </button>
                        )}
                        <div className="border-t border-zinc-700 my-1" />
                        <button
                          onClick={() => handleDelete(site.id)}
                          className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-zinc-700 transition-colors"
                        >
                          🗑 Sil
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-3 mt-3 text-xs text-zinc-500">
                  {site.is_private && <span>🔒 Gizli</span>}
                  <span>{site.slides?.length || 0} slide</span>
                  {site.status === "active" && <span>🌐 /{site.slug}</span>}
                  {!editRemaining.expired && editRemaining.days <= 3 && (
                    <span className="text-amber-400">⏰ {editRemaining.text}</span>
                  )}
                </div>

                {/* Action Button */}
                <div className="mt-4">
                  {site.status === "active" ? (
                    <Link
                      href={`/dashboard/editor/${site.id}`}
                      className="block w-full text-center bg-rose-500/10 text-rose-400 py-2.5 rounded-xl text-sm font-semibold hover:bg-rose-500/20 transition-colors"
                    >
                      Siteyi Düzenle
                    </Link>
                  ) : site.status === "draft" || site.status === "paid" ? (
                    <Link
                      href={`/dashboard/editor/${site.id}`}
                      className="block w-full text-center bg-rose-500/10 text-rose-400 py-2.5 rounded-xl text-sm font-semibold hover:bg-rose-500/20 transition-colors"
                    >
                      Düzenlemeye Devam Et
                    </Link>
                  ) : (
                    <div className="text-center text-xs text-zinc-600 py-2.5">
                      Süresi dolmuş
                    </div>
                  )}
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
