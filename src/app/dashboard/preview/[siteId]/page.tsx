import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getServiceSupabase } from "@/lib/supabase";
import type { SiteRow, MusicRow } from "@/lib/types";
import { siteRowToData, musicRowToTrack } from "@/lib/mappers";
import PreviewClient from "./PreviewClient";

interface PageProps {
  params: Promise<{ siteId: string }>;
}

export default async function PreviewPage({ params }: PageProps) {
  const { siteId } = await params;
  const { userId } = await auth();

  if (!userId) notFound();

  const supabase = getServiceSupabase();

  const { data: siteRow, error } = await supabase
    .from("sites")
    .select("*")
    .eq("id", siteId)
    .eq("user_id", userId)
    .single();

  if (error || !siteRow) notFound();

  const site = siteRow as SiteRow;

  let musicTrack = undefined;
  if (site.music_id) {
    const { data: musicRow } = await supabase
      .from("music_library")
      .select("*")
      .eq("id", site.music_id)
      .single();
    if (musicRow) musicTrack = musicRowToTrack(musicRow as MusicRow);
  }

  const siteData = siteRowToData(site, musicTrack);

  return <PreviewClient siteData={siteData} />;
}
