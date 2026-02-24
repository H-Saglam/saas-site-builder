"use client";

import { useState, useTransition } from "react";
import { Loader2, RefreshCw, Save } from "lucide-react";
import { saveEmailTemplate, resetEmailTemplate } from "./actions";
import type { EmailTemplateContent, EmailTemplateKey } from "@/lib/email/templates";

export interface EmailTemplateEditorItem {
  key: EmailTemplateKey;
  label: string;
  description: string;
  placeholders: string[];
  isOverridden: boolean;
  content: EmailTemplateContent;
  defaultContent: EmailTemplateContent;
}

interface TemplateState {
  content: EmailTemplateContent;
  isOverridden: boolean;
}

function fieldLabel(field: keyof EmailTemplateContent): string {
  const labels: Record<keyof EmailTemplateContent, string> = {
    subject: "Subject",
    preheader: "Preheader",
    eyebrow: "Eyebrow",
    title: "Title",
    subtitle: "Subtitle",
    bodyHtml: "Body HTML",
    textBody: "Text Body",
    ctaLabel: "CTA Label (Opsiyonel)",
    footerHtml: "Footer HTML (Opsiyonel)",
  };

  return labels[field];
}

export default function EmailTemplatesManager({ templates }: { templates: EmailTemplateEditorItem[] }) {
  const [isPending, startTransition] = useTransition();
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error" | null>(null);
  const [states, setStates] = useState<Record<EmailTemplateKey, TemplateState>>(() => {
    const entries = templates.map((item) => [item.key, { content: item.content, isOverridden: item.isOverridden }]);
    return Object.fromEntries(entries) as Record<EmailTemplateKey, TemplateState>;
  });

  function updateField(templateKey: EmailTemplateKey, field: keyof EmailTemplateContent, value: string) {
    setStates((previous) => ({
      ...previous,
      [templateKey]: {
        ...previous[templateKey],
        content: {
          ...previous[templateKey].content,
          [field]: value,
        },
      },
    }));
  }

  function runSave(templateKey: EmailTemplateKey) {
    setPendingKey(`${templateKey}:save`);
    setMessage(null);
    setMessageType(null);

    startTransition(() => {
      saveEmailTemplate(templateKey, states[templateKey].content)
        .then(() => {
          setStates((previous) => ({
            ...previous,
            [templateKey]: {
              ...previous[templateKey],
              isOverridden: true,
            },
          }));
          setMessage("Şablon kaydedildi.");
          setMessageType("success");
        })
        .catch((error: unknown) => {
          setMessage((error as Error)?.message ?? "Şablon kaydedilemedi.");
          setMessageType("error");
        })
        .finally(() => setPendingKey(null));
    });
  }

  function runReset(templateKey: EmailTemplateKey, defaultContent: EmailTemplateContent) {
    setPendingKey(`${templateKey}:reset`);
    setMessage(null);
    setMessageType(null);

    startTransition(() => {
      resetEmailTemplate(templateKey)
        .then(() => {
          setStates((previous) => ({
            ...previous,
            [templateKey]: {
              content: defaultContent,
              isOverridden: false,
            },
          }));
          setMessage("Şablon varsayılana döndürüldü.");
          setMessageType("success");
        })
        .catch((error: unknown) => {
          setMessage((error as Error)?.message ?? "Şablon sıfırlanamadı.");
          setMessageType("error");
        })
        .finally(() => setPendingKey(null));
    });
  }

  return (
    <section className="space-y-4">
      {message && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            messageType === "error"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {message}
        </div>
      )}

      {templates.map((template) => {
        const templateState = states[template.key];
        const isSavePending = isPending && pendingKey === `${template.key}:save`;
        const isResetPending = isPending && pendingKey === `${template.key}:reset`;
        const isRowPending = isSavePending || isResetPending;

        return (
          <article
            key={template.key}
            className="rounded-2xl border border-border bg-card p-5 shadow-sm"
          >
            <header className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-base font-semibold text-foreground">{template.label}</h2>
                <p className="text-xs text-muted-foreground">{template.description}</p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 font-medium ${
                    templateState.isOverridden
                      ? "bg-amber-100 text-amber-700"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {templateState.isOverridden ? "Override Aktif" : "Varsayılan"}
                </span>
              </div>
            </header>

            <div className="mb-4 rounded-xl border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
              Kullanılabilir değişkenler: {template.placeholders.join(", ")}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {([
                "subject",
                "preheader",
                "eyebrow",
                "title",
                "subtitle",
                "ctaLabel",
              ] as (keyof EmailTemplateContent)[]).map((field) => (
                <label key={field} className="space-y-1 text-sm">
                  <span className="text-xs font-medium text-muted-foreground">{fieldLabel(field)}</span>
                  <input
                    value={templateState.content[field] ?? ""}
                    onChange={(event) => updateField(template.key, field, event.target.value)}
                    className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                  />
                </label>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4">
              {(["bodyHtml", "textBody", "footerHtml"] as (keyof EmailTemplateContent)[]).map((field) => (
                <label key={field} className="space-y-1 text-sm">
                  <span className="text-xs font-medium text-muted-foreground">{fieldLabel(field)}</span>
                  <textarea
                    value={templateState.content[field] ?? ""}
                    onChange={(event) => updateField(template.key, field, event.target.value)}
                    rows={field === "textBody" ? 6 : 8}
                    className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                  />
                </label>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={isRowPending}
                onClick={() => runSave(template.key)}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {isSavePending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {isSavePending ? "Kaydediliyor..." : "Kaydet"}
              </button>

              <button
                type="button"
                disabled={isRowPending}
                onClick={() => runReset(template.key, template.defaultContent)}
                className="inline-flex items-center gap-2 rounded-lg bg-muted px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-border hover:text-foreground disabled:opacity-60"
              >
                {isResetPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                {isResetPending ? "Sıfırlanıyor..." : "Varsayılana Dön"}
              </button>
            </div>
          </article>
        );
      })}
    </section>
  );
}
