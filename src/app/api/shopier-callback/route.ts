import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import crypto from "crypto";

// Shopier webhook callback
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const params = new URLSearchParams(body);

    // Shopier'den gelen parametreler
    const orderId = params.get("platform_order_id") || params.get("order_id");
    const status = params.get("status"); // "1" = başarılı
    const signature = params.get("signature");
    const siteId = params.get("custom_field_1"); // Site ID'miz
    const packageType = params.get("custom_field_2") || "standard"; // Paket tipi

    // İmza doğrulama
    const apiSecret = process.env.SHOPIER_API_SECRET;
    if (!apiSecret) {
      console.error("SHOPIER_API_SECRET tanımlı değil");
      return NextResponse.json({ error: "Config error" }, { status: 500 });
    }

    // Shopier imza kontrolü (Shopier'in algoritmasına göre ayarlanmalı)
    const expectedSignature = crypto
      .createHmac("sha256", apiSecret)
      .update(orderId || "")
      .digest("hex");

    if (signature && signature !== expectedSignature) {
      console.error("Geçersiz Shopier imzası");
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    if (status !== "1" || !siteId) {
      // Başarısız ödeme — bir şey yapma
      return NextResponse.json({ received: true });
    }

    // Ödeme başarılı — siteyi aktif et
    const supabase = getServiceSupabase();

    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1); // 1 yıl

    const { error } = await supabase
      .from("sites")
      .update({
        status: "active",
        package_type: packageType,
        expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", siteId);

    if (error) {
      console.error("Site aktifleştirme hatası:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`Site ${siteId} aktifleştirildi. Paket: ${packageType}`);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Shopier callback hatası:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
