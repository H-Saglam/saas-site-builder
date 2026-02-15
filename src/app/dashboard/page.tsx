"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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

export default function DashboardPage() {
  const [sites, setSites] = useState<SiteItem[]>([]);
  const [loading, setLoading] = useState(true);

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
    if (res.ok) {
      setSites(sites.filter((s) => s.id !== siteId));
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

                {site.status === "active" && (
                  <div className="text-xs text-gray-400 mb-3">
                    🔗 /{site.slug}
                  </div>
                )}

                <div className="flex gap-2">
                  <Link
                    href={`/dashboard/editor/${site.id}`}
                    className="flex-1 text-center bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    Düzenle
                  </Link>
                  {(site.status === "active" || site.status === "draft") && (
                    <Link
                      href={`/${site.slug}`}
                      target="_blank"
                      className="flex-1 text-center bg-purple-100 text-purple-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors"
                    >
                      Görüntüle
                    </Link>
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
