import { FileText } from "lucide-react";
import AdminTopNav from "../AdminTopNav";
import EmailTemplatesManager, { type EmailTemplateEditorItem } from "./EmailTemplatesManager";
import { getEmailTemplateEditorState } from "@/lib/email";
import {
  DEFAULT_EMAIL_TEMPLATE_CONTENTS,
  EMAIL_TEMPLATE_EDITOR_CONFIG,
  EMAIL_TEMPLATE_KEYS,
} from "@/lib/email/templates";

export default async function AdminEmailTemplatesPage() {
  const { templates, warning } = await getEmailTemplateEditorState();

  const editorItems: EmailTemplateEditorItem[] = EMAIL_TEMPLATE_KEYS.map((templateKey) => ({
    key: templateKey,
    label: EMAIL_TEMPLATE_EDITOR_CONFIG[templateKey].label,
    description: EMAIL_TEMPLATE_EDITOR_CONFIG[templateKey].description,
    placeholders: EMAIL_TEMPLATE_EDITOR_CONFIG[templateKey].placeholders,
    isOverridden: templates[templateKey].isOverridden,
    content: templates[templateKey].content,
    defaultContent: DEFAULT_EMAIL_TEMPLATE_CONTENTS[templateKey],
  }));

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 lg:px-8">
        <header className="flex flex-col gap-3">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
            <FileText className="h-4 w-4" />
            Internal Admin
          </div>
          <h1 className="text-2xl font-bold text-foreground lg:text-3xl">Email Templates</h1>
          <p className="text-sm text-muted-foreground">
            E-posta şablonlarını admin panelinden düzenleyin. Değişiklikler bir sonraki gönderimde otomatik uygulanır.
          </p>
        </header>

        <AdminTopNav />

        {warning && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {warning}
          </div>
        )}

        <EmailTemplatesManager templates={editorItems} />
      </div>
    </div>
  );
}
