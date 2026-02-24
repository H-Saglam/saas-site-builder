export type EmailTemplateKey =
  | "welcome"
  | "payment_success"
  | "admin_sale_alert"
  | "site_expiration_warning"
  | "edit_window_reminder"
  | "draft_reminder";

export const EMAIL_TEMPLATE_KEYS: EmailTemplateKey[] = [
  "welcome",
  "payment_success",
  "admin_sale_alert",
  "site_expiration_warning",
  "edit_window_reminder",
  "draft_reminder",
];

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface EmailTemplateContent {
  subject: string;
  preheader: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  bodyHtml: string;
  textBody: string;
  ctaLabel?: string;
  footerHtml?: string;
}

export const EMAIL_TEMPLATE_EDITOR_CONFIG: Record<
  EmailTemplateKey,
  {
    label: string;
    description: string;
    placeholders: string[];
  }
> = {
  welcome: {
    label: "Hoş Geldin",
    description: "Yeni kayıt olan kullanıcıya gönderilir.",
    placeholders: ["{{first_name}}", "{{dashboard_url}}"],
  },
  payment_success: {
    label: "Ödeme Başarılı",
    description: "Ödeme tamamlandıktan sonra kullanıcıya gönderilir.",
    placeholders: [
      "{{first_name}}",
      "{{recipient_name}}",
      "{{package_label}}",
      "{{amount_try}}",
      "{{live_site_url}}",
    ],
  },
  admin_sale_alert: {
    label: "Admin Satış Bildirimi",
    description: "Başarılı satıştan sonra admin alıcılarına gönderilir.",
    placeholders: [
      "{{customer_email}}",
      "{{amount_try}}",
      "{{package_label}}",
      "{{live_site_url}}",
      "{{site_id}}",
      "{{order_id}}",
    ],
  },
  site_expiration_warning: {
    label: "Site Süre Uyarısı",
    description: "Süresi dolmak üzere olan canlı siteler için hatırlatma gönderilir.",
    placeholders: [
      "{{first_name}}",
      "{{recipient_name}}",
      "{{days_left}}",
      "{{expires_at_date}}",
      "{{live_site_url}}",
      "{{dashboard_url}}",
    ],
  },
  edit_window_reminder: {
    label: "Düzenleme Süresi Hatırlatma",
    description: "Canlı sitedeki düzenleme penceresi kapanmadan önce gönderilir.",
    placeholders: [
      "{{first_name}}",
      "{{recipient_name}}",
      "{{days_left}}",
      "{{edit_deadline}}",
      "{{editor_url}}",
    ],
  },
  draft_reminder: {
    label: "Taslak Tamamlama Hatırlatma",
    description: "24 saati geçen, yayınlanmamış taslaklar için gönderilir.",
    placeholders: [
      "{{first_name}}",
      "{{recipient_name}}",
      "{{draft_age_hours}}",
      "{{dashboard_url}}",
    ],
  },
};

