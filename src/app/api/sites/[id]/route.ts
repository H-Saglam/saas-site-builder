import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getServiceSupabase } from "@/lib/supabase";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Site ID gerekli" }, { status: 400 });
  }

  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("sites")
    .select("id, user_id, status")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Site bulunamadı" }, { status: 404 });
  }

  if (data.user_id !== userId) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  }

  return NextResponse.json({
    site: {
      id: data.id,
      status: data.status,
    },
  });
}
