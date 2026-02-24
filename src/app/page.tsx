"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { TEMPLATES } from "@/lib/templates";
import AnimatedBackground from "@/components/AnimatedBackground";
import DiagonalLinesBackground from "@/components/HeartScrollAnimation";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const SHOW_DOT_PARTICLES = false;
type ThemeMode = "dark" | "light";

const STEP_ICON_THEME: Record<
  ThemeMode,
  { from: string; via: string; to: string; shadow: string; heartShadow: string; inactiveStroke: string }
> = {
  dark: {
    from: "#a855f7",
    via: "#db2777",
    to: "#f43f5e",
    shadow: "rgba(219, 39, 119, 0.4)",
    heartShadow: "rgba(219, 39, 119, 0.5)",
    inactiveStroke: "#a1a1aa",
  },
  light: {
    from: "#6366F1",
    via: "#6366F1",
    to: "#6366F1",
    shadow: "rgba(99, 102, 241, 0.32)",
    heartShadow: "rgba(99, 102, 241, 0.32)",
    inactiveStroke: "#6366F1",
  },
};

function RevealSection({
  children,
  className = "",
  delay = "delay-0",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: string;
}) {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.1 });
  return (
    <div className="overflow-hidden">
      <div
        ref={ref}
        className={`transition-all duration-1000 ease-out ${delay} ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        } ${className}`}
      >
        {children}
      </div>
    </div>
  );
}

function RevealCard({
  children,
  className = "",
  delayMs = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
}) {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.1 });
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
      style={{ transitionDelay: `${delayMs}ms` }}
    >
      {children}
    </div>
  );
}

function CreateIcon({ theme }: { theme: ThemeMode }) {
  const colors = STEP_ICON_THEME[theme];
  return (
    <svg
      className="w-14 h-14"
      viewBox="0 0 24 24"
      fill="none"
      style={{ filter: `drop-shadow(0 4px 15px ${colors.shadow})` }}
    >
      <defs>
        <linearGradient id="createIconGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={colors.from} />
          <stop offset="50%" stopColor={colors.via} />
          <stop offset="100%" stopColor={colors.to} />
        </linearGradient>
      </defs>
      <rect
        x="2"
        y="4"
        width="20"
        height="16"
        rx="3"
        fill="url(#createIconGrad)"
        fillOpacity="0.15"
        stroke="url(#createIconGrad)"
        strokeWidth="1.5"
      />
      <rect
        x="4"
        y="6"
        width="16"
        height="12"
        rx="1"
        stroke="url(#createIconGrad)"
        strokeWidth="1"
        fill="none"
        opacity="0.6"
      />
      <path
        d="M14.5 17.5l5.5-5.5c.8-.8.8-2 0-2.8-.8-.8-2-.8-2.8 0l-5.5 5.5-1.5 4.5 4.5-1.5z"
        fill="url(#createIconGrad)"
      />
      <path d="M14.5 17.5l2.5-2.5" stroke={theme === "light" ? colors.from : "#09090b"} strokeWidth="1.5" />
    </svg>
  );
}

function BuyIcon({ theme }: { theme: ThemeMode }) {
  const colors = STEP_ICON_THEME[theme];
  return (
    <svg
      className="w-14 h-14"
      viewBox="0 0 24 24"
      fill="none"
      style={{ filter: `drop-shadow(0 4px 15px ${colors.shadow})` }}
    >
      <defs>
        <linearGradient id="buyIconGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={colors.from} />
          <stop offset="50%" stopColor={colors.via} />
          <stop offset="100%" stopColor={colors.to} />
        </linearGradient>
      </defs>
      <rect
        x="2"
        y="5"
        width="20"
        height="14"
        rx="3"
        fill="url(#buyIconGrad)"
        fillOpacity="0.15"
        stroke="url(#buyIconGrad)"
        strokeWidth="1.5"
      />
      <line x1="2" y1="10" x2="22" y2="10" stroke="url(#buyIconGrad)" strokeWidth="2" opacity="0.8" />
      <rect x="5" y="14" width="4" height="2.5" rx="0.5" fill="url(#buyIconGrad)" />
      <line
        x1="12"
        y1="15.5"
        x2="19"
        y2="15.5"
        stroke="url(#buyIconGrad)"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  );
}

