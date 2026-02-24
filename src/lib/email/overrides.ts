import { getServiceSupabase } from "@/lib/supabase";
import {
  DEFAULT_EMAIL_TEMPLATE_CONTENTS,
  EMAIL_TEMPLATE_KEYS,
  type EmailTemplateContent,
  type EmailTemplateKey,
} from "./templates";

interface EmailTemplateOverrideRow {
  template_key: string;
  subject: string;
  preheader: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  body_html: string;
  text_body: string;
  cta_label: string | null;
  footer_html: string | null;
}

const TEMPLATE_COLUMNS =
  "template_key, subject, preheader, eyebrow, title, subtitle, body_html, text_body, cta_label, footer_html";

function isMissingTableError(error: { code?: string } | null | undefined): boolean {
  return error?.code === "42P01";
}

function isEmailTemplateKey(value: string): value is EmailTemplateKey {
  return EMAIL_TEMPLATE_KEYS.includes(value as EmailTemplateKey);
}

function toTemplateContent(templateKey: EmailTemplateKey, row: EmailTemplateOverrideRow): EmailTemplateContent {
  const defaults = DEFAULT_EMAIL_TEMPLATE_CONTENTS[templateKey];

  return {
    subject: row.subject || defaults.subject,
    preheader: row.preheader || defaults.preheader,
    eyebrow: row.eyebrow || defaults.eyebrow,
    title: row.title || defaults.title,
    subtitle: row.subtitle || defaults.subtitle,
    bodyHtml: row.body_html || defaults.bodyHtml,
    textBody: row.text_body || defaults.textBody,
    ctaLabel: row.cta_label ?? defaults.ctaLabel,
    footerHtml: row.footer_html ?? defaults.footerHtml,
  };
}

function toDatabasePayload(content: EmailTemplateContent) {
  return {
    subject: content.subject,
    preheader: content.preheader,
    eyebrow: content.eyebrow,
    title: content.title,
    subtitle: content.subtitle,
    body_html: content.bodyHtml,
    text_body: content.textBody,
    cta_label: content.ctaLabel ?? null,
    footer_html: content.footerHtml ?? null,
    updated_at: new Date().toISOString(),
  };
}

export async function getEmailTemplateContent(templateKey: EmailTemplateKey): Promise<EmailTemplateContent> {
  const defaults = DEFAULT_EMAIL_TEMPLATE_CONTENTS[templateKey];
  const supabase = getServiceSupabase();

  const { data, error } = await supabase
    .from("email_template_overrides")
    .select(TEMPLATE_COLUMNS)
    .eq("template_key", templateKey)
    .maybeSingle();

  if (error) {
    if (isMissingTableError(error)) {
      console.warn("email_template_overrides table missing. Using default templates.");
      return defaults;
    }

    console.error(`Email template override fetch failed (${templateKey}):`, error);
    return defaults;
  }

  if (!data) {
    return defaults;
  }

  return toTemplateContent(templateKey, data as EmailTemplateOverrideRow);
}

export async function getEmailTemplateEditorState(): Promise<{
  templates: Record<EmailTemplateKey, { content: EmailTemplateContent; isOverridden: boolean }>;
  warning: string | null;
}> {
  const templates = Object.fromEntries(
    EMAIL_TEMPLATE_KEYS.map((templateKey) => [
      templateKey,
      {
        content: DEFAULT_EMAIL_TEMPLATE_CONTENTS[templateKey],
        isOverridden: false,
      },
    ])
  ) as Record<EmailTemplateKey, { content: EmailTemplateContent; isOverridden: boolean }>;

  const supabase = getServiceSupabase();
  const { data, error } = await supabase.from("email_template_overrides").select(TEMPLATE_COLUMNS);

  if (error) {
    if (isMissingTableError(error)) {
      return {
        templates,
        warning:
          "email_template_overrides tablosu bulunamadı. Varsayılan e-posta şablonları gösteriliyor. Migration çalıştırın.",
      };
    }

    return {
      templates,
      warning: `Şablonlar yüklenirken hata oluştu: ${error.message}`,
    };
  }

  const rows = Array.isArray(data) ? (data as EmailTemplateOverrideRow[]) : [];
  for (const row of rows) {
    if (!isEmailTemplateKey(row.template_key)) continue;

    templates[row.template_key] = {
      content: toTemplateContent(row.template_key, row),
      isOverridden: true,
    };
  }

  return { templates, warning: null };
}

export async function upsertEmailTemplateOverride(
  templateKey: EmailTemplateKey,
  content: EmailTemplateContent
): Promise<void> {
  const supabase = getServiceSupabase();

  const payload = {
    template_key: templateKey,
    ...toDatabasePayload(content),
  };

  const { error } = await supabase
    .from("email_template_overrides")
    .upsert(payload, { onConflict: "template_key" });

  if (error) {
    console.error("Email template upsert failed:", error);
    throw new Error("Şablon kaydedilemedi.");
  }
}

export async function deleteEmailTemplateOverride(templateKey: EmailTemplateKey): Promise<void> {
  const supabase = getServiceSupabase();

  const { error } = await supabase
    .from("email_template_overrides")
    .delete()
    .eq("template_key", templateKey);

  if (error && !isMissingTableError(error)) {
    console.error("Email template reset failed:", error);
    throw new Error("Şablon varsayılan değerlere sıfırlanamadı.");
  }
}