export const DEFAULT_EMAIL_TEMPLATE_CONTENTS: Record<EmailTemplateKey, EmailTemplateContent> = {
  welcome: {
    subject: "Hoş geldin! İlk dijital anını oluşturmaya hazır mısın?",
    preheader: "İlk dijital anını oluştur ve sevdiğine gülümseten bir sürpriz hazırla.",
    eyebrow: "Özel Bir Anı",
    title: "İlk hikayeni oluşturmaya başla",
    subtitle: "Sevdiğine unutulmaz bir dijital hediye hazırlamanın en tatlı zamanı.",
    bodyHtml: `<p style="margin:0 0 12px;font-size:15px;line-height:1.7;color:#334155;">{{first_name}},</p>
<p style="margin:0 0 12px;font-size:15px;line-height:1.7;color:#334155;">Aramıza hoş geldin. Burada sevdiklerin için müziği, fotoğrafları ve hikayeyi bir araya getirip unutulmaz bir dijital hediye oluşturabilirsin.</p>
<p style="margin:0;font-size:15px;line-height:1.7;color:#334155;">İlk siteni oluşturmak sadece birkaç dakika sürüyor. Hemen dashboard'a geç ve ilk anını yayına hazırla.</p>`,
    textBody:
      "{{first_name}}, aramıza hoş geldin.\nİlk dijital hikaye siteni oluşturmak için dashboard'a geç.\nDashboard: {{dashboard_url}}",
    ctaLabel: "Dashboard'a Git",
  },
  payment_success: {
    subject: "Ödeme başarılı! Siten artık yayında",
    preheader: "Ödeme tamamlandı. Siten canlı olarak paylaşıma açıldı.",
    eyebrow: "Ödeme Onayı",
    title: "Siten artık canlı!",
    subtitle: "Linki aşağıdan görebilir, sevdiğinle hemen paylaşabilirsin.",
    bodyHtml: `<p style="margin:0 0 12px;font-size:15px;line-height:1.7;color:#334155;">{{first_name}}, ödemen başarıyla tamamlandı. Siten yayına alındı.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #fbcfe8;border-radius:14px;background:#fff1f2;margin:12px 0 14px;">
  <tr>
    <td style="padding:14px 16px;">
      <p style="margin:0 0 6px;font-size:13px;color:#64748b;">Canlı Site Linki</p>
      <p style="margin:0;font-size:15px;line-height:1.6;font-weight:700;color:#be123c;word-break:break-all;">
        <a href="{{live_site_url}}" style="color:#be123c;text-decoration:none;">{{live_site_url}}</a>
      </p>
    </td>
  </tr>
</table>
<p style="margin:0 0 6px;font-size:14px;line-height:1.7;color:#334155;">Paket: <strong>{{package_label}}</strong></p>
<p style="margin:0 0 6px;font-size:14px;line-height:1.7;color:#334155;">Tutar: <strong>{{amount_try}}</strong></p>
<p style="margin:0;font-size:14px;line-height:1.7;color:#334155;">Alıcı: <strong>{{recipient_name}}</strong></p>`,
    textBody:
      "{{first_name}}, ödemen başarıyla tamamlandı ve siten yayına alındı.\nCanlı site linki: {{live_site_url}}\nPaket: {{package_label}}\nTutar: {{amount_try}}\nAlıcı: {{recipient_name}}",
    ctaLabel: "Canlı Siteyi Aç",
  },
  admin_sale_alert: {
    subject: "[Satış Bildirimi] Yeni ödeme alındı - {{amount_try}}",
    preheader: "Yeni satış bildirimi",
    eyebrow: "Admin Alert",
    title: "Yeni ödeme alındı",
    subtitle: "Satış detayları aşağıdaki gibidir.",
    bodyHtml: `<p style="margin:0 0 12px;font-size:15px;line-height:1.7;color:#334155;">Platformda yeni bir satış gerçekleşti.</p>
<p style="margin:0 0 6px;font-size:14px;line-height:1.7;color:#334155;">Müşteri E-postası: <strong>{{customer_email}}</strong></p>
<p style="margin:0 0 6px;font-size:14px;line-height:1.7;color:#334155;">Tutar: <strong>{{amount_try}}</strong></p>
<p style="margin:0 0 6px;font-size:14px;line-height:1.7;color:#334155;">Paket: <strong>{{package_label}}</strong></p>
<p style="margin:0 0 6px;font-size:14px;line-height:1.7;color:#334155;">Site ID: <strong>{{site_id}}</strong></p>
<p style="margin:0 0 6px;font-size:14px;line-height:1.7;color:#334155;">Sipariş ID: <strong>{{order_id}}</strong></p>
<p style="margin:0;font-size:14px;line-height:1.7;color:#334155;word-break:break-all;">Canlı URL: <a href="{{live_site_url}}" style="color:#be123c;text-decoration:none;">{{live_site_url}}</a></p>`,
    textBody:
      "Yeni satış gerçekleşti.\nMüşteri e-postası: {{customer_email}}\nTutar: {{amount_try}}\nPaket: {{package_label}}\nSite ID: {{site_id}}\nSipariş ID: {{order_id}}\nCanlı URL: {{live_site_url}}",
  },
  site_expiration_warning: {
    subject: "Sitenizin süresi dolmaya {{days_left}} gün kaldı",
    preheader: "Canlı sitenizin süresi yakında doluyor. Hemen yenileyin.",
    eyebrow: "Süre Uyarısı",
    title: "Canlı sitenin süresi dolmak üzere",
    subtitle: "Hikayenin yayında kalması için yenileme adımını tamamlayın.",
    bodyHtml: `<p style="margin:0 0 12px;font-size:15px;line-height:1.7;color:#334155;">{{first_name}}, <strong>{{recipient_name}}</strong> için yayınladığın sitenin süresi dolmaya yaklaşıyor.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #fbcfe8;border-radius:14px;background:#fff1f2;margin:12px 0 14px;">
  <tr>
    <td style="padding:14px 16px;">
      <p style="margin:0 0 6px;font-size:13px;color:#64748b;">Kalan Süre</p>
      <p style="margin:0 0 6px;font-size:16px;line-height:1.5;font-weight:700;color:#be123c;">{{days_left}} gün</p>
      <p style="margin:0;font-size:14px;line-height:1.6;color:#334155;">Bitiş Tarihi: <strong>{{expires_at_date}}</strong></p>
    </td>
  </tr>
</table>
<p style="margin:0 0 8px;font-size:14px;line-height:1.7;color:#334155;word-break:break-all;">Canlı URL: <a href="{{live_site_url}}" style="color:#be123c;text-decoration:none;">{{live_site_url}}</a></p>
<p style="margin:0;font-size:14px;line-height:1.7;color:#334155;">Dashboard üzerinden paketi yenileyerek yayını kesintisiz sürdürebilirsin.</p>`,
    textBody:
      "{{first_name}}, {{recipient_name}} için yayınladığın sitenin süresi dolmak üzere.\nKalan süre: {{days_left}} gün\nBitiş tarihi: {{expires_at_date}}\nCanlı URL: {{live_site_url}}\nYenileme için dashboard: {{dashboard_url}}",
    ctaLabel: "Dashboard'da Yenile",
  },
  edit_window_reminder: {
    subject: "Düzenleme süresi bitmeden son {{days_left}} gün",
    preheader: "Canlı sitenizde düzenleme penceresi yakında kapanacak.",
    eyebrow: "Düzenleme Hatırlatması",
    title: "Düzenleme penceresi kapanıyor",
    subtitle: "Son dokunuşları yapmak için kalan süreyi kaçırma.",
    bodyHtml: `<p style="margin:0 0 12px;font-size:15px;line-height:1.7;color:#334155;">{{first_name}}, <strong>{{recipient_name}}</strong> için yayınladığın sitede düzenleme hakkının bitmesine {{days_left}} gün kaldı.</p>
<p style="margin:0 0 8px;font-size:14px;line-height:1.7;color:#334155;">Düzenleme Son Tarihi: <strong>{{edit_deadline}}</strong></p>
<p style="margin:0;font-size:14px;line-height:1.7;color:#334155;">Son değişikliklerini şimdi yapabilir ve siteni güncel tutabilirsin.</p>`,
    textBody:
      "{{first_name}}, {{recipient_name}} için yayınladığın sitede düzenleme süresinin bitmesine {{days_left}} gün kaldı.\nDüzenleme son tarihi: {{edit_deadline}}\nDüzenleme linki: {{editor_url}}",
    ctaLabel: "Şimdi Düzenle",
  },
  draft_reminder: {
    subject: "Taslağın hazır, sürprizi tamamla",
    preheader: "24 saati geçen taslağını yayına al ve sürprizi tamamla.",
    eyebrow: "Taslak Hatırlatma",
    title: "Hazır taslağın seni bekliyor",
    subtitle: "Küçük bir adımla anını yayına alabilirsin.",
    bodyHtml: `<p style="margin:0 0 12px;font-size:15px;line-height:1.7;color:#334155;">{{first_name}}, oluşturduğun taslak <strong>{{draft_age_hours}} saattir</strong> yayınlanmayı bekliyor.</p>
<p style="margin:0 0 12px;font-size:14px;line-height:1.7;color:#334155;">{{recipient_name}} için hazırladığın hikayeyi tamamlayıp canlıya almak istersen dashboard'dan tek tıkla devam edebilirsin.</p>
<p style="margin:0;font-size:14px;line-height:1.7;color:#334155;">Sürprizi tamamlamak için seni bekliyoruz.</p>`,
    textBody:
      "{{first_name}}, taslağın {{draft_age_hours}} saattir bekliyor. {{recipient_name}} için hazırladığın sürprizi tamamlamak için dashboard'a dön.\nDashboard: {{dashboard_url}}",
    ctaLabel: "Taslağa Devam Et",
  },
};

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

