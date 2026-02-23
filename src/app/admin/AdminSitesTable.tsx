"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { updateSiteStatus } from "./actions";

export interface AdminSiteRow {
  id: string;
  slug: string;
  recipient_name: string;
  template_id: string;
  status: string;
  created_at: string;
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getStatusBadge(status: string) {
  const statusMap: Record<string, { label: string; className: string }> = {
    draft: {
      label: "Draft",
      className: "bg-stone-100 text-stone-600 ring-stone-200",
    },
    paid: {
      label: "Paid",
      className: "bg-blue-50 text-blue-600 ring-blue-200",
    },
    active: {
      label: "Active",
      className: "bg-emerald-50 text-emerald-600 ring-emerald-200",
    },
    expired: {
      label: "Expired",
      className: "bg-red-50 text-red-600 ring-red-200",
    },
    premium: {
      label: "Premium",
      className: "bg-violet-50 text-violet-600 ring-violet-200",
    },
  };

  return statusMap[status] ?? {
    label: status,
    className: "bg-stone-100 text-stone-600 ring-stone-200",
  };
}

export default function AdminSitesTable({ sites }: { sites: AdminSiteRow[] }) {
  const [isPending, startTransition] = useTransition();
  const [pendingActionKey, setPendingActionKey] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<"success" | "error" | null>(null);

  function runStatusAction(
    siteId: string,
    newStatus: "active" | "draft",
    isPremium: boolean,
    actionKey: string,
    successText: string
  ) {
    setPendingActionKey(actionKey);
    setFeedbackMessage(null);
    setFeedbackType(null);

    startTransition(() => {
      updateSiteStatus(siteId, newStatus, isPremium)
        .then(() => {
          setFeedbackMessage(successText);
          setFeedbackType("success");
        })
        .catch((error: unknown) => {
          setFeedbackMessage((error as Error)?.message ?? "İşlem başarısız.");
          setFeedbackType("error");
        })
        .finally(() => {
          setPendingActionKey(null);
        });
    });
  }

  return (
    <section className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-foreground">Recent 50 Sites</h2>
        {feedbackMessage && (
          <p className={`text-xs ${feedbackType === "error" ? "text-red-600" : "text-emerald-600"}`}>
            {feedbackMessage}
          </p>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/40 text-muted-foreground">
            <tr>
              <th className="text-left font-medium px-5 py-3 whitespace-nowrap">Site ID / Slug</th>
              <th className="text-left font-medium px-5 py-3 whitespace-nowrap">Recipient Name</th>
              <th className="text-left font-medium px-5 py-3 whitespace-nowrap">Template ID</th>
              <th className="text-left font-medium px-5 py-3 whitespace-nowrap">Status</th>
              <th className="text-left font-medium px-5 py-3 whitespace-nowrap">Created At</th>
              <th className="text-left font-medium px-5 py-3 whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sites.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-muted-foreground">
                  Gösterilecek site bulunamadı.
                </td>
              </tr>
            ) : (
              sites.map((site) => {
                const statusBadge = getStatusBadge(site.status);
                const premiumActionKey = `${site.id}:premium`;
                const deactivateActionKey = `${site.id}:deactivate`;
                const isPremiumPending = isPending && pendingActionKey === premiumActionKey;
                const isDeactivatePending = isPending && pendingActionKey === deactivateActionKey;
                const rowDisabled = isPremiumPending || isDeactivatePending;

                return (
                  <tr key={site.id} className="border-t border-border hover:bg-muted/20">
                    <td className="px-5 py-3">
                      <div className="font-medium text-foreground">{site.slug}</div>
                      <div className="text-xs text-muted-foreground">{site.id}</div>
                    </td>
                    <td className="px-5 py-3 text-foreground">{site.recipient_name}</td>
                    <td className="px-5 py-3 text-foreground">{site.template_id}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadge.className}`}
                      >
                        {statusBadge.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{formatDate(site.created_at)}</td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={rowDisabled}
                          onClick={() =>
                            runStatusAction(
                              site.id,
                              "active",
                              true,
                              premiumActionKey,
                              "Site premium olarak aktive edildi."
                            )
                          }
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                        >
                          {isPremiumPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                          Make Premium
                        </button>
                        <button
                          type="button"
                          disabled={rowDisabled}
                          onClick={() => {
                            if (!window.confirm("Bu siteyi tekrar taslak duruma almak istiyor musunuz?")) return;
                            runStatusAction(
                              site.id,
                              "draft",
                              false,
                              deactivateActionKey,
                              "Site deaktif edilerek taslak duruma alındı."
                            );
                          }}
                          className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                        >
                          {isDeactivatePending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                          Deactivate
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
