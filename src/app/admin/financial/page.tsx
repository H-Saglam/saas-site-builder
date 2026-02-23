import { BarChart3, Gem, LayoutTemplate, Percent, WalletCards } from "lucide-react";
import { getServiceSupabase } from "@/lib/supabase";
import AdminTopNav from "../AdminTopNav";

const PACKAGE_PRICE_TRY = 149;

function formatCurrencyTRY(amount: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function AdminFinancialPage() {
  const supabase = getServiceSupabase();

  const [totalSitesResult, paidSitesResult, templateRowsResult] = await Promise.all([
    supabase.from("sites").select("*", { count: "exact", head: true }),
    supabase
      .from("sites")
      .select("*", { count: "exact", head: true })
      .or("status.eq.active,status.eq.premium,package_type.eq.premium"),
    supabase.from("sites").select("template_id"),
  ]);

  const totalSites = totalSitesResult.count ?? 0;
  const paidSites = paidSitesResult.count ?? 0;
  const conversionRate = totalSites > 0 ? (paidSites / totalSites) * 100 : 0;
  const estimatedRevenue = paidSites * PACKAGE_PRICE_TRY;

  const templateRows = (templateRowsResult.data ?? []) as { template_id: string | null }[];
  const templatePopularity = templateRows.reduce<Record<string, number>>((acc, row) => {
    const key = row.template_id?.trim() || "unknown";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
  const sortedTemplates = Object.entries(templatePopularity).sort((a, b) => b[1] - a[1]);
  const topTemplate = sortedTemplates[0] ?? null;
  const topTemplateCount = topTemplate?.[1] ?? 0;
  const fetchError =
    totalSitesResult.error?.message || paidSitesResult.error?.message || templateRowsResult.error?.message || null;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
        <header className="flex flex-col gap-3">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
            <WalletCards className="h-4 w-4" />
            Internal Admin
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Financial Intelligence</h1>
          <p className="text-sm text-muted-foreground">
            Dönüşüm, gelir tahmini ve şablon performansının finansal özeti.
          </p>
        </header>

        <AdminTopNav />

        {fetchError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Finansal veriler yüklenirken hata oluştu: {fetchError}
          </div>
        )}

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <article className="rounded-xl border border-border bg-gradient-to-br from-card to-primary/5 p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Dönüşüm Oranı</p>
                <p className="mt-2 text-3xl font-bold text-foreground">
                  {conversionRate.toLocaleString("tr-TR", { minimumFractionDigits: 1, maximumFractionDigits: 2 })}%
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {paidSites} / {totalSites || 0} ödeme dönüşümü
                </p>
              </div>
              <span className="rounded-lg bg-primary/10 p-2 text-primary">
                <Percent className="h-5 w-5" />
              </span>
            </div>
          </article>

          <article className="rounded-xl border border-border bg-gradient-to-br from-card to-emerald-500/10 p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Toplam Ciro (Tahmini)</p>
                <p className="mt-2 text-3xl font-bold text-foreground">{formatCurrencyTRY(estimatedRevenue)}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Paket fiyatı {PACKAGE_PRICE_TRY} TL baz alınmıştır
                </p>
              </div>
              <span className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600">
                <WalletCards className="h-5 w-5" />
              </span>
            </div>
          </article>

          <article className="rounded-xl border border-border bg-gradient-to-br from-card to-violet-500/10 p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Paid Site Sayısı</p>
                <p className="mt-2 text-3xl font-bold text-foreground">{paidSites}</p>
                <p className="mt-1 text-xs text-muted-foreground">active/premium durumları</p>
              </div>
              <span className="rounded-lg bg-violet-500/10 p-2 text-violet-600">
                <Gem className="h-5 w-5" />
              </span>
            </div>
          </article>

          <article className="rounded-xl border border-border bg-gradient-to-br from-card to-blue-500/10 p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En Popüler Şablon</p>
                <p className="mt-2 text-xl font-bold text-foreground">{topTemplate?.[0] ?? "-"}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {topTemplate ? `${topTemplateCount} kullanım` : "Henüz veri yok"}
                </p>
              </div>
              <span className="rounded-lg bg-blue-500/10 p-2 text-blue-600">
                <LayoutTemplate className="h-5 w-5" />
              </span>
            </div>
          </article>
        </section>

        <section className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Template Popularity</h2>
          </div>

          <div className="p-5 space-y-3">
            {sortedTemplates.length === 0 ? (
              <p className="text-sm text-muted-foreground">Şablon popülerliği için veri bulunamadı.</p>
            ) : (
              sortedTemplates.slice(0, 8).map(([templateId, count]) => {
                const widthPercent = topTemplateCount > 0 ? (count / topTemplateCount) * 100 : 0;
                return (
                  <div key={templateId} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">{templateId}</span>
                      <span className="text-muted-foreground">{count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${Math.max(4, widthPercent)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
