import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import bcrypt from "bcryptjs";
import { getServiceSupabase } from "@/lib/supabase";
import { siteFormSchema, siteUpdateSchema } from "@/lib/validators";

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
    .select("id, slug, title, recipient_name, status, package_type, is_private, created_at, updated_at, expires_at, slides")
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

    const { title, recipientName, slug, slides, musicId, isPrivate, password } = parsed.data;
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
        slides: orderedSlides,
        music_id: musicId || null,
        status: "draft",
        package_type: "standard",
        is_private: isPrivate,
        password_hash: passwordHash,
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
    const parsed = siteUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const siteId = parsed.data.siteId || parsed.data.id;
    if (!siteId) return NextResponse.json({ error: "Site ID gerekli" }, { status: 400 });

    const supabase = getServiceSupabase();

    // Sahiplik kontrolü ve düzenleme süresi kontrolü (1 hafta)
    const { data: existing } = await supabase
      .from("sites")
      .select("user_id, created_at, slug, is_private, password_hash")
      .eq("id", siteId)
      .single();

    if (!existing || existing.user_id !== userId) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
    }

    // 1 hafta (7 gün) düzenleme süresi sınırı
    const createdAt = new Date(existing.created_at);
    const now = new Date();
    const daysSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);

    if (daysSinceCreation > 7) {
      return NextResponse.json(
        { error: "Düzenleme süresi doldu. Site oluşturulduktan sonra sadece 1 hafta içinde düzenlenebilir." },
        { status: 403 }
      );
    }

    // Slug değişiyorsa benzersizlik kontrolü
    if (parsed.data.slug && parsed.data.slug !== existing.slug) {
      const { data: slugExists } = await supabase
        .from("sites")
        .select("id")
        .eq("slug", parsed.data.slug)
        .neq("id", siteId)
        .maybeSingle();

      if (slugExists) {
        return NextResponse.json(
          { error: "Bu URL zaten kullanılıyor" },
          { status: 409 }
        );
      }
    }

    // Model validasyonu sonrası güvenli update objesi oluştur
    const updateData: Record<string, unknown> = {};
    if (parsed.data.title !== undefined) updateData.title = parsed.data.title;
    if (parsed.data.recipientName !== undefined) updateData.recipient_name = parsed.data.recipientName;
    if (parsed.data.slug !== undefined) updateData.slug = parsed.data.slug;
    if (parsed.data.musicId !== undefined) updateData.music_id = parsed.data.musicId;

    if (parsed.data.slides) {
      updateData.slides = parsed.data.slides.map((slide, index) => ({
        ...slide,
        order: index + 1,
      }));
    }

    const nextIsPrivate = parsed.data.isPrivate ?? existing.is_private;
    const hasExistingPassword = !!existing.password_hash;
    const newPassword = parsed.data.password && parsed.data.password.length > 0
      ? parsed.data.password
      : null;
    const hasNewPassword = !!newPassword;

    if (nextIsPrivate && !hasExistingPassword && !hasNewPassword) {
      return NextResponse.json(
        { error: "Private site için şifre gerekli" },
        { status: 400 }
      );
    }

    if (!nextIsPrivate && newPassword) {
      return NextResponse.json(
        { error: "Public site için şifre gönderilemez" },
        { status: 400 }
      );
    }

    if (parsed.data.isPrivate !== undefined) {
      updateData.is_private = parsed.data.isPrivate;

      if (!parsed.data.isPrivate) {
        updateData.password_hash = null;
      }
    }

    if (hasNewPassword) {
      updateData.password_hash = await bcrypt.hash(newPassword, 10);
    }

    updateData.updated_at = new Date().toISOString();

    const { data: site, error } = await supabase
      .from("sites")
      .update(updateData)
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
