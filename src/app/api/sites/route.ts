import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import bcrypt from "bcryptjs";
import { getServiceSupabase } from "@/lib/supabase";
import { siteFormSchema } from "@/lib/validators";

// GET — Kullanıcının sitelerini getir (tek site veya tümü)
export async function GET(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const siteId = searchParams.get("siteId");
  const supabase = getServiceSupabase();

  // Tek site getir
  if (siteId) {
    const { data, error } = await supabase
      .from("sites")
      .select("*")
      .eq("id", siteId)
      .eq("user_id", userId)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Site bulunamadı" }, { status: 404 });
    }

    return NextResponse.json({ site: data });
  }

  // Tüm siteleri getir
  const { data, error } = await supabase
    .from("sites")
    .select("id, slug, title, recipient_name, template_id, status, package_type, is_private, created_at, updated_at, expires_at, slides")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Sites GET error:", error.message);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }

  return NextResponse.json({ sites: data });
}

// POST — Yeni site oluştur
export async function POST(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = siteFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { title, recipientName, slug, templateId, slides, musicId, isPrivate, password } = parsed.data;
    const supabase = getServiceSupabase();

    // Slug benzersizlik kontrolü
    const { data: existing } = await supabase
      .from("sites")
      .select("id")
      .eq("slug", slug)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "Bu URL zaten kullanılıyor" },
        { status: 409 }
      );
    }

    // Şifre hash'le
    let passwordHash = null;
    if (isPrivate && password) {
      passwordHash = await bcrypt.hash(password, 10);
    }

    // Slide'lara order ekle
    const orderedSlides = slides.map((slide, index) => ({
      ...slide,
      order: index + 1,
    }));

    // Siteyi kaydet — her zaman taslak olarak başlar
    const { data: site, error } = await supabase
      .from("sites")
      .insert({
        user_id: userId,
        slug,
        title,
        recipient_name: recipientName,
        template_id: templateId || "valentines",
        slides: orderedSlides,
        music_id: musicId || null,
        status: "draft",
        package_type: "standard",
        is_private: isPrivate,
        password_hash: passwordHash,
        expires_at: null,
      })
      .select()
      .single();

    if (error) {
      console.error("Sites POST error:", error.message);
      return NextResponse.json({ error: "Site oluşturulamadı" }, { status: 500 });
    }

    return NextResponse.json({ site }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

// PUT — Siteyi güncelle
export async function PUT(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { siteId: bodyId, id: altId } = body;
    const siteId = bodyId || altId;

    // Strict allowlist — prevent mass assignment of status, package_type, user_id, etc.
    const ALLOWED_FIELDS = ["title", "recipientName", "slug", "templateId", "slides", "musicId", "isPrivate", "password", "confirmPassword"];
    const updateData: Record<string, unknown> = {};
    for (const key of ALLOWED_FIELDS) {
      if (body[key] !== undefined) updateData[key] = body[key];
    }

    if (!siteId) {
      return NextResponse.json({ error: "Site ID gerekli" }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    // Sahiplik kontrolü + canlı site düzenleme süresi kontrolü
    const { data: existing } = await supabase
      .from("sites")
      .select("user_id, status, expires_at")
      .eq("id", siteId)
      .single();

    if (!existing || existing.user_id !== userId) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
    }

    // Sadece canlı sitelerde (active) expires_at bazlı düzenleme limiti uygulanır.
    if (existing.status === "active" && existing.expires_at) {
      const expiresAt = new Date(existing.expires_at);
      if (!Number.isNaN(expiresAt.getTime()) && expiresAt < new Date()) {
        return NextResponse.json(
          { error: "Canlı sitenin yayın süresi dolduğu için düzenleme yapılamaz." },
          { status: 403 }
        );
      }
    }

    // Eğer şifre güncelleniyorsa hash'le
    if (updateData.password) {
      updateData.password_hash = await bcrypt.hash(String(updateData.password), 10);
      delete updateData.password;
      delete updateData.confirmPassword;
    }

    // Slides varsa order ekle
    if (updateData.slides && Array.isArray(updateData.slides)) {
      updateData.slides = (updateData.slides as Record<string, unknown>[]).map((slide, index) => ({
        ...slide,
        order: index + 1,
      }));
    }

    // camelCase → snake_case dönüşümü
    const dbUpdate: Record<string, unknown> = {};
    if (updateData.title !== undefined) dbUpdate.title = updateData.title;
    if (updateData.recipientName !== undefined) dbUpdate.recipient_name = updateData.recipientName;
    if (updateData.slug !== undefined) dbUpdate.slug = updateData.slug;
    if (updateData.templateId !== undefined) dbUpdate.template_id = updateData.templateId;
    if (updateData.slides !== undefined) dbUpdate.slides = updateData.slides;
    if (updateData.musicId !== undefined) dbUpdate.music_id = updateData.musicId;
    if (updateData.isPrivate !== undefined) dbUpdate.is_private = updateData.isPrivate;
    if (updateData.password_hash !== undefined) dbUpdate.password_hash = updateData.password_hash;
    dbUpdate.updated_at = new Date().toISOString();

    const { data: site, error } = await supabase
      .from("sites")
      .update(dbUpdate)
      .eq("id", siteId)
      .select()
      .single();

    if (error) {
      console.error("Sites PUT error:", error.message);
      return NextResponse.json({ error: "Güncelleme başarısız" }, { status: 500 });
    }

    return NextResponse.json({ site });
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

// DELETE — Siteyi sil
export async function DELETE(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const siteId = searchParams.get("siteId");

  if (!siteId) {
    return NextResponse.json({ error: "Site ID gerekli" }, { status: 400 });
  }

  const supabase = getServiceSupabase();

  // Sahiplik kontrolü
  const { data: existing } = await supabase
    .from("sites")
    .select("user_id")
    .eq("id", siteId)
    .single();

  if (!existing || existing.user_id !== userId) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  }

  const { error } = await supabase.from("sites").delete().eq("id", siteId);

  if (error) {
    console.error("Sites DELETE error:", error.message);
    return NextResponse.json({ error: "Silme başarısız" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
