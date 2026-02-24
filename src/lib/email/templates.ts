export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

interface WelcomeEmailInput {
  firstName?: string | null;
  dashboardUrl: string;
}

interface PaymentSuccessEmailInput {
  firstName?: string | null;
  recipientName: string;
  packageType: "standard" | "premium";
  amountTRY: number;
  liveSiteUrl: string;
}

interface AdminSaleAlertInput {
  customerEmail: string;
  amountTRY: number;
  packageType: "standard" | "premium";
  liveSiteUrl: string;
  siteId: string;
  orderId: string;
}

interface BaseLayoutInput {
  preheader: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaUrl?: string;
  footerHtml?: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatTRY(amount: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(amount);
}

function packageLabel(packageType: "standard" | "premium"): string {
  return packageType === "premium" ? "Premium" : "Standard";
}

function buildBaseLayout({
  preheader,
  eyebrow,
  title,
  subtitle,
  bodyHtml,
  ctaLabel,
  ctaUrl,
  footerHtml,
}: BaseLayoutInput): string {
  const safePreheader = escapeHtml(preheader);
  const safeEyebrow = escapeHtml(eyebrow);
  const safeTitle = escapeHtml(title);
  const safeSubtitle = escapeHtml(subtitle);
  const ctaBlock =
    ctaLabel && ctaUrl
      ? `<tr>
          <td style="padding: 0 32px 28px;">
            <a href="${escapeHtml(
              ctaUrl
            )}" style="display:inline-block;background:#e11d48;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;line-height:1;padding:14px 24px;border-radius:999px;">
              ${escapeHtml(ctaLabel)}
            </a>
          </td>
        </tr>`
      : "";

  const finalFooter =
    footerHtml ||
    `<p style="margin:0;font-size:12px;line-height:1.6;color:#94a3b8;">Bu e-posta Ozel Bir Ani platformundan gonderilmistir.</p>`;

  return `<!doctype html>
<html lang="tr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="x-apple-disable-message-reformatting" />
    <title>${safeTitle}</title>
    <style>
      @media only screen and (max-width: 640px) {
        .card {
          border-radius: 16px !important;
        }

        .card-content {
          padding-left: 20px !important;
          padding-right: 20px !important;
        }

        .title {
          font-size: 24px !important;
        }
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background:#fff7fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;visibility:hidden;mso-hide:all;">${safePreheader}</div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fff7fb;padding:28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;">
            <tr>
              <td style="padding:0 8px 16px;color:#e11d48;font-size:12px;letter-spacing:.12em;text-transform:uppercase;font-weight:700;">
                ${safeEyebrow}
              </td>
            </tr>

            <tr>
              <td class="card" style="background:#ffffff;border:1px solid #fbcfe8;border-radius:24px;box-shadow:0 14px 34px rgba(15,23,42,0.08);overflow:hidden;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="height:10px;background:linear-gradient(90deg,#fb7185,#f472b6,#a78bfa);"></td>
                  </tr>
                  <tr>
                    <td class="card-content" style="padding:32px 32px 14px;">
                      <h1 class="title" style="margin:0 0 10px;font-size:30px;line-height:1.2;font-weight:800;color:#881337;">
                        ${safeTitle}
                      </h1>
                      <p style="margin:0 0 18px;font-size:16px;line-height:1.6;color:#475569;">
                        ${safeSubtitle}
                      </p>
                    </td>
                  </tr>

                  <tr>
                    <td class="card-content" style="padding:0 32px 20px;">
                      ${bodyHtml}
                    </td>
                  </tr>

                  ${ctaBlock}

                  <tr>
                    <td style="padding:0 32px 28px;">
                      ${finalFooter}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function buildWelcomeEmailTemplate({
  firstName,
  dashboardUrl,
}: WelcomeEmailInput): EmailTemplate {
  const userName = firstName?.trim() || "Merhaba";
  const subject = "Hos geldin! Ilk dijital anini olusturmaya hazir misin?";

  const bodyHtml = `
    <p style="margin:0 0 12px;font-size:15px;line-height:1.7;color:#334155;">
      ${escapeHtml(userName)},
    </p>
    <p style="margin:0 0 12px;font-size:15px;line-height:1.7;color:#334155;">
      Aramiza hos geldin. Burada sevdiklerin icin muzigi, fotograflari ve hikayeyi bir araya getirip unutulmaz bir dijital hediye olusturabilirsin.
    </p>
    <p style="margin:0;font-size:15px;line-height:1.7;color:#334155;">
      Ilk siteni olusturmak sadece birkac dakika suruyor. Hemen dashboard'a gec ve ilk anini yayina hazirla.
    </p>
  `;

  const text = [
    `${userName}, aramiza hos geldin.`,
    "Ilk dijital hikaye siteni olusturmak icin dashboard'a gec.",
    `Dashboard: ${dashboardUrl}`,
  ].join("\n");

  const html = buildBaseLayout({
    preheader: "Ilk dijital anini olustur ve sevdigine gulumseten bir surpriz hazirla.",
    eyebrow: "Ozel Bir Ani",
    title: "Ilk hikayeni olusturmaya basla",
    subtitle: "Sevdigine unutulmaz bir dijital hediye hazirlamanin en tatli zamani.",
    bodyHtml,
    ctaLabel: "Dashboard'a Git",
    ctaUrl: dashboardUrl,
  });

  return { subject, html, text };
}

export function buildPaymentSuccessEmailTemplate({
  firstName,
  recipientName,
  packageType,
  amountTRY,
  liveSiteUrl,
}: PaymentSuccessEmailInput): EmailTemplate {
  const userName = firstName?.trim() || "Merhaba";
  const subject = "Odeme basarili! Siten artik yayinda";

  const bodyHtml = `
    <p style="margin:0 0 12px;font-size:15px;line-height:1.7;color:#334155;">
      ${escapeHtml(userName)}, odemen basariyla tamamlandi. Siten yayina alindi.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #fbcfe8;border-radius:14px;background:#fff1f2;margin:12px 0 14px;">
      <tr>
        <td style="padding:14px 16px;">
          <p style="margin:0 0 6px;font-size:13px;color:#64748b;">Canli Site Linki</p>
          <p style="margin:0;font-size:15px;line-height:1.6;font-weight:700;color:#be123c;word-break:break-all;">
            <a href="${escapeHtml(liveSiteUrl)}" style="color:#be123c;text-decoration:none;">${escapeHtml(liveSiteUrl)}</a>
          </p>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 6px;font-size:14px;line-height:1.7;color:#334155;">
      Paket: <strong>${escapeHtml(packageLabel(packageType))}</strong>
    </p>
    <p style="margin:0 0 6px;font-size:14px;line-height:1.7;color:#334155;">
      Tutar: <strong>${escapeHtml(formatTRY(amountTRY))}</strong>
    </p>
    <p style="margin:0;font-size:14px;line-height:1.7;color:#334155;">
      Alici: <strong>${escapeHtml(recipientName)}</strong>
    </p>
  `;

  const text = [
    `${userName}, odemen basariyla tamamlandi ve siten yayina alindi.`,
    `Canli site linki: ${liveSiteUrl}`,
    `Paket: ${packageLabel(packageType)}`,
    `Tutar: ${formatTRY(amountTRY)}`,
    `Alici: ${recipientName}`,
  ].join("\n");

  const html = buildBaseLayout({
    preheader: "Odeme tamamlandi. Siten canli olarak paylasima acildi.",
    eyebrow: "Odeme Onayi",
    title: "Siten artik canli!",
    subtitle: "Linki asagidan gorebilir, sevdiginle hemen paylasabilirsin.",
    bodyHtml,
    ctaLabel: "Canli Siteyi Ac",
    ctaUrl: liveSiteUrl,
  });

  return { subject, html, text };
}

export function buildAdminSaleAlertTemplate({
  customerEmail,
  amountTRY,
  packageType,
  liveSiteUrl,
  siteId,
  orderId,
}: AdminSaleAlertInput): EmailTemplate {
  const subject = `[Satis Bildirimi] Yeni odeme alindi - ${formatTRY(amountTRY)}`;

  const bodyHtml = `
    <p style="margin:0 0 12px;font-size:15px;line-height:1.7;color:#334155;">
      Platformda yeni bir satis gerceklesti.
    </p>
    <p style="margin:0 0 6px;font-size:14px;line-height:1.7;color:#334155;">
      Musteri E-postasi: <strong>${escapeHtml(customerEmail)}</strong>
    </p>
    <p style="margin:0 0 6px;font-size:14px;line-height:1.7;color:#334155;">
      Tutar: <strong>${escapeHtml(formatTRY(amountTRY))}</strong>
    </p>
    <p style="margin:0 0 6px;font-size:14px;line-height:1.7;color:#334155;">
      Paket: <strong>${escapeHtml(packageLabel(packageType))}</strong>
    </p>
    <p style="margin:0 0 6px;font-size:14px;line-height:1.7;color:#334155;">
      Site ID: <strong>${escapeHtml(siteId)}</strong>
    </p>
    <p style="margin:0 0 6px;font-size:14px;line-height:1.7;color:#334155;">
      Siparis ID: <strong>${escapeHtml(orderId)}</strong>
    </p>
    <p style="margin:0;font-size:14px;line-height:1.7;color:#334155;word-break:break-all;">
      Canli URL: <a href="${escapeHtml(liveSiteUrl)}" style="color:#be123c;text-decoration:none;">${escapeHtml(liveSiteUrl)}</a>
    </p>
  `;

  const text = [
    "Yeni satis gerceklesti.",
    `Musteri e-postasi: ${customerEmail}`,
    `Tutar: ${formatTRY(amountTRY)}`,
    `Paket: ${packageLabel(packageType)}`,
    `Site ID: ${siteId}`,
    `Siparis ID: ${orderId}`,
    `Canli URL: ${liveSiteUrl}`,
  ].join("\n");

  const html = buildBaseLayout({
    preheader: "Yeni satis bildirimi",
    eyebrow: "Admin Alert",
    title: "Yeni odeme alindi",
    subtitle: "Satis detaylari asagidaki gibidir.",
    bodyHtml,
  });

  return { subject, html, text };
}