function AnimatedStepIcon({
  type,
  theme,
  delayMs = 0,
}: {
  type: "create" | "buy";
  theme: ThemeMode;
  delayMs?: number;
}) {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.25 });
  const [activated, setActivated] = useState(false);

  useEffect(() => {
    if (isVisible && !activated) {
      const timer = setTimeout(() => setActivated(true), delayMs);
      return () => clearTimeout(timer);
    }
  }, [isVisible, activated, delayMs]);

  return (
    <div
      ref={ref}
      className={`inline-flex items-center justify-center ${
        activated ? "animate-tiny-jump" : ""
      }`}
    >
      {type === "create" ? <CreateIcon theme={theme} /> : <BuyIcon theme={theme} />}
    </div>
  );
}

function AnimatedHeart({ theme }: { theme: ThemeMode }) {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.3 });
  const [activated, setActivated] = useState(false);
  const colors = STEP_ICON_THEME[theme];

  useEffect(() => {
    if (isVisible && !activated) {
      // Delay to let the RevealCard slide-in finish first
      const timer = setTimeout(() => setActivated(true), 600);
      return () => clearTimeout(timer);
    }
  }, [isVisible, activated]);

  return (
    <div ref={ref}>
      <svg
        className={`w-12 h-12 ${activated ? "animate-insta-pop" : ""}`}
        viewBox="0 0 24 24"
        style={activated ? { filter: `drop-shadow(0 4px 15px ${colors.heartShadow})` } : undefined}
      >
        <defs>
          <linearGradient id="purplePinkGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colors.from} />
            <stop offset="50%" stopColor={colors.via} />
            <stop offset="100%" stopColor={colors.to} />
          </linearGradient>
        </defs>
        <path
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          fill={activated ? "url(#purplePinkGrad)" : "none"}
          stroke={activated ? "none" : colors.inactiveStroke}
          strokeWidth={activated ? 0 : 1.5}
        />
      </svg>
    </div>
  );
}

