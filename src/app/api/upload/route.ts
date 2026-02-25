import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getServiceSupabase } from "@/lib/supabase";
import { isWebP } from "@/lib/file-validation";

// POST — Fotoğraf yükle
export async function POST(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const siteId = formData.get("siteId") as string;

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Dosya gerekli" }, { status: 400 });
    }

    // Dosya boyutu kontrolü (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Dosya boyutu 5MB'dan küçük olmalı" },
        { status: 400 }
      );
    }

    // Dosya tipi kontrolü (istemci tarafında WebP'ye çevrilmiş olmalı)
    if (file.type !== "image/webp") {
      return NextResponse.json(
        { error: "Yükleme için WebP formatı gerekli" },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Dosya adı oluştur — WebP uzantısı ve güvenli siteId
    const safeSiteId = (siteId || "temp").replace(/[^a-zA-Z0-9_-]/g, "");
    const fileName = `${userId}/${safeSiteId}/${Date.now()}.webp`;

    // Supabase Storage'a yükle
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Magic bytes check: RIFF....WEBP
    const validWebP = isWebP(buffer);

    if (!validWebP) {
      return NextResponse.json(
        { error: "Geçersiz dosya içeriği. Sadece geçerli WebP yüklenebilir" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.storage
      .from("user-uploads")
      .upload(fileName, buffer, {
        contentType: "image/webp",
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
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Yükleme hatası" }, { status: 500 });
  }
}
