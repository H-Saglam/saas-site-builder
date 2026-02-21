"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

type PackageType = "standard" | "premium";

function CheckoutContent() {
  const router = useRouter();
  const params = useSearchParams();
  const siteId = params.get("siteId");
  const siteName = params.get("name") || "Site";
  const [isWaiting, setIsWaiting] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PackageType | null>(null);
  const redirectStartedRef = useRef(false);

  const checkSiteStatus = useCallback(async () => {
    if (!siteId || redirectStartedRef.current) return;

    try {
      const res = await fetch(`/api/sites/${siteId}`, { cache: "no-store" });
      if (!res.ok) return;

      const data = await res.json();
      if (data?.site?.status === "active") {
        redirectStartedRef.current = true;
        router.push("/dashboard?payment=success");
      }
    } catch {}
  }, [siteId, router]);

  useEffect(() => {
    if (!isWaiting || !siteId) return;

    void checkSiteStatus();
    const intervalId = setInterval(() => {
      void checkSiteStatus();
    }, 4000);

    return () => clearInterval(intervalId);
  }, [isWaiting, siteId, checkSiteStatus]);

  function handlePayment(packageType: PackageType) {
    if (!siteId) {
      alert("Site bilgisi bulunamadı");
      return;
    }

    const shopierApiKey = process.env.NEXT_PUBLIC_SHOPIER_API_KEY;
    if (!shopierApiKey || shopierApiKey === "XXXXXXXXXXXX") {
      alert(
        `Shopier henüz yapılandırılmamış.\n\nGeliştirme modunda siteyi dashboard'dan "Canlıya Al" butonuyla doğrudan aktifleştirebilirsiniz.\n\nPaket: ${packageType === "premium" ? "Premium (249₺)" : "Standart (149₺)"}`
      );
      return;
    }

    const amount = packageType === "premium" ? "249" : "149";
    const shopierUrl = `https://www.shopier.com/ShowProductNew/products.php?id=${shopierApiKey}&product_type=money_transfer&amount=${amount}&currency=TRY&custom_field_1=${siteId}&custom_field_2=${packageType}`;
    window.open(shopierUrl, "_blank", "noopener,noreferrer");

    setSelectedPackage(packageType);
    setIsWaiting(true);
  }

  if (isWaiting) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="max-w-xl w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-zinc-800 mx-auto mb-4 flex items-center justify-center">
            <Loader2 className="h-7 w-7 text-rose-500 animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Ödeme Bekleniyor</h1>
          <p className="text-zinc-400 text-sm mb-5">
            Shopier penceresinde ödemenizi tamamladığınızda bu ekran otomatik olarak yenilenir.
          </p>
          <p className="text-zinc-300 text-sm mb-6">
            Seçilen paket:{" "}
            <span className="font-semibold text-white">
              {selectedPackage === "premium" ? "Premium" : "Standart"}
            </span>
          </p>

          <div className="grid sm:grid-cols-2 gap-3">
            <button
              onClick={() => void checkSiteStatus()}
              className="w-full bg-white text-zinc-900 py-2.5 rounded-xl font-semibold hover:bg-zinc-100 transition-colors"
            >
              Durumu Şimdi Kontrol Et
            </button>
            <button
              onClick={() => setIsWaiting(false)}
              className="w-full bg-zinc-800 text-zinc-100 py-2.5 rounded-xl font-semibold hover:bg-zinc-700 transition-colors"
            >
              Paketlere Geri Dön
            </button>
          </div>

          <Link href="/dashboard" className="inline-block mt-5 text-sm text-rose-500 hover:underline">
            ← Dashboard&apos;a Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        {/* Başlık */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">
            Planını Seç 💝
          </h1>
          <p className="text-zinc-400">
            <span className="font-medium text-zinc-200">{siteName}</span> siteni canlıya almak için bir paket seç
          </p>
        </div>

        {/* Paketler */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Standart */}
          <div className="bg-zinc-900 rounded-2xl shadow-sm border border-zinc-800 p-8 hover:shadow-lg transition-shadow">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-white mb-1">Standart</h2>
              <p className="text-sm text-zinc-500 mb-4">Sevdiklerinize özel site</p>
              <div className="text-4xl font-bold text-white mb-1">
                149<span className="text-lg font-normal text-zinc-400">₺</span>
              </div>
              <p className="text-xs text-zinc-400">tek seferlik</p>
            </div>

            <ul className="space-y-3 mb-8 text-sm text-zinc-400">
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> 1 yıl online erişim
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> 3-12 arası slide
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Müzik kütüphanesi
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Şifre koruması
              </li>
              <li className="flex items-center gap-2 text-zinc-400">
                <span>✕</span> Offline ZIP indirme
              </li>
            </ul>

            <button
              onClick={() => handlePayment("standard")}
              className="w-full bg-white text-zinc-900 py-3 rounded-xl font-semibold hover:bg-zinc-100 transition-colors"
            >
              Standart Satın Al
            </button>
          </div>

          {/* Premium */}
          <div className="bg-zinc-900 rounded-2xl shadow-md border-2 border-rose-500/30 p-8 relative hover:shadow-lg transition-shadow">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-rose-500 text-white text-xs font-bold px-4 py-1 rounded-full">
              ÖNERİLEN
            </div>

            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-white mb-1">Premium ⭐</h2>
              <p className="text-sm text-zinc-500 mb-4">Online + Offline paket</p>
              <div className="text-4xl font-bold text-rose-600 mb-1">
                249<span className="text-lg font-normal text-zinc-400">₺</span>
              </div>
              <p className="text-xs text-zinc-400">tek seferlik</p>
            </div>

            <ul className="space-y-3 mb-8 text-sm text-zinc-400">
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> 1 yıl online erişim
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> 3-12 arası slide
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Müzik kütüphanesi
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Şifre koruması
              </li>
              <li className="flex items-center gap-2 font-medium text-rose-600">
                <span className="text-emerald-400">✓</span> Offline ZIP indirme
              </li>
            </ul>

            <button
              onClick={() => handlePayment("premium")}
              className="w-full bg-rose-500 text-white py-3 rounded-xl font-semibold hover:bg-rose-600 transition-colors"
            >
              Premium Satın Al
            </button>
          </div>
        </div>

        {/* Alt bilgi */}
        <div className="text-center mt-8">
          <p className="text-xs text-zinc-500 mb-4">
            Ödeme altyapısı Shopier tarafından güvenli şekilde sağlanmaktadır.
          </p>
          <Link href="/dashboard" className="text-sm text-rose-600 hover:underline">
            ← Dashboard&apos;a Dön
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Yükleniyor...</div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
