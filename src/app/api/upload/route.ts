import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getServiceSupabase } from "@/lib/supabase";

// POST — Fotoğraf yükle
export async function POST(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const siteId = formData.get("siteId") as string;

    if (!file) {
      return NextResponse.json({ error: "Dosya gerekli" }, { status: 400 });
    }

    // Dosya boyutu kontrolü (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Dosya boyutu 5MB'dan küçük olmalı" },
        { status: 400 }
      );
    }

    // Dosya tipi kontrolü
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Sadece JPG, PNG ve WebP dosyaları desteklenir" },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Dosya adı oluştur
    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `${userId}/${siteId || "temp"}/${Date.now()}.${ext}`;

    // Supabase Storage'a yükle
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const { data, error } = await supabase.storage
      .from("user-uploads")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Public URL al
    const { data: urlData } = supabase.storage
      .from("user-uploads")
      .getPublicUrl(data.path);

    return NextResponse.json({
      url: urlData.publicUrl,
      path: data.path,
    });
  } catch {
    return NextResponse.json({ error: "Yükleme hatası" }, { status: 500 });
  }
}
