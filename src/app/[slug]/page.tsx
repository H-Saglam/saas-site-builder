import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { getServiceSupabase } from "@/lib/supabase";
import type { SiteRow, MusicRow, SlideGradient } from "@/lib/types";
import { siteRowToData, musicRowToTrack } from "@/lib/types";
import PasswordGate from "@/components/template/PasswordGate";
import SitePageClient from "./SitePageClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const DEFAULT_GATE_GRADIENT: SlideGradient = { from: "#2b0a3d", to: "#511a68" };

function getVerifySecret(): Uint8Array | null {
  const secret = process.env.VERIFY_SECRET;
  if (!secret || secret.length < 32) return null;
  return new TextEncoder().encode(secret);
}

async function isVerifiedForSlug(slug: string): Promise<boolean> {
  const secret = getVerifySecret();
  if (!secret) return false;

  const cookieStore = await cookies();
  const token = cookieStore.get(`site-verify-${slug}`)?.value;
  if (!token) return false;

  try {
    const { payload } = await jwtVerify(token, secret);
    return payload.verified === true && payload.slug === slug;
  } catch {
    return false;
  }
}

// Dinamik metadata (SEO)
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = getServiceSupabase();
  const { data } = await supabase
    .from("sites")
    .select("title, recipient_name, is_private, status")
    .eq("slug", slug)
    .single();

  if (!data) {
    return { title: "Site Bulunamadı" };
  }

  // Private/inactive sitelerin içeriğini metadata üzerinden ifşa etme.
  if (data.is_private || data.status !== "active") {
    return {
      title: "Özel Site",
      description: "Bu sayfa erişim doğrulaması gerektirir.",
    };
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

  // Önce sadece erişim kararına yetecek alanları çek.
  const { data: accessRow, error: accessError } = await supabase
    .from("sites")
    .select("id, status, is_private, expires_at, music_id")
    .eq("slug", slug)
    .single();

  if (accessError || !accessRow) {
    notFound();
  }

  // Status kontrolü (dev modda atlat)
  const isDev = process.env.NODE_ENV === "development";
  if (accessRow.status !== "active" && !isDev) {
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
  const expirationDate = typeof accessRow.expires_at === "string"
    ? new Date(accessRow.expires_at)
    : null;
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

  if (accessRow.is_private) {
    const verified = await isVerifiedForSlug(slug);
    if (!verified) {
      return <PasswordGate gradient={DEFAULT_GATE_GRADIENT} slug={slug} />;
    }
  }

  // Erişim doğrulandıktan sonra tam içeriği çek.
  const { data: siteRow, error } = await supabase
    .from("sites")
    .select("*")
    .eq("id", accessRow.id)
    .single();

  if (error || !siteRow) {
    notFound();
  }

  const site = siteRow as SiteRow;

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

  return <SitePageClient siteData={siteData} />;
}
