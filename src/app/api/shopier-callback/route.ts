import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import type { PackageType } from "@/lib/types";
import crypto from "crypto";

const PACKAGE_PRICES_TRY: Record<PackageType, number> = {
  standard: 149,
  premium: 249,
};

function parseAmountToKurus(rawAmount: string | null): number | null {
  if (!rawAmount) return null;

  const normalizedAmount = rawAmount.trim().replace(",", ".");
  if (!normalizedAmount) return null;

  const amount = Number(normalizedAmount);
  if (!Number.isFinite(amount) || amount <= 0) return null;

  return Math.round(amount * 100);
}

function resolvePackageTypeByAmount(amountInKurus: number): PackageType | null {
  if (amountInKurus === PACKAGE_PRICES_TRY.premium * 100) {
    return "premium";
  }

  if (amountInKurus === PACKAGE_PRICES_TRY.standard * 100) {
    return "standard";
  }

  return null;
}

function signaturesMatch(receivedSignature: string, expectedSignature: string) {
  const received = Buffer.from(receivedSignature.toLowerCase(), "utf8");
  const expected = Buffer.from(expectedSignature.toLowerCase(), "utf8");

  if (received.length !== expected.length) return false;
  return crypto.timingSafeEqual(received, expected);
}

// Shopier webhook callback
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const params = new URLSearchParams(body);

    // Shopier'den gelen parametreler
    const orderId =
      params.get("platform_order_id") ||
      params.get("order_id") ||
      params.get("shopier_order_id");
    const status = params.get("status"); // "1" = başarılı
    const signature = params.get("signature");
    const randomNr = params.get("random_nr");
    const totalOrderValue = params.get("total_order_value") || params.get("amount");
    const currency = params.get("currency") || "TRY";
    const siteId = params.get("custom_field_1"); // Site ID'miz

    if (!orderId || !signature || !randomNr || !totalOrderValue) {
      console.error("Shopier callback zorunlu alanları eksik");
      return NextResponse.json({ error: "Invalid callback payload" }, { status: 400 });
    }

    // İmza doğrulama
    const apiSecret = process.env.SHOPIER_API_SECRET;
    if (!apiSecret) {
      console.error("SHOPIER_API_SECRET tanımlı değil");
      return NextResponse.json({ error: "Config error" }, { status: 500 });
    }

    // Shopier imza kontrolü: random_nr + order_id + total_order_value + currency
    const expectedSignature = crypto
      .createHmac("sha256", apiSecret)
      .update(`${randomNr}${orderId}${totalOrderValue}${currency}`)
      .digest("hex");

    if (!signaturesMatch(signature, expectedSignature)) {
      console.error("Geçersiz veya eksik Shopier imzası");
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    if (status !== "1" || !siteId) {
      // Başarısız ödeme — bir şey yapma
      return NextResponse.json({ received: true });
    }

    // Ödeme başarılı — siteyi aktif et
    const supabase = getServiceSupabase();

    // Paket tipi güvenli kaynaktan (ödenen tutar) belirlenir, custom_field_2 güvenilmez
    const paidAmountInKurus = parseAmountToKurus(totalOrderValue);
    if (paidAmountInKurus === null) {
      console.error("Ödeme tutarı çözümlenemedi:", totalOrderValue);
      return NextResponse.json({ error: "Invalid order amount" }, { status: 400 });
    }

    const packageType = resolvePackageTypeByAmount(paidAmountInKurus);
    if (!packageType) {
      console.error("Desteklenmeyen ödeme tutarı:", totalOrderValue);
      return NextResponse.json({ error: "Unsupported order amount" }, { status: 400 });
    }

    const callbackPackageType = params.get("custom_field_2");
    if (callbackPackageType && callbackPackageType !== packageType) {
      console.warn("Ödeme tutarı ile custom_field_2 uyumsuz:", {
        callbackPackageType,
        resolvedPackageType: packageType,
        totalOrderValue,
        siteId,
      });
    }

    let expiresAt: string | null = null;
    if (packageType !== "premium") {
      const standardExpiry = new Date();
      standardExpiry.setFullYear(standardExpiry.getFullYear() + 1);
      expiresAt = standardExpiry.toISOString();
    }

    const { data: updatedSite, error } = await supabase
      .from("sites")
      .update({
        status: "active",
        package_type: packageType,
        expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      })
      .eq("id", siteId)
      .select("id")
      .maybeSingle();

    if (error) {
      console.error("Site aktifleştirme hatası:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!updatedSite) {
      console.error("Aktifleştirilecek site bulunamadı:", siteId);
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    console.log(`Site ${siteId} aktifleştirildi. Paket: ${packageType}`);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Shopier callback hatası:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
