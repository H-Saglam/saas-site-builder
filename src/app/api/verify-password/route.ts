import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { getServiceSupabase } from "@/lib/supabase";
import { verifyPasswordSchema } from "@/lib/validators";

const VERIFY_SECRET = new TextEncoder().encode(
  process.env.VERIFY_SECRET || "fallback-secret-change-in-production-min32chars!"
);

// Basit in-memory rate limiting
const attempts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = attempts.get(ip);

  if (!record || now > record.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + 60_000 }); // 1 dakika
    return true;
  }

  if (record.count >= 5) {
    return false; // 5 deneme/dakika sınırı
  }

  record.count++;
  return true;
}

export async function POST(request: NextRequest) {
  // Rate limiting
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { success: false, message: "Çok fazla deneme. 1 dakika bekleyin." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const parsed = verifyPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Geçersiz istek" },
        { status: 400 }
      );
    }

    const { slug, password } = parsed.data;
    const supabase = getServiceSupabase();

    // Siteyi bul
    const { data: site } = await supabase
      .from("sites")
      .select("password_hash, is_private")
      .eq("slug", slug)
      .eq("status", "active")
      .single();

    if (!site || !site.is_private || !site.password_hash) {
      return NextResponse.json(
        { success: false, message: "Site bulunamadı" },
        { status: 404 }
      );
    }

    // Şifre kontrolü
    const isValid = await bcrypt.compare(password, site.password_hash);

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "Şifre yanlış" },
        { status: 401 }
      );
    }

    // JWT token oluştur (24 saat geçerli)
    const token = await new SignJWT({ slug, verified: true })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("24h")
      .sign(VERIFY_SECRET);

    // Cookie olarak set et
    const response = NextResponse.json({ success: true });
    response.cookies.set(`site-verify-${slug}`, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 86400, // 24 saat
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json(
      { success: false, message: "Sunucu hatası" },
      { status: 500 }
    );
  }
}
