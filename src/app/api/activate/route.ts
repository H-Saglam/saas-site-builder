import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getServiceSupabase } from "@/lib/supabase";

type PackageType = "standard" | "premium";

function resolvePackageType(value: unknown): PackageType | null {
  if (value === "standard" || value === "premium") return value;
  return null;
}

function buildExpiresAt(packageType: PackageType): string | null {
  if (packageType === "premium") return null;
  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);
  return expiresAt.toISOString();
}

/*
  POST /api/activate
  Body: { siteId: string, packageType?: "standard" | "premium" }

  - "paid" statüsündeki siteyi "active" yapar
  - Dev modda "draft" siteyi seçilen paketle aktif eder (ödeme bypass)
*/
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const siteId = typeof body?.siteId === "string" ? body.siteId : null;
    const requestedPackageType = resolvePackageType(body?.packageType);

    if (!siteId) {
      return NextResponse.json({ error: "Site ID gerekli" }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    // Sahiplik ve durum kontrolü
    const { data: site, error: fetchErr } = await supabase
      .from("sites")
      .select("user_id, status, package_type")
      .eq("id", siteId)
      .single();

    if (fetchErr || !site) {
      return NextResponse.json({ error: "Site bulunamadı" }, { status: 404 });
    }
    if (site.user_id !== userId) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
    }

    // Zaten aktif
    if (site.status === "active") {
      return NextResponse.json({ message: "Site zaten aktif" });
    }

    // Ödeme yapılmış → aktif et
    if (site.status === "paid") {
      const packageType = resolvePackageType(site.package_type) ?? "standard";
      const expiresAt = buildExpiresAt(packageType);

      await supabase
        .from("sites")
        .update({
          status: "active",
          package_type: packageType,
          expires_at: expiresAt,
          updated_at: new Date().toISOString(),
        })
        .eq("id", siteId);

      return NextResponse.json({ success: true, status: "active", packageType });
    }

    // Dev modda draft → seçilen paketle doğrudan aktif et
    if (process.env.NODE_ENV === "development" && site.status === "draft") {
      const packageType = requestedPackageType ?? resolvePackageType(site.package_type) ?? "standard";
      const expiresAt = buildExpiresAt(packageType);

      await supabase
        .from("sites")
        .update({
          status: "active",
          package_type: packageType,
          expires_at: expiresAt,
          updated_at: new Date().toISOString(),
        })
        .eq("id", siteId);

      return NextResponse.json({ success: true, status: "active", packageType, devBypass: true });
    }

    // Draft → ödeme gerekiyor
    return NextResponse.json(
      { needsPayment: true, message: "Ödeme yapılmamış" },
      { status: 402 }
    );
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
