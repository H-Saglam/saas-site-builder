import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-700 font-[var(--font-outfit)]">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 md:px-12">
        <div className="text-2xl font-bold text-white">💝 LoveSite</div>
        <div className="flex items-center gap-4">
          <Link
            href="/sign-in"
            className="text-white/80 hover:text-white transition-colors text-sm"
          >
            Giriş Yap
          </Link>
          <Link
            href="/sign-up"
            className="bg-white text-purple-700 px-5 py-2 rounded-full font-semibold text-sm hover:bg-white/90 transition-colors"
          >
            Hemen Başla
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-20 md:py-32">
        <h1 className="text-4xl md:text-6xl font-bold text-white max-w-3xl leading-tight mb-6">
          Sevdiklerinize Özel
          <br />
          <span className="text-pink-200">Dijital Hikayeler</span> Oluşturun
        </h1>
        <p className="text-lg md:text-xl text-white/80 max-w-xl mb-10">
          Fotoğraflarınız, müzikleriniz ve özel mesajlarınızla Instagram Stories
          tarzında interaktif hikaye siteleri tasarlayın. Doğum günü, yıl dönümü
          veya sevgililer günü hediyesi olarak paylaşın.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/sign-up"
            className="bg-white text-purple-700 px-8 py-4 rounded-full font-bold text-lg hover:bg-white/90 transition-all hover:scale-105 shadow-lg"
          >
            Ücretsiz Dene ✨
          </Link>
          <Link
            href="/demo"
            className="border-2 border-white/40 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/10 transition-all"
          >
            Demo Gör 👀
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white/10 backdrop-blur-sm py-20 px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-16">
          Nasıl Çalışır?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            {
              step: "1",
              title: "Oluştur",
              desc: "Fotoğraflarınızı yükleyin, metinlerinizi yazın ve müzik seçin.",
              emoji: "🎨",
            },
            {
              step: "2",
              title: "Satın Al",
              desc: "Uygun fiyatlı paketlerimizden birini seçip güvenli ödeme yapın.",
              emoji: "💳",
            },
            {
              step: "3",
              title: "Paylaş",
              desc: "Size özel URL ile hediyenizi anında paylaşın!",
              emoji: "🎁",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-8 text-center hover:bg-white/20 transition-all"
            >
              <div className="text-5xl mb-4">{item.emoji}</div>
              <div className="text-sm font-semibold text-pink-200 mb-2">
                Adım {item.step}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                {item.title}
              </h3>
              <p className="text-white/70">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
          Paketler
        </h2>
        <p className="text-white/60 text-center mb-16">
          İhtiyacınıza uygun paketi seçin
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Standart */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-2">
              Standart Paket
            </h3>
            <div className="text-4xl font-bold text-white mb-1">
              149<span className="text-lg">₺</span>
            </div>
            <p className="text-white/50 text-sm mb-6">Tek seferlik ödeme</p>
            <ul className="space-y-3 text-white/80 mb-8">
              {[
                "1 yıl boyunca yayında",
                "3-12 arası slide",
                "Fotoğraf & müzik desteği",
                "Özel URL",
                "Mobil uyumlu",
                "Şifre koruma",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="text-green-400">✓</span> {item}
                </li>
              ))}
            </ul>
            <Link
              href="/sign-up"
              className="block w-full text-center bg-white/20 text-white px-6 py-3 rounded-full font-semibold hover:bg-white/30 transition-colors"
            >
              Başla
            </Link>
          </div>

          {/* Premium */}
          <div className="bg-gradient-to-br from-amber-400/20 to-orange-500/20 backdrop-blur-md rounded-2xl p-8 border-2 border-amber-400/50 relative">
            <div className="absolute -top-3 right-6 bg-amber-400 text-black text-xs font-bold px-3 py-1 rounded-full">
              POPÜLER
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Premium Paket
            </h3>
            <div className="text-4xl font-bold text-white mb-1">
              249<span className="text-lg">₺</span>
            </div>
            <p className="text-white/50 text-sm mb-6">Tek seferlik ödeme</p>
            <ul className="space-y-3 text-white/80 mb-8">
              {[
                "Standart paketteki her şey",
                "Siteyi ZIP olarak indirme",
                "Offline çalışma desteği",
                "Süresiz erişim (indirdiğiniz kopya)",
                "Öncelikli destek",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="text-amber-400">✓</span> {item}
                </li>
              ))}
            </ul>
            <Link
              href="/sign-up"
              className="block w-full text-center bg-amber-400 text-black px-6 py-3 rounded-full font-bold hover:bg-amber-300 transition-colors"
            >
              Premium Başla ⭐
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-6 text-center text-white/40 text-sm">
        <p>&copy; 2026 LoveSite. Tüm hakları saklıdır.</p>
      </footer>
    </div>
  );
}