export default function Home() {
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const heroAccentClass =
    theme === "light"
      ? "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 bg-clip-text text-transparent"
      : "bg-gradient-to-r from-purple-500 via-pink-600 to-rose-500 bg-clip-text text-transparent";

  useEffect(() => {
    const stored = window.localStorage.getItem("themePreference");
    if (stored === "light" || stored === "dark") {
      setTheme(stored);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(prefersDark ? "dark" : "light");
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem("themePreference", theme);
  }, [theme]);

  const toggleTheme = () => {
    document.documentElement.classList.add("theme-transitioning");
    setTheme(theme === "dark" ? "light" : "dark");
    setTimeout(() => {
      document.documentElement.classList.remove("theme-transitioning");
    }, 350);
  };

  return (
    <div className="home-page relative min-h-screen bg-zinc-950 font-[var(--font-outfit)]">
      {SHOW_DOT_PARTICLES && <AnimatedBackground />}
      <DiagonalLinesBackground />

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-5 md:px-12 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-sm">
          <div className="text-xl font-bold text-white tracking-tight">
            💝 Özel Bir Anı
          </div>
          <div className="flex items-center gap-4">
            <button
              id="themeToggle"
              type="button"
              role="switch"
              aria-checked={theme === "dark"}
              aria-label="Tema değiştir"
              onClick={toggleTheme}
              className="relative inline-flex h-7 w-14 items-center rounded-full border border-zinc-700 bg-zinc-900/80 transition-colors hover:border-zinc-500"
            >
              {/* Sun icon */}
              <svg
                className="absolute left-1.5 h-3.5 w-3.5 text-amber-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
              {/* Moon icon */}
              <svg
                className="absolute right-1.5 h-3.5 w-3.5 text-blue-300"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
              {/* Sliding circle */}
              <span
                className="absolute h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-300 ease-in-out"
                style={{
                  transform: theme === "dark" ? "translateX(30px)" : "translateX(4px)",
                }}
              />
            </button>
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
        <RevealSection>
          <section className="flex flex-col items-center justify-center text-center px-6 py-24 md:py-36">
            <div className="inline-flex items-center gap-2 bg-zinc-800/50 text-zinc-400 text-xs font-medium px-4 py-1.5 rounded-full mb-8 border border-zinc-700/50">
              ✨ Sevdiklerinize özel dijital hediyeler
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white max-w-3xl leading-tight mb-6 tracking-tight">
              Anılarınızı
              <br />
              <span className={heroAccentClass}>Dijital Hikayelere</span>{" "}
              Dönüştürün
            </h1>
            <p className="text-lg md:text-xl text-zinc-400 max-w-xl mb-10 leading-relaxed">
              Fotoğraflarınız, müzikleriniz ve özel mesajlarınızla Instagram
              Stories tarzında interaktif hikaye siteleri tasarlayın.
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
        </RevealSection>

        {/* How It Works */}
        <RevealSection>
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
                },
                {
                  step: "2",
                  title: "Satın Al",
                  desc: "Uygun fiyatlı paketlerimizden birini seçip güvenli ödeme yapın.",
                },
                {
                  step: "3",
                  title: "Paylaş",
                  desc: "Size özel URL ile hediyenizi anında paylaşın!",
                },
              ].map((item, i) => (
                <RevealCard
                  key={item.step}
                  delayMs={i * 150}
                  className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-2xl p-8 text-center hover:border-zinc-700 transition-all"
                >
                  <div className="text-5xl mb-5 flex items-center justify-center">
                    {item.step === "3" ? (
                      <AnimatedHeart theme={theme} />
                    ) : item.step === "1" ? (
                      <AnimatedStepIcon type="create" theme={theme} delayMs={200} />
                    ) : (
                      <AnimatedStepIcon type="buy" theme={theme} delayMs={260} />
                    )}
                  </div>
                  <div className="text-xs font-semibold text-rose-400 mb-2 tracking-wider uppercase">
                    Adım {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    {item.title}
                  </h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </RevealCard>
              ))}
            </div>
          </section>
        </RevealSection>

        {/* Templates Showcase */}
        <RevealSection>
          <section className="py-24 px-6 border-t border-zinc-800/50">
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4 tracking-tight">
              Şablonlarımız
            </h2>
            <p className="text-zinc-500 text-center mb-16 max-w-lg mx-auto">
              Farklı anlar için tasarlanmış şablonlar. Birini seçin,
              kişiselleştirin ve paylaşın.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
              {TEMPLATES.map((tpl, i) => (
                <RevealCard
                  key={tpl.id}
                  delayMs={i * 100}
                  className={`group relative rounded-2xl overflow-hidden border transition-all duration-300 ${
                    tpl.isAvailable
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
                  <div className="p-5 bg-zinc-900/80 backdrop-blur-md">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-white text-sm">
                        {tpl.name}
                      </h3>
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
                </RevealCard>
              ))}
            </div>
          </section>
        </RevealSection>

        {/* Pricing */}
        <RevealSection>
          <section className="py-24 px-6 border-t border-zinc-800/50">
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4 tracking-tight">
              Paketler
            </h2>
            <p className="text-zinc-500 text-center mb-16">
              İhtiyacınıza uygun paketi seçin
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {/* Standart */}
              <RevealCard
                delayMs={0}
                className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-2xl p-8"
              >
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
              </RevealCard>

              {/* Premium */}
              <RevealCard
                delayMs={150}
                className="bg-zinc-900/80 backdrop-blur-md border-2 border-rose-500/30 rounded-2xl p-8 relative"
              >
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
              </RevealCard>
            </div>
          </section>
        </RevealSection>

        {/* Footer */}
        <footer className="border-t border-zinc-800/50 py-8 px-6 text-center text-zinc-600 text-sm">
          <p>&copy; 2026 Özel Bir Anı. Tüm hakları saklıdır.</p>
        </footer>
      </div>
    </div>
  );
}
