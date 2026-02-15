import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";

// GET — Slug benzersizlik kontrolü
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({ error: "Slug gerekli" }, { status: 400 });
  }

  const supabase = getServiceSupabase();
  const { data } = await supabase
    .from("sites")
    .select("id")
    .eq("slug", slug)
    .single();

  return NextResponse.json({ available: !data });
}
