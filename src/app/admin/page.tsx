import { CircleDollarSign, CreditCard, Layers3, Percent, ShieldCheck } from "lucide-react";
import { getServiceSupabase } from "@/lib/supabase";
import AdminSitesTable, { type AdminSiteRow } from "./AdminSitesTable";
import AdminTopNav from "./AdminTopNav";

const BASE_PACKAGE_PRICE_TRY = 299;
const PAID_STATUSES = ["active", "paid", "premium", "standard"] as const;

export default async function AdminDashboardPage() {
  const supabase = getServiceSupabase();

  const [totalSitesResult, paidSitesResult, recentSitesResult] = await Promise.all([
    supabase.from("sites").select("*", { count: "exact", head: true }),
    supabase
      .from("sites")
      .select("*", { count: "exact", head: true })
      .in("status", [...PAID_STATUSES]),
    supabase
      .from("sites")
      .select("id, slug, recipient_name, template_id, status, created_at")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const totalSites = totalSitesResult.count ?? 0;
  const paidSites = paidSitesResult.count ?? 0;
  const conversionRate = totalSites > 0 ? (paidSites / totalSites) * 100 : 0;
  const formattedConversionRate = `${conversionRate.toLocaleString("tr-TR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  })}%`;
  const estimatedRevenue = paidSites * BASE_PACKAGE_PRICE_TRY;
  const formattedRevenue = new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(estimatedRevenue);

  const recentSites = (recentSitesResult.data ?? []) as AdminSiteRow[];
  const fetchError =
    totalSitesResult.error?.message ||
    paidSitesResult.error?.message ||
    recentSitesResult.error?.message ||
    null;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
        <header className="flex flex-col gap-3">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
            <ShieldCheck className="h-4 w-4" />
            Internal Admin
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Admin Overview</h1>
          <p className="text-sm text-muted-foreground">
            Platformun temel KPI metrikleri ve son site aktiviteleri.
          </p>
        </header>

        <AdminTopNav />

        {fetchError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Admin verileri yüklenirken hata oluştu: {fetchError}
          </div>
        )}

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Toplam Site</p>
                <p className="mt-2 text-3xl font-bold text-foreground">{totalSites}</p>
                <p className="mt-1 text-xs text-muted-foreground">Tüm oluşturulan siteler</p>
              </div>
              <span className="rounded-lg bg-slate-100 p-2 text-slate-700">
                <Layers3 className="h-5 w-5" />
              </span>
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Paid Siteler</p>
                <p className="mt-2 text-3xl font-bold text-foreground">{paidSites}</p>
                <p className="mt-1 text-xs text-muted-foreground">Status: active/paid/premium/standard</p>
              </div>
              <span className="rounded-lg bg-slate-100 p-2 text-slate-700">
                <CreditCard className="h-5 w-5" />
              </span>
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Dönüşüm Oranı</p>
                <p className="mt-2 text-3xl font-bold text-foreground">{formattedConversionRate}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {paidSites} / {totalSites} ödeme dönüşümü
                </p>
              </div>
              <span className="rounded-lg bg-slate-100 p-2 text-slate-700">
                <Percent className="h-5 w-5" />
              </span>
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Toplam Ciro (Tahmini)</p>
                <p className="mt-2 text-3xl font-bold text-foreground">{formattedRevenue}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {paidSites} x {BASE_PACKAGE_PRICE_TRY} TL baz fiyat
                </p>
              </div>
              <span className="rounded-lg bg-slate-100 p-2 text-slate-700">
                <CircleDollarSign className="h-5 w-5" />
              </span>
            </div>
          </article>
        </section>

        <AdminSitesTable sites={recentSites} />
      </div>
    </div>
  );
}
