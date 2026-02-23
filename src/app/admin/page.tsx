import { BarChart3, Gem, Layers3, Percent, ShieldCheck, WalletCards } from "lucide-react";
import { getServiceSupabase } from "@/lib/supabase";
import { TEMPLATES } from "@/lib/templates";
import AdminSitesTable, { type AdminSiteRow } from "./AdminSitesTable";
import AdminTopNav from "./AdminTopNav";

const PACKAGE_PRICES_TRY = {
  standard: 149,
  premium: 249,
} as const;

export default async function AdminDashboardPage() {
  const supabase = getServiceSupabase();
  const templateIds = TEMPLATES.map((template) => template.id);

  const [
    totalSitesResult,
    draftSitesResult,
    paidSitesResult,
    premiumPaidSitesResult,
    recentSitesResult,
    templateCountResults,
  ] = await Promise.all([
    supabase.from("sites").select("*", { count: "exact", head: true }),
    supabase.from("sites").select("*", { count: "exact", head: true }).eq("status", "draft"),
    supabase
      .from("sites")
      .select("*", { count: "exact", head: true })
      .in("status", ["active", "premium"]),
    supabase
      .from("sites")
      .select("*", { count: "exact", head: true })
      .in("status", ["active", "premium"])
      .eq("package_type", "premium"),
    supabase
      .from("sites")
      .select("id, slug, recipient_name, template_id, status, created_at")
      .order("created_at", { ascending: false })
      .limit(50),
    Promise.all(
      templateIds.map((templateId) =>
        supabase
          .from("sites")
          .select("*", { count: "exact", head: true })
          .eq("template_id", templateId)
      )
    ),
  ]);

  const totalSites = totalSitesResult.count ?? 0;
  const draftSites = draftSitesResult.count ?? 0;
  const paidSites = paidSitesResult.count ?? 0;
  const premiumPaidSites = premiumPaidSitesResult.count ?? 0;
  const standardPaidSites = Math.max(0, paidSites - premiumPaidSites);
  const conversionRate = totalSites > 0 ? (paidSites / totalSites) * 100 : 0;
  const formattedConversionRate = `${conversionRate.toLocaleString("tr-TR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  })}%`;
  const estimatedRevenue =
    standardPaidSites * PACKAGE_PRICES_TRY.standard + premiumPaidSites * PACKAGE_PRICES_TRY.premium;
  const formattedRevenue = new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(estimatedRevenue);

  const templateCountError = templateCountResults.find((result) => result.error)?.error?.message ?? null;
  const sortedTemplatePopularity = templateIds
    .map((templateId, index) => [templateId, templateCountResults[index]?.count ?? 0] as const)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]);
  const mostPopularTemplate = sortedTemplatePopularity[0] ?? null;
  const topTemplates = sortedTemplatePopularity.slice(0, 3);

  const recentSites = (recentSitesResult.data ?? []) as AdminSiteRow[];
  const fetchError =
    totalSitesResult.error?.message ||
    draftSitesResult.error?.message ||
    paidSitesResult.error?.message ||
    premiumPaidSitesResult.error?.message ||
    recentSitesResult.error?.message ||
    templateCountError ||
    null;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
        <header className="flex flex-col gap-3">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
            <ShieldCheck className="h-4 w-4" />
            Internal Admin
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Admin Operations</h1>
          <p className="text-sm text-muted-foreground">
            Operasyonel metrikler ve manuel site yönetimi.
          </p>
        </header>

        <AdminTopNav />

        {fetchError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Admin verileri yüklenirken hata oluştu: {fetchError}
          </div>
        )}

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
          <article className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Toplam Site</p>
                <p className="mt-2 text-3xl font-bold text-foreground">{totalSites}</p>
                <p className="mt-1 text-xs text-muted-foreground">Draft: {draftSites}</p>
              </div>
              <span className="rounded-lg bg-primary/10 p-2 text-primary">
                <Layers3 className="h-5 w-5" />
              </span>
            </div>
          </article>

          <article className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Paid Siteler</p>
                <p className="mt-2 text-3xl font-bold text-foreground">{paidSites}</p>
                <p className="mt-1 text-xs text-muted-foreground">Status: active/premium</p>
              </div>
              <span className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600">
                <Gem className="h-5 w-5" />
              </span>
            </div>
          </article>

          <article className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Dönüşüm Oranı</p>
                <p className="mt-2 text-3xl font-bold text-foreground">{formattedConversionRate}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {paidSites} / {totalSites} site
                </p>
              </div>
              <span className="rounded-lg bg-amber-500/10 p-2 text-amber-600">
                <Percent className="h-5 w-5" />
              </span>
            </div>
          </article>

          <article className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Toplam Ciro (Tahmini)</p>
                <p className="mt-2 text-3xl font-bold text-foreground">{formattedRevenue}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Std {standardPaidSites} x {PACKAGE_PRICES_TRY.standard} TL + Prm {premiumPaidSites} x {PACKAGE_PRICES_TRY.premium} TL
                </p>
              </div>
              <span className="rounded-lg bg-blue-500/10 p-2 text-blue-600">
                <WalletCards className="h-5 w-5" />
              </span>
            </div>
          </article>

          <article className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En Popüler Şablon</p>
                <p className="mt-2 text-xl font-bold text-foreground">
                  {mostPopularTemplate ? mostPopularTemplate[0] : "-"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {mostPopularTemplate ? `${mostPopularTemplate[1]} kullanım` : "Veri yok"}
                </p>
                {topTemplates.length > 1 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {topTemplates.slice(1).map(([templateId, count]) => (
                      <span
                        key={templateId}
                        className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                      >
                        {templateId}: {count}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <span className="rounded-lg bg-violet-500/10 p-2 text-violet-600">
                <BarChart3 className="h-5 w-5" />
              </span>
            </div>
          </article>
        </section>

        <AdminSitesTable sites={recentSites} />
      </div>
    </div>
  );
}
