import { BarChart3, Gem, Layers3, ShieldCheck } from "lucide-react";
import { getServiceSupabase } from "@/lib/supabase";

type SiteStatus = "draft" | "paid" | "active" | "expired" | "premium";

interface RecentSite {
  id: string;
  slug: string;
  recipient_name: string;
  template_id: string;
  status: SiteStatus;
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

function getStatusBadge(status: SiteStatus) {
  const statusMap: Record<SiteStatus, { label: string; className: string }> = {
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
  const recentSites = (recentSitesResult.data ?? []) as RecentSite[];
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

        <section className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Recent 50 Sites</h2>
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
                </tr>
              </thead>
              <tbody>
                {recentSites.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">
                      Gösterilecek site bulunamadı.
                    </td>
                  </tr>
                ) : (
                  recentSites.map((site) => {
                    const statusBadge = getStatusBadge(site.status);
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
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
