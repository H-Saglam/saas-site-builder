import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import crypto from "crypto";
import { z } from "zod";
import { getServiceSupabase } from "@/lib/supabase";
import {
  createShopierCheckoutToken,
  SHOPIER_PACKAGE_PRICES,
} from "@/lib/shopier";

const createShopierSessionSchema = z.object({
  siteId: z.string().uuid("Geçersiz site ID"),
  packageType: z.enum(["standard", "premium"]),
});

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createShopierSessionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Geçersiz istek", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const shopierApiKey = process.env.SHOPIER_API_KEY || process.env.NEXT_PUBLIC_SHOPIER_API_KEY;
    const shopierApiSecret = process.env.SHOPIER_API_SECRET;
    if (!shopierApiKey || shopierApiKey === "XXXXXXXXXXXX" || !shopierApiSecret) {
      return NextResponse.json(
        { error: "Shopier henüz yapılandırılmamış" },
        { status: 503 }
      );
    }

    const supabase = getServiceSupabase();
    const { data: site, error: siteError } = await supabase
      .from("sites")
      .select("id, user_id, status")
      .eq("id", parsed.data.siteId)
      .single();

    if (siteError || !site) {
      return NextResponse.json({ error: "Site bulunamadı" }, { status: 404 });
    }

    if (site.user_id !== userId) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
    }

    if (site.status === "active") {
      return NextResponse.json({ error: "Site zaten aktif" }, { status: 400 });
    }

    const orderId = `ls-${crypto.randomUUID()}`;
    const token = createShopierCheckoutToken(
      {
        siteId: parsed.data.siteId,
        packageType: parsed.data.packageType,
        orderId,
        issuedAt: Date.now(),
      },
      shopierApiSecret
    );

    const amount = SHOPIER_PACKAGE_PRICES[parsed.data.packageType];
    const shopierUrl = new URL("https://www.shopier.com/ShowProductNew/products.php");
    shopierUrl.searchParams.set("id", shopierApiKey);
    shopierUrl.searchParams.set("product_type", "money_transfer");
    shopierUrl.searchParams.set("amount", amount);
    shopierUrl.searchParams.set("currency", "TRY");
    shopierUrl.searchParams.set("platform_order_id", orderId);
    shopierUrl.searchParams.set("custom_field_1", parsed.data.siteId);
    shopierUrl.searchParams.set("custom_field_2", parsed.data.packageType);
    shopierUrl.searchParams.set("custom_field_3", token);

    return NextResponse.json({ url: shopierUrl.toString() });
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
