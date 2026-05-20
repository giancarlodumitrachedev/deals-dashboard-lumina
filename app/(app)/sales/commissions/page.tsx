import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { COMMISSION_STATUS_LABEL } from "@/lib/i18n/it";
import { formatEuro } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface CommissionJoinRow {
  id: string;
  amount: number;
  status: "pending" | "paid";
  paid_at: string | null;
  receipt_url: string | null;
  created_at: string;
  deal: { client_name: string } | { client_name: string }[] | null;
}

export default async function SalesCommissionsPage() {
  const session = await requireSession();
  if (session.role !== "sales") redirect("/");

  const supabase = createSupabaseServerClient();
  const { data: raw } = await supabase
    .from("commissions")
    .select("id, amount, status, paid_at, receipt_url, created_at, deal:deals(client_name)")
    .eq("user_id", session.userId)
    .order("created_at", { ascending: false });

  const rows = (raw ?? []).map((c: CommissionJoinRow) => ({
    id: c.id,
    amount: Number(c.amount),
    status: c.status,
    paid_at: c.paid_at,
    receipt_url: c.receipt_url,
    client: Array.isArray(c.deal) ? c.deal[0]?.client_name : c.deal?.client_name,
  }));

  const pending = rows.filter((r) => r.status === "pending").reduce((s, r) => s + r.amount, 0);
  const paid = rows.filter((r) => r.status === "paid").reduce((s, r) => s + r.amount, 0);

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Le mie commissioni</h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Card className="p-4">
          <div className="text-xs uppercase tracking-wider text-muted">Da ricevere</div>
          <div className="mt-1 text-2xl font-semibold text-alert">{formatEuro(pending)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs uppercase tracking-wider text-muted">Già pagate</div>
          <div className="mt-1 text-2xl font-semibold text-primary">{formatEuro(paid)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs uppercase tracking-wider text-muted">Totale</div>
          <div className="mt-1 text-2xl font-semibold text-primary">{formatEuro(pending + paid)}</div>
        </Card>
      </div>

      <Card>
        {rows.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted">Nessuna commissione registrata.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-line bg-surface-2 text-left text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-2 font-medium">Cliente</th>
                <th className="px-4 py-2 font-medium">Importo</th>
                <th className="px-4 py-2 font-medium">Stato</th>
                <th className="px-4 py-2 font-medium">Pagata il</th>
                <th className="px-4 py-2 font-medium">Ricevuta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-2 font-medium text-primary">{r.client ?? "—"}</td>
                  <td className="px-4 py-2 text-primary">{formatEuro(r.amount)}</td>
                  <td className="px-4 py-2">
                    <Badge tone={r.status === "paid" ? "ok" : "alert"}>
                      {COMMISSION_STATUS_LABEL[r.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-2 text-xs text-faint">
                    {r.paid_at ? new Date(r.paid_at).toLocaleDateString("it-IT") : "—"}
                  </td>
                  <td className="px-4 py-2 text-xs">
                    {r.receipt_url ? (
                      <a
                        href={r.receipt_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted underline-offset-2 hover:text-primary hover:underline"
                      >
                        Apri →
                      </a>
                    ) : (
                      <span className="text-faint">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
