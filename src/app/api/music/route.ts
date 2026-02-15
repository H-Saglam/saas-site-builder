import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import type { MusicRow } from "@/lib/types";
import { musicRowToTrack } from "@/lib/types";

// GET — Tüm müzikleri getir (opsiyonel kategori filtresi)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  const supabase = getServiceSupabase();

  let query = supabase.from("music_library").select("*").order("title");

  if (category) {
    query = query.eq("category", category);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const tracks = (data as MusicRow[]).map(musicRowToTrack);

  return NextResponse.json({ tracks });
}
