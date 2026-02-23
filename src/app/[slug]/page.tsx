import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getServiceSupabase } from "@/lib/supabase";
import type { SiteRow, MusicRow } from "@/lib/types";
import { siteRowToData, musicRowToTrack } from "@/lib/mappers";
import SitePageClient from "./SitePageClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Dinamik metadata (SEO)
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = getServiceSupabase();
  const { data } = await supabase
    .from("sites")
    .select("title, recipient_name, slides")
    .eq("slug", slug)
    .single();

  if (!data) {
    return { title: "Site Bulunamadı" };
  }

  return {
    title: `${data.recipient_name}'e Özel ❤️`,
    description: data.title,
    openGraph: {
      title: `${data.recipient_name}'e Özel ❤️`,
      description: data.title,
      type: "website",
    },
  };
}

export default async function SitePage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = getServiceSupabase();

  // Site verisini çek
  const { data: siteRow, error } = await supabase
    .from("sites")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !siteRow) {
    notFound();
  }

  const site = siteRow as SiteRow;

  // Status kontrolü (dev modda atlat)
  const isDev = process.env.NODE_ENV === "development";
  if (site.status !== "active" && !isDev) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white text-center p-6">
        <div>
          <h1 className="text-3xl font-bold mb-4">🚧</h1>
          <h2 className="text-xl font-semibold mb-2">Bu site henüz aktif değil</h2>
          <p className="text-gray-400">Site sahibi ödeme işlemini tamamladığında erişilebilir olacaktır.</p>
        </div>
      </div>
    );
  }

  // Süre kontrolü (premium için expires_at null olabilir, bu durumda süresiz geçerli)
  const expirationDate = typeof site.expires_at === "string" ? new Date(site.expires_at) : null;
  const hasValidExpirationDate =
    expirationDate !== null && !Number.isNaN(expirationDate.getTime());
  const isExpired = hasValidExpirationDate && expirationDate < new Date();
  if (isExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white text-center p-6">
        <div>
          <h1 className="text-3xl font-bold mb-4">⏰</h1>
          <h2 className="text-xl font-semibold mb-2">Bu sitenin süresi dolmuş</h2>
          <p className="text-gray-400">
            Site sahibi premium pakete sahipse siteyi indirmiş olabilir.
          </p>
        </div>
      </div>
    );
  }

  // Müzik verisini çek
  let musicTrack = undefined;
  if (site.music_id) {
    const { data: musicRow } = await supabase
      .from("music_library")
      .select("*")
      .eq("id", site.music_id)
      .single();

    if (musicRow) {
      musicTrack = musicRowToTrack(musicRow as MusicRow);
    }
  }

  const siteData = siteRowToData(site, musicTrack);

  return (
    <SitePageClient
      siteData={siteData}
      isPrivate={site.is_private}
      slug={slug}
      firstSlideGradient={site.slides[0]?.gradient || { from: "#2b0a3d", to: "#511a68" }}
    />
  );
}
