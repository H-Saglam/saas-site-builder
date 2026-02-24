import { NextRequest, NextResponse } from "next/server";
import { runRetentionNotificationsJob } from "@/lib/notifications/retention";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getCronSecret(): string | null {
  const secret = process.env.CRON_SECRET?.trim();
  return secret && secret.length > 0 ? secret : null;
}

function isAuthorized(request: NextRequest, secret: string): boolean {
  const authorization = request.headers.get("authorization");
  return authorization === `Bearer ${secret}`;
}

async function handleRequest(request: NextRequest) {
  const cronSecret = getCronSecret();
  if (!cronSecret) {
    console.error("CRON_SECRET tanımlı değil. Retention cron endpoint devre dışı.");
    return NextResponse.json(
      { error: "Sunucu konfigürasyon hatası: CRON_SECRET eksik" },
      { status: 500 }
    );
  }

  if (!isAuthorized(request, cronSecret)) {
    return NextResponse.json({ error: "Yetkisiz cron çağrısı" }, { status: 401 });
  }

  try {
    const report = await runRetentionNotificationsJob();
    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error("Retention notification cron hatası:", error);
    return NextResponse.json(
      {
        error: "Retention notification cron başarısız",
        detail: (error as Error)?.message ?? "Bilinmeyen hata",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return handleRequest(request);
}

export async function POST(request: NextRequest) {
  return handleRequest(request);
}
