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
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error("Invalid TRY amount for email template.");
  }

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
    `<p style="margin:0;font-size:12px;line-height:1.6;color:#94a3b8;">Bu e-posta \u00d6zel Bir An\u0131 platformundan g\u00f6nderilmi\u015ftir.</p>`;

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
  const subject = "Ho\u015f geldin! \u0130lk dijital an\u0131n\u0131 olu\u015fturmaya haz\u0131r m\u0131s\u0131n?";

  const bodyHtml = `
    <p style="margin:0 0 12px;font-size:15px;line-height:1.7;color:#334155;">
      ${escapeHtml(userName)},
    </p>
    <p style="margin:0 0 12px;font-size:15px;line-height:1.7;color:#334155;">
      Aram\u0131za ho\u015f geldin. Burada sevdiklerin i\u00e7in m\u00fczi\u011fi, foto\u011fraflar\u0131 ve hikayeyi bir araya getirip unutulmaz bir dijital hediye olu\u015fturabilirsin.
    </p>
    <p style="margin:0;font-size:15px;line-height:1.7;color:#334155;">
      \u0130lk siteni olu\u015fturmak sadece birka\u00e7 dakika s\u00fcr\u00fcyor. Hemen dashboard'a ge\u00e7 ve ilk an\u0131n\u0131 yay\u0131na haz\u0131rla.
    </p>
  `;

  const text = [
    `${userName}, aram\u0131za ho\u015f geldin.`,
    "\u0130lk dijital hikaye siteni olu\u015fturmak i\u00e7in dashboard'a ge\u00e7.",
    `Dashboard: ${dashboardUrl}`,
  ].join("\n");

  const html = buildBaseLayout({
    preheader: "\u0130lk dijital an\u0131n\u0131 olu\u015ftur ve sevdi\u011fine g\u00fcl\u00fcmseten bir s\u00fcrpriz haz\u0131rla.",
    eyebrow: "\u00d6zel Bir An\u0131",
    title: "\u0130lk hikayeni olu\u015fturmaya ba\u015fla",
    subtitle: "Sevdi\u011fine unutulmaz bir dijital hediye haz\u0131rlaman\u0131n en tatl\u0131 zaman\u0131.",
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
  const subject = "\u00d6deme ba\u015far\u0131l\u0131! Siten art\u0131k yay\u0131nda";

  const bodyHtml = `
    <p style="margin:0 0 12px;font-size:15px;line-height:1.7;color:#334155;">
      ${escapeHtml(userName)}, \u00f6demen ba\u015far\u0131yla tamamland\u0131. Siten yay\u0131na al\u0131nd\u0131.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #fbcfe8;border-radius:14px;background:#fff1f2;margin:12px 0 14px;">
      <tr>
        <td style="padding:14px 16px;">
          <p style="margin:0 0 6px;font-size:13px;color:#64748b;">Canl\u0131 Site Linki</p>
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
      Al\u0131c\u0131: <strong>${escapeHtml(recipientName)}</strong>
    </p>
  `;

  const text = [
    `${userName}, \u00f6demen ba\u015far\u0131yla tamamland\u0131 ve siten yay\u0131na al\u0131nd\u0131.`,
    `Canl\u0131 site linki: ${liveSiteUrl}`,
    `Paket: ${packageLabel(packageType)}`,
    `Tutar: ${formatTRY(amountTRY)}`,
    `Al\u0131c\u0131: ${recipientName}`,
  ].join("\n");

  const html = buildBaseLayout({
    preheader: "\u00d6deme tamamland\u0131. Siten canl\u0131 olarak payla\u015f\u0131ma a\u00e7\u0131ld\u0131.",
    eyebrow: "\u00d6deme Onay\u0131",
    title: "Siten art\u0131k canl\u0131!",
    subtitle: "Linki a\u015fa\u011f\u0131dan g\u00f6rebilir, sevdi\u011finle hemen payla\u015fabilirsin.",
    bodyHtml,
    ctaLabel: "Canl\u0131 Siteyi A\u00e7",
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
  const subject = `[Sat\u0131\u015f Bildirimi] Yeni \u00f6deme al\u0131nd\u0131 - ${formatTRY(amountTRY)}`;

  const bodyHtml = `
    <p style="margin:0 0 12px;font-size:15px;line-height:1.7;color:#334155;">
      Platformda yeni bir sat\u0131\u015f ger\u00e7ekle\u015fti.
    </p>
    <p style="margin:0 0 6px;font-size:14px;line-height:1.7;color:#334155;">
      M\u00fc\u015fteri E-postas\u0131: <strong>${escapeHtml(customerEmail)}</strong>
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
      Sipari\u015f ID: <strong>${escapeHtml(orderId)}</strong>
    </p>
    <p style="margin:0;font-size:14px;line-height:1.7;color:#334155;word-break:break-all;">
      Canl\u0131 URL: <a href="${escapeHtml(liveSiteUrl)}" style="color:#be123c;text-decoration:none;">${escapeHtml(liveSiteUrl)}</a>
    </p>
  `;

  const text = [
    "Yeni sat\u0131\u015f ger\u00e7ekle\u015fti.",
    `M\u00fc\u015fteri e-postas\u0131: ${customerEmail}`,
    `Tutar: ${formatTRY(amountTRY)}`,
    `Paket: ${packageLabel(packageType)}`,
    `Site ID: ${siteId}`,
    `Sipari\u015f ID: ${orderId}`,
    `Canl\u0131 URL: ${liveSiteUrl}`,
  ].join("\n");

  const html = buildBaseLayout({
    preheader: "Yeni sat\u0131\u015f bildirimi",
    eyebrow: "Admin Alert",
    title: "Yeni \u00f6deme al\u0131nd\u0131",
    subtitle: "Sat\u0131\u015f detaylar\u0131 a\u015fa\u011f\u0131daki gibidir.",
    bodyHtml,
  });

  return { subject, html, text };
}
