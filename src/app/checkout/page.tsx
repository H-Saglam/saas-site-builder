"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";

function CheckoutContent() {
  const params = useSearchParams();
  const siteId = params.get("siteId");
  const siteName = params.get("name") || "Site";

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        {/* Başlık */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Planını Seç 💝
          </h1>
          <p className="text-gray-500">
            <span className="font-medium text-gray-700">{siteName}</span> siteni canlıya almak için bir paket seç
          </p>
        </div>

        {/* Paketler */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Standart */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 hover:shadow-lg transition-shadow">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-1">Standart</h2>
              <p className="text-sm text-gray-500 mb-4">Sevdiklerinize özel site</p>
              <div className="text-4xl font-bold text-purple-600 mb-1">
                149<span className="text-lg font-normal text-gray-400">₺</span>
              </div>
              <p className="text-xs text-gray-400">tek seferlik</p>
            </div>

            <ul className="space-y-3 mb-8 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> 1 yıl online erişim
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> 3-12 arası slide
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Müzik kütüphanesi
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Şifre koruması
              </li>
              <li className="flex items-center gap-2 text-gray-400">
                <span>✕</span> Offline ZIP indirme
              </li>
            </ul>

            <button
              onClick={() => handlePayment(siteId, "standard")}
              className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors"
            >
              Standart Satın Al
            </button>
          </div>

          {/* Premium */}
          <div className="bg-white rounded-2xl shadow-md border-2 border-pink-400 p-8 relative hover:shadow-lg transition-shadow">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-pink-500 text-white text-xs font-bold px-4 py-1 rounded-full">
              ÖNERİLEN
            </div>

            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-1">Premium ⭐</h2>
              <p className="text-sm text-gray-500 mb-4">Online + Offline paket</p>
              <div className="text-4xl font-bold text-pink-600 mb-1">
                249<span className="text-lg font-normal text-gray-400">₺</span>
              </div>
              <p className="text-xs text-gray-400">tek seferlik</p>
            </div>

            <ul className="space-y-3 mb-8 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> 1 yıl online erişim
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> 3-12 arası slide
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Müzik kütüphanesi
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Şifre koruması
              </li>
              <li className="flex items-center gap-2 font-medium text-pink-600">
                <span className="text-green-500">✓</span> Offline ZIP indirme
              </li>
            </ul>

            <button
              onClick={() => handlePayment(siteId, "premium")}
              className="w-full bg-pink-500 text-white py-3 rounded-xl font-semibold hover:bg-pink-600 transition-colors"
            >
              Premium Satın Al
            </button>
          </div>
        </div>

        {/* Alt bilgi */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-400 mb-4">
            Ödeme altyapısı Shopier tarafından güvenli şekilde sağlanmaktadır.
          </p>
          <Link href="/dashboard" className="text-sm text-purple-600 hover:underline">
            ← Dashboard&apos;a Dön
          </Link>
        </div>
      </div>
    </div>
  );
}

function handlePayment(siteId: string | null, packageType: string) {
  if (!siteId) {
    alert("Site bilgisi bulunamadı");
    return;
  }

  // Shopier ayarlanmamışsa bilgi ver
  const shopierApiKey = process.env.NEXT_PUBLIC_SHOPIER_API_KEY;
  if (!shopierApiKey || shopierApiKey === "XXXXXXXXXXXX") {
    alert(
      `Shopier henüz yapılandırılmamış.\n\nGeliştirme modunda siteyi dashboard'dan "Canlıya Al" butonuyla doğrudan aktifleştirebilirsiniz.\n\nPaket: ${packageType === "premium" ? "Premium (249₺)" : "Standart (149₺)"}`
    );
    return;
  }

  // Shopier ödeme sayfasına yönlendir
  // Not: Shopier entegrasyonu için Shopier panel ayarları gerekli
  const shopierUrl = `https://www.shopier.com/ShowProductNew/products.php?id=${shopierApiKey}&product_type=money_transfer&amount=${packageType === "premium" ? "249" : "149"}&currency=TRY&custom_field_1=${siteId}&custom_field_2=${packageType}`;
  window.open(shopierUrl, "_blank");
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
