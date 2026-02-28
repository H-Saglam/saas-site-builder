const DEFAULT_APP_URL = "https://ozelbirani.com";
const DEFAULT_FROM_EMAIL = "Ozel Bir Ani <onboarding@resend.dev>";

function normalizeEmailList(raw: string): string[] {
  return Array.from(
    new Set(
      raw
        .split(",")
        .map((email) => email.trim().toLowerCase())
        .filter((email) => email.length > 0)
    )
  );
}

export function getAppBaseUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || DEFAULT_APP_URL;
  return baseUrl.replace(/\/+$/, "");
}

export function getResendFromEmail(): string {
  return process.env.RESEND_FROM_EMAIL?.trim() || DEFAULT_FROM_EMAIL;
}

export function getAdminSalesRecipients(): string[] {
  const rawEmails =
    process.env.ADMIN_SALES_EMAILS ??
    process.env.ADMIN_SALES_EMAIL ??
    process.env.ADMIN_EMAILS ??
    process.env.ADMIN_EMAIL ??
    "";

  return normalizeEmailList(rawEmails);
}
