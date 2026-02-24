"use server";

import { revalidatePath } from "next/cache";
import { isCurrentUserAdmin } from "@/lib/admin-auth";
import {
  deleteEmailTemplateOverride,
  upsertEmailTemplateOverride,
} from "@/lib/email/overrides";
import {
  EMAIL_TEMPLATE_KEYS,
  type EmailTemplateContent,
  type EmailTemplateKey,
} from "@/lib/email/templates";

function resolveTemplateKey(value: string): EmailTemplateKey | null {
  return EMAIL_TEMPLATE_KEYS.includes(value as EmailTemplateKey)
    ? (value as EmailTemplateKey)
    : null;
}

function sanitizeRequiredField(value: string, label: string): string {
  const normalized = value.trim();
  if (!normalized) {
    throw new Error(`${label} alanı boş olamaz.`);
  }
  return normalized;
}

function validateContent(content: EmailTemplateContent): EmailTemplateContent {
  return {
    subject: sanitizeRequiredField(content.subject, "Subject"),
    preheader: sanitizeRequiredField(content.preheader, "Preheader"),
    eyebrow: sanitizeRequiredField(content.eyebrow, "Eyebrow"),
    title: sanitizeRequiredField(content.title, "Title"),
    subtitle: sanitizeRequiredField(content.subtitle, "Subtitle"),
    bodyHtml: sanitizeRequiredField(content.bodyHtml, "Body HTML"),
    textBody: sanitizeRequiredField(content.textBody, "Text Body"),
    ctaLabel: content.ctaLabel?.trim() ? content.ctaLabel.trim() : undefined,
    footerHtml: content.footerHtml?.trim() ? content.footerHtml.trim() : undefined,
  };
}

export async function saveEmailTemplate(templateKeyInput: string, content: EmailTemplateContent) {
  if (!(await isCurrentUserAdmin())) {
    throw new Error("Bu işlem için admin yetkisi gerekli.");
  }

  const templateKey = resolveTemplateKey(templateKeyInput);
  if (!templateKey) {
    throw new Error("Geçersiz şablon anahtarı.");
  }

  const validatedContent = validateContent(content);
  await upsertEmailTemplateOverride(templateKey, validatedContent);

  revalidatePath("/admin/emails");
}

export async function resetEmailTemplate(templateKeyInput: string) {
  if (!(await isCurrentUserAdmin())) {
    throw new Error("Bu işlem için admin yetkisi gerekli.");
  }

  const templateKey = resolveTemplateKey(templateKeyInput);
  if (!templateKey) {
    throw new Error("Geçersiz şablon anahtarı.");
  }

  await deleteEmailTemplateOverride(templateKey);

  revalidatePath("/admin/emails");
}
