import { NextRequest, NextResponse } from "next/server";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { sendWelcomeEmail } from "@/lib/email";

type ClerkWebhookEmailAddress = {
  id?: string;
  email_address?: string;
};

type UserCreatedWebhookData = {
  first_name?: string | null;
  primary_email_address_id?: string | null;
  email_addresses?: ClerkWebhookEmailAddress[];
};

function getPrimaryEmailFromWebhookData(data: UserCreatedWebhookData): string | null {
  const addresses = Array.isArray(data.email_addresses) ? data.email_addresses : [];
  if (addresses.length === 0) return null;

  const primaryById = addresses.find((address) => address.id === data.primary_email_address_id);
  const fallbackAddress = addresses[0];
  const email = primaryById?.email_address ?? fallbackAddress?.email_address ?? null;

  return email?.trim() ? email.trim() : null;
}

export async function POST(request: NextRequest) {
  let event: Awaited<ReturnType<typeof verifyWebhook>>;

  try {
    event = await verifyWebhook(request);
  } catch (error) {
    console.error("Clerk webhook signature verification failed:", error);
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  if (event.type !== "user.created") {
    return NextResponse.json({ received: true });
  }

  const data = event.data as UserCreatedWebhookData;
  const toEmail = getPrimaryEmailFromWebhookData(data);
  if (!toEmail) {
    console.warn("Welcome email skipped: user.created event has no email.", event.data);
    return NextResponse.json({ received: true });
  }

  try {
    await sendWelcomeEmail({
      to: toEmail,
      firstName: data.first_name ?? null,
    });
  } catch (error) {
    console.error("Welcome email delivery failed:", error);
    return NextResponse.json({ error: "Welcome email delivery failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