interface SiteExpirationWarningInput {
  firstName?: string | null;
  recipientName: string;
  daysLeft: number;
  expiresAt: string;
  liveSiteUrl: string;
  dashboardUrl: string;
}

interface EditWindowReminderInput {
  firstName?: string | null;
  recipientName: string;
  daysLeft: number;
  editDeadline: string;
  editorUrl: string;
}

interface DraftReminderInput {
  firstName?: string | null;
  recipientName: string;
  draftAgeHours: number;
  dashboardUrl: string;
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

function formatDateTimeTR(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);
}

function packageLabel(packageType: "standard" | "premium"): string {
  return packageType === "premium" ? "Premium" : "Standard";
}

function applyPlaceholders(template: string, values: Record<string, string>): string {
  return template.replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (_match, key: string) => values[key] ?? "");
}

function resolveContent(
  templateKey: EmailTemplateKey,
  overrideContent?: EmailTemplateContent | null
): EmailTemplateContent {
  if (!overrideContent) return DEFAULT_EMAIL_TEMPLATE_CONTENTS[templateKey];

  const defaults = DEFAULT_EMAIL_TEMPLATE_CONTENTS[templateKey];
  return {
    subject: overrideContent.subject || defaults.subject,
    preheader: overrideContent.preheader || defaults.preheader,
    eyebrow: overrideContent.eyebrow || defaults.eyebrow,
    title: overrideContent.title || defaults.title,
    subtitle: overrideContent.subtitle || defaults.subtitle,
    bodyHtml: overrideContent.bodyHtml || defaults.bodyHtml,
    textBody: overrideContent.textBody || defaults.textBody,
    ctaLabel: overrideContent.ctaLabel ?? defaults.ctaLabel,
    footerHtml: overrideContent.footerHtml ?? defaults.footerHtml,
  };
}

