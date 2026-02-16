import Link from "next/link";
import { TEMPLATES } from "@/lib/templates";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 font-[var(--font-outfit)]">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-5 md:px-12 border-b border-zinc-800/50">
        <div className="text-xl font-bold text-white tracking-tight">💝 Özel Bir Anı</div>
        <div className="flex items-center gap-4">
          <Link
            href="/sign-in"
            className="text-zinc-400 hover:text-white transition-colors text-sm"
          >
            Giriş Yap
          </Link>
          <Link
            href="/sign-up"
            className="bg-white text-zinc-900 px-5 py-2 rounded-lg font-semibold text-sm hover:bg-zinc-100 transition-colors"
          >
            Hemen Başla
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-24 md:py-36">
        <div className="inline-flex items-center gap-2 bg-zinc-800/50 text-zinc-400 text-xs font-medium px-4 py-1.5 rounded-full mb-8 border border-zinc-700/50">
          ✨ Sevdiklerinize özel dijital hediyeler
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-white max-w-3xl leading-tight mb-6 tracking-tight">
          Anılarınızı
          <br />
          <span className="text-rose-400">Dijital Hikayelere</span> Dönüştürün
        </h1>
        <p className="text-lg md:text-xl text-zinc-400 max-w-xl mb-10 leading-relaxed">
          Fotoğraflarınız, müzikleriniz ve özel mesajlarınızla Instagram Stories
          tarzında interaktif hikaye siteleri tasarlayın.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/sign-up"
            className="bg-white text-zinc-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-zinc-100 transition-all shadow-lg shadow-white/10"
          >
            Ücretsiz Dene ✨
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 border-t border-zinc-800/50">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4 tracking-tight">
          Nasıl Çalışır?
        </h2>
        <p className="text-zinc-500 text-center mb-16">3 adımda hazır</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
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
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center hover:border-zinc-700 transition-all"
            >
              <div className="text-5xl mb-5">{item.emoji}</div>
              <div className="text-xs font-semibold text-rose-400 mb-2 tracking-wider uppercase">
                Adım {item.step}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                {item.title}
              </h3>
              <p className="text-zinc-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Templates Showcase */}
      <section className="py-24 px-6 border-t border-zinc-800/50">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4 tracking-tight">
          Şablonlarımız
        </h2>
        <p className="text-zinc-500 text-center mb-16 max-w-lg mx-auto">
          Farklı anlar için tasarlanmış şablonlar. Birini seçin, kişiselleştirin ve paylaşın.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {TEMPLATES.map((tpl) => (
            <div
              key={tpl.id}
              className={`group relative rounded-2xl overflow-hidden border transition-all duration-300 ${tpl.isAvailable
                ? "border-zinc-800 hover:border-zinc-600 hover:shadow-xl hover:-translate-y-1"
                : "border-zinc-800/50 opacity-60"
                }`}
            >
              {/* Gradient Preview */}
              <div
                className="h-36 flex items-center justify-center relative"
                style={{
                  background: `linear-gradient(135deg, ${tpl.gradient.from}, ${tpl.gradient.to})`,
                }}
              >
                <span className="text-5xl drop-shadow-lg">{tpl.emoji}</span>

                {!tpl.isAvailable && (
                  <div className="absolute top-3 right-3 bg-zinc-900/80 backdrop-blur-sm text-zinc-400 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                    Yakında
                  </div>
                )}

                {tpl.isAvailable && (
                  <div className="absolute top-3 right-3 bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                    Hazır
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-5 bg-zinc-900">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-white text-sm">{tpl.name}</h3>
                  <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">
                    {tpl.category}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  {tpl.description}
                </p>
                {tpl.isAvailable && (
                  <Link
                    href="/demo"
                    className="mt-4 block text-center bg-white/10 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-white/20 transition-colors"
                  >
                    Demo Gör 👀
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-6 border-t border-zinc-800/50">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4 tracking-tight">
          Paketler
        </h2>
        <p className="text-zinc-500 text-center mb-16">
          İhtiyacınıza uygun paketi seçin
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Standart */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-white mb-2">
              Standart Paket
            </h3>
            <div className="text-4xl font-bold text-white mb-1">
              149<span className="text-lg text-zinc-500">₺</span>
            </div>
            <p className="text-zinc-500 text-sm mb-6">Tek seferlik ödeme</p>
            <ul className="space-y-3 text-zinc-400 text-sm mb-8">
              {[
                "1 yıl boyunca yayında",
                "3-12 arası slide",
                "Fotoğraf & müzik desteği",
                "Özel URL",
                "Mobil uyumlu",
                "Şifre koruma",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span> {item}
                </li>
              ))}
            </ul>
            <Link
              href="/sign-up"
              className="block w-full text-center bg-zinc-800 text-white px-6 py-3 rounded-xl font-semibold hover:bg-zinc-700 transition-colors"
            >
              Başla
            </Link>
          </div>

          {/* Premium */}
          <div className="bg-zinc-900 border-2 border-rose-500/30 rounded-2xl p-8 relative">
            <div className="absolute -top-3 right-6 bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              POPÜLER
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Premium Paket
            </h3>
            <div className="text-4xl font-bold text-white mb-1">
              249<span className="text-lg text-zinc-500">₺</span>
            </div>
            <p className="text-zinc-500 text-sm mb-6">Tek seferlik ödeme</p>
            <ul className="space-y-3 text-zinc-400 text-sm mb-8">
              {[
                "Standart paketteki her şey",
                "Siteyi ZIP olarak indirme",
                "Offline çalışma desteği",
                "Süresiz erişim (indirdiğiniz kopya)",
                "Öncelikli destek",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="text-rose-400">✓</span> {item}
                </li>
              ))}
            </ul>
            <Link
              href="/sign-up"
              className="block w-full text-center bg-rose-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-rose-600 transition-colors"
            >
              Premium Başla ⭐
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50 py-8 px-6 text-center text-zinc-600 text-sm">
        <p>&copy; 2026 Özel Bir Anı. Tüm hakları saklıdır.</p>
      </footer>
    </div>
  );
}
