import { Gem, Layers3, ShieldCheck } from "lucide-react";
import { getServiceSupabase } from "@/lib/supabase";
import AdminSitesTable, { type AdminSiteRow } from "./AdminSitesTable";

export default async function AdminDashboardPage() {
  const supabase = getServiceSupabase();

  const [totalSitesResult, paidPremiumResult, recentSitesResult] = await Promise.all([
    supabase.from("sites").select("*", { count: "exact", head: true }),
    supabase
      .from("sites")
      .select("*", { count: "exact", head: true })
      .or("status.eq.active,status.eq.paid,package_type.eq.premium"),
    supabase
      .from("sites")
      .select("id, slug, recipient_name, template_id, status, created_at")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const totalSitesCreated = totalSitesResult.count ?? 0;
  const totalPaidPremiumSites = paidPremiumResult.count ?? 0;
  const recentSites = (recentSitesResult.data ?? []) as AdminSiteRow[];
  const fetchError =
    totalSitesResult.error?.message ||
    paidPremiumResult.error?.message ||
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
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Platform Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Sistem metrikleri ve en güncel site kayıtları.
          </p>
        </header>

        {fetchError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Admin verileri yüklenirken hata oluştu: {fetchError}
          </div>
        )}

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <article className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Sites Created</p>
                <p className="mt-2 text-3xl font-bold text-foreground">{totalSitesCreated}</p>
              </div>
              <span className="rounded-lg bg-primary/10 p-2 text-primary">
                <Layers3 className="h-5 w-5" />
              </span>
            </div>
          </article>

          <article className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Paid/Premium Sites</p>
                <p className="mt-2 text-3xl font-bold text-foreground">{totalPaidPremiumSites}</p>
              </div>
              <span className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600">
                <Gem className="h-5 w-5" />
              </span>
            </div>
          </article>
        </section>

        <AdminSitesTable sites={recentSites} />
      </div>
    </div>
  );
}
