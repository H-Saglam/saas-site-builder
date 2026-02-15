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
  slides: { gradient?: { from: string; to: string } }[];
}

// Geri sayım hesaplama fonksiyonu
function getTimeRemaining(createdAt: string, durationDays: number) {
  const created = new Date(createdAt);
  const now = new Date();
  const expiresAt = new Date(created.getTime() + durationDays * 24 * 60 * 60 * 1000);
  const diff = expiresAt.getTime() - now.getTime();

  if (diff <= 0) {
    return { expired: true, text: "Süresi doldu", days: 0, hours: 0 };
  }

  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  
  if (days > 30) {
    return { expired: false, text: `${days} gün`, days, hours };
  } else if (days > 0) {
    return { expired: false, text: `${days} gün ${hours} saat`, days, hours };
  } else {
    return { expired: false, text: `${hours} saat`, days, hours };
  }
}

export default function DashboardPage() {
  const [sites, setSites] = useState<SiteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(Date.now());
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

  // Her 1 dakikada bir güncelle (geri sayım için)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000); // 60 saniye
    return () => clearInterval(interval);
  }, []);

  const handleDelete = async (siteId: string) => {
    if (!confirm("Bu siteyi silmek istediğinize emin misiniz?")) return;

    const res = await fetch(`/api/sites?siteId=${siteId}`, { method: "DELETE" });
    if (res.ok) {
      setSites(sites.filter((s) => s.id !== siteId));
    }
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
        // Siteyi aktif olarak güncelle
        setSites(sites.map((s) =>
          s.id === site.id ? { ...s, status: "active" } : s
        ));
        alert("Site canlıya alındı! ✅");
      } else if (data.needsPayment) {
        // Ödeme sayfasına yönlendir
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

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: "bg-yellow-100 text-yellow-800",
      active: "bg-green-100 text-green-800",
      paid: "bg-blue-100 text-blue-800",
      expired: "bg-red-100 text-red-800",
    };
    const labels: Record<string, string> = {
      draft: "Taslak",
      active: "Aktif",
      paid: "Ödendi",
      expired: "Süresi Doldu",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status] || "bg-gray-100 text-gray-800"}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400 text-lg">Yükleniyor...</div>
      </div>
    );
  }

  if (sites.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-6">💝</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">
          Henüz bir siteniz yok
        </h2>
        <p className="text-gray-500 mb-8">
          İlk dijital hikaye sitenizi oluşturmaya başlayın!
        </p>
        <Link
          href="/dashboard/editor/new"
          className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors inline-block"
        >
          İlk Siteni Oluştur ✨
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Sitelerim</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sites.map((site) => {
          const gradient = site.slides?.[0]?.gradient;
          // currentTime kullanarak geri sayımı güncelle
          const editRemaining = getTimeRemaining(site.created_at, 7);
          const liveRemaining = getTimeRemaining(site.created_at, 365);
          void currentTime; // Re-render trigger için kullanılıyor
          
          return (
            <div
              key={site.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Thumbnail */}
              <div
                className="h-32"
                style={{
                  background: gradient
                    ? `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`
                    : "linear-gradient(135deg, #667eea, #764ba2)",
                }}
              >
                <div className="h-full flex items-center justify-center text-white text-3xl">
                  💝
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-gray-800 truncate">
                    {site.recipient_name}&apos;e Özel
                  </h3>
                  {site.is_private && <span title="Şifre korumalı">🔒</span>}
                </div>
                <p className="text-sm text-gray-500 mb-3 truncate">{site.title}</p>

                <div className="flex items-center justify-between mb-4">
                  {statusBadge(site.status)}
                  <span className="text-xs text-gray-400">
                    {site.package_type === "premium" ? "⭐ Premium" : "Standart"}
                  </span>
                </div>

                {/* Geri Sayımlar */}
                <div className="mb-3 space-y-1.5">
                  {/* Düzenleme Süresi */}
                  <div className={`text-xs flex items-center justify-between ${editRemaining.expired ? "text-red-500" : editRemaining.days <= 2 ? "text-orange-500" : "text-gray-500"}`}>
                    <span>✏️ Düzenleme:</span>
                    <span className="font-medium">{editRemaining.text}</span>
                  </div>
                  
                  {/* Canlı Kalma Süresi - Sadece aktif siteler için */}
                  {site.status === "active" && (
                    <div className={`text-xs flex items-center justify-between ${liveRemaining.expired ? "text-red-500" : liveRemaining.days <= 30 ? "text-orange-500" : "text-gray-500"}`}>
                      <span>🌐 Canlıda:</span>
                      <span className="font-medium">{liveRemaining.text}</span>
                    </div>
                  )}
                </div>

                {site.status === "active" && (
                  <div className="text-xs text-gray-400 mb-3">
                    🔗 /{site.slug}
                  </div>
                )}

                <div className="flex gap-2 flex-wrap">
                  <Link
                    href={`/dashboard/editor/${site.id}`}
                    className="flex-1 text-center bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    Düzenle
                  </Link>
                  {site.status === "active" ? (
                    <Link
                      href={`/${site.slug}`}
                      target="_blank"
                      className="flex-1 text-center bg-purple-100 text-purple-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors"
                    >
                      Siteyi Aç
                    </Link>
                  ) : (
                    <Link
                      href={`/dashboard/preview/${site.id}`}
                      className="flex-1 text-center bg-purple-100 text-purple-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors"
                    >
                      Önizle
                    </Link>
                  )}
                  {site.status !== "active" && (
                    <button
                      onClick={() => handleActivate(site)}
                      disabled={activating === site.id}
                      className="flex-1 text-center bg-green-500 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-green-600 transition-colors disabled:opacity-50"
                    >
                      {activating === site.id ? "⏳" : "🚀 Yayınla"}
                    </button>
                  )}
                  {site.status === "active" && (
                    <span className="flex-1 text-center bg-green-50 text-green-600 px-3 py-2 rounded-lg text-sm font-medium">
                      ✅ Yayında
                    </span>
                  )}
                  <button
                    onClick={() => handleDelete(site.id)}
                    className="px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100 transition-colors"
                    title="Sil"
                  >
                    🗑
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
