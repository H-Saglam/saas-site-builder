import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import {
  buildShopierCallbackSignature,
  isPackageType,
  verifyShopierCheckoutToken,
} from "@/lib/shopier";

// Shopier webhook callback
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const params = new URLSearchParams(body);

    // Shopier'den gelen parametreler
    const orderId = params.get("platform_order_id") || params.get("order_id");
    const status = params.get("status"); // "1" = başarılı
    const signature = params.get("signature");
    const siteId = params.get("custom_field_1");
    const packageTypeRaw = params.get("custom_field_2");
    const checkoutToken = params.get("custom_field_3");

    if (!orderId || !status || !signature || !siteId || !packageTypeRaw || !checkoutToken) {
      return NextResponse.json({ error: "Eksik callback parametresi" }, { status: 400 });
    }

    if (!isPackageType(packageTypeRaw)) {
      return NextResponse.json({ error: "Geçersiz paket tipi" }, { status: 400 });
    }
    const packageType = packageTypeRaw;

    // İmza doğrulama
    const apiSecret = process.env.SHOPIER_API_SECRET;
    if (!apiSecret) {
      console.error("SHOPIER_API_SECRET tanımlı değil");
      return NextResponse.json({ error: "Config error" }, { status: 500 });
    }

    // Shopier imzası + checkout token birlikte doğrulanır.
    const expectedSignature = buildShopierCallbackSignature(orderId, apiSecret);
    const tokenValid = verifyShopierCheckoutToken(
      checkoutToken,
      { siteId, packageType, orderId },
      apiSecret
    );

    if (signature !== expectedSignature || !tokenValid) {
      console.error("Geçersiz Shopier callback doğrulaması");
      return NextResponse.json({ error: "Invalid callback" }, { status: 403 });
    }

    if (status !== "1") {
      // Başarısız ödeme — sadece alındı onayı ver.
      return NextResponse.json({ received: true });
    }

    // Ödeme başarılı — siteyi aktif et (idempotent)
    const supabase = getServiceSupabase();
    const { data: existing, error: existingError } = await supabase
      .from("sites")
      .select("id, status")
      .eq("id", siteId)
      .single();

    if (existingError || !existing) {
      return NextResponse.json({ error: "Site bulunamadı" }, { status: 404 });
    }

    if (existing.status === "active") {
      return NextResponse.json({ success: true, alreadyProcessed: true });
    }

    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1); // 1 yıl

    const { data: updatedRows, error } = await supabase
      .from("sites")
      .update({
        status: "active",
        package_type: packageType,
        expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", siteId)
      .in("status", ["draft", "paid"])
      .select("id");

    if (error) {
      console.error("Site aktifleştirme hatası:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!updatedRows || updatedRows.length === 0) {
      return NextResponse.json({ success: true, alreadyProcessed: true });
    }

    console.log(`Site ${siteId} aktifleştirildi. Paket: ${packageType}`);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Shopier callback hatası:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