function buildTemplateFromContent(params: {
  content: EmailTemplateContent;
  variables: Record<string, string>;
  ctaUrl?: string;
}): EmailTemplate {
  const rawVariables = params.variables;
  const safeVariables = Object.fromEntries(
    Object.entries(rawVariables).map(([key, value]) => [key, escapeHtml(value)])
  );

  const subject = applyPlaceholders(params.content.subject, rawVariables);
  const bodyHtml = applyPlaceholders(params.content.bodyHtml, safeVariables);
  const text = applyPlaceholders(params.content.textBody, rawVariables);

  const html = buildBaseLayout({
    preheader: applyPlaceholders(params.content.preheader, rawVariables),
    eyebrow: applyPlaceholders(params.content.eyebrow, rawVariables),
    title: applyPlaceholders(params.content.title, rawVariables),
    subtitle: applyPlaceholders(params.content.subtitle, rawVariables),
    bodyHtml,
    ctaLabel: params.content.ctaLabel
      ? applyPlaceholders(params.content.ctaLabel, rawVariables)
      : undefined,
    ctaUrl: params.ctaUrl,
    footerHtml: params.content.footerHtml
      ? applyPlaceholders(params.content.footerHtml, safeVariables)
      : undefined,
  });

  return { subject, html, text };
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
    `<p style="margin:0;font-size:12px;line-height:1.6;color:#94a3b8;">Bu e-posta Özel Bir Anı platformundan gönderilmiştir.</p>`;

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

export function buildWelcomeEmailTemplate(
  params: WelcomeEmailInput,
  overrideContent?: EmailTemplateContent | null
): EmailTemplate {
  const userName = params.firstName?.trim() || "Merhaba";
  const content = resolveContent("welcome", overrideContent);

  return buildTemplateFromContent({
    content,
    variables: {
      first_name: userName,
      dashboard_url: params.dashboardUrl,
    },
    ctaUrl: params.dashboardUrl,
  });
}

export function buildPaymentSuccessEmailTemplate(
  params: PaymentSuccessEmailInput,
  overrideContent?: EmailTemplateContent | null
): EmailTemplate {
  const userName = params.firstName?.trim() || "Merhaba";
  const content = resolveContent("payment_success", overrideContent);

  return buildTemplateFromContent({
    content,
    variables: {
      first_name: userName,
      recipient_name: params.recipientName,
      package_label: packageLabel(params.packageType),
      amount_try: formatTRY(params.amountTRY),
      live_site_url: params.liveSiteUrl,
    },
    ctaUrl: params.liveSiteUrl,
  });
}

export function buildAdminSaleAlertTemplate(
  params: AdminSaleAlertInput,
  overrideContent?: EmailTemplateContent | null
): EmailTemplate {
  const content = resolveContent("admin_sale_alert", overrideContent);

  return buildTemplateFromContent({
    content,
    variables: {
      customer_email: params.customerEmail,
      amount_try: formatTRY(params.amountTRY),
      package_label: packageLabel(params.packageType),
      live_site_url: params.liveSiteUrl,
      site_id: params.siteId,
      order_id: params.orderId,
    },
  });
}

export function buildSiteExpirationWarningEmailTemplate(
  params: SiteExpirationWarningInput,
  overrideContent?: EmailTemplateContent | null
): EmailTemplate {
  const userName = params.firstName?.trim() || "Merhaba";
  const content = resolveContent("site_expiration_warning", overrideContent);

  return buildTemplateFromContent({
    content,
    variables: {
      first_name: userName,
      recipient_name: params.recipientName,
      days_left: String(params.daysLeft),
      expires_at_date: formatDateTimeTR(params.expiresAt),
      live_site_url: params.liveSiteUrl,
      dashboard_url: params.dashboardUrl,
    },
    ctaUrl: params.dashboardUrl,
  });
}

export function buildEditWindowReminderEmailTemplate(
  params: EditWindowReminderInput,
  overrideContent?: EmailTemplateContent | null
): EmailTemplate {
  const userName = params.firstName?.trim() || "Merhaba";
  const content = resolveContent("edit_window_reminder", overrideContent);

  return buildTemplateFromContent({
    content,
    variables: {
      first_name: userName,
      recipient_name: params.recipientName,
      days_left: String(params.daysLeft),
      edit_deadline: formatDateTimeTR(params.editDeadline),
      editor_url: params.editorUrl,
    },
    ctaUrl: params.editorUrl,
  });
}

export function buildDraftReminderEmailTemplate(
  params: DraftReminderInput,
  overrideContent?: EmailTemplateContent | null
): EmailTemplate {
  const userName = params.firstName?.trim() || "Merhaba";
  const content = resolveContent("draft_reminder", overrideContent);

  return buildTemplateFromContent({
    content,
    variables: {
      first_name: userName,
      recipient_name: params.recipientName,
      draft_age_hours: String(params.draftAgeHours),
      dashboard_url: params.dashboardUrl,
    },
    ctaUrl: params.dashboardUrl,
  });
}
