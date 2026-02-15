import type { SlideData } from "@/lib/types";
import TemplateView from "@/components/template/TemplateView";

// Demo sayfası — şablonun nasıl göründüğünü gösteren sabit verili sayfa
const DEMO_SLIDES: SlideData[] = [
  {
    order: 1,
    type: "cover",
    heading: "Demo",
    description: "Seninle başlayan hikayemiz...",
    gradient: { from: "#2b0a3d", to: "#511a68" },
  },
  {
    order: 2,
    type: "photo",
    heading: "İlk fotoğrafımız...",
    description: "Bu an her şeyin başladığı yerdi.",
    gradient: { from: "#3E2723", to: "#5D4037" },
    imageUrl: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400&h=400&fit=crop",
  },
  {
    order: 3,
    type: "text",
    heading: "Sana özel bir not...",
    description: "Her gün seninle geçirdiğim anlar, hayatımın en güzel sayfaları.",
    gradient: { from: "#880E4F", to: "#C2185B" },
  },
  {
    order: 4,
    type: "collage",
    heading: "Maceralarımız...",
    description: "Her yerde birlikte, her an birlikte.",
    gradient: { from: "#EF6C00", to: "#FFA726" },
    collageUrls: [
      "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=300&h=300&fit=crop",
      "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=300&h=300&fit=crop",
      "https://images.unsplash.com/photo-1501901609772-df0848060b33?w=300&h=300&fit=crop",
    ],
  },
  {
    order: 5,
    type: "finale",
    heading: "Seni çok seviyorum! ❤️",
    description: "Bu hikaye daha yeni başlıyor...",
    gradient: { from: "#BF360C", to: "#E64A19" },
    imageUrl: "https://images.unsplash.com/photo-1518568814500-bf0f8d125f46?w=400&h=400&fit=crop",
    handPointerText: "👈 En güzel kare! 😍",
  },
];

export default function DemoPage() {
  return (
    <div className="relative">
      {/* Anasayfa butonu */}
      <a
        href="/"
        className="fixed top-4 left-4 z-[200] bg-white/90 backdrop-blur-sm text-gray-800 px-4 py-2 rounded-lg shadow-lg hover:bg-white transition-all text-sm font-semibold border border-gray-200"
      >
        ← Anasayfa
      </a>
      <TemplateView
        recipientName="Demo"
        slides={DEMO_SLIDES}
        musicTrack={null}
      />
    </div>
  );
}
