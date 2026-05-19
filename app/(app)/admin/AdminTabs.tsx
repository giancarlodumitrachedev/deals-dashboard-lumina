"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { UI } from "@/lib/i18n/it";
import { OperativitaTab, type AdminDealSummary } from "./OperativitaTab";
import { AnaliticheTab } from "./AnaliticheTab";
import { CommissioniTab } from "./CommissioniTab";

interface CommissionRow {
  id: string;
  amount: number;
  status: "pending" | "paid";
  paid_at: string | null;
  created_at: string;
  deal: { id: string; client_name: string; value: number } | null;
  user: { id: string; full_name: string } | null;
}

type Tab = "ops" | "analytics" | "commissions";

export function AdminTabs({ deals, commissions }: { deals: AdminDealSummary[]; commissions: CommissionRow[] }) {
  const [tab, setTab] = useState<Tab>("ops");

  return (
    <div className="space-y-4">
      <nav className="flex gap-1 border-b border-ink-200">
        <TabButton active={tab === "ops"} onClick={() => setTab("ops")}>
          {UI.nav.operativita}
        </TabButton>
        <TabButton active={tab === "analytics"} onClick={() => setTab("analytics")}>
          {UI.nav.analitiche}
        </TabButton>
        <TabButton active={tab === "commissions"} onClick={() => setTab("commissions")}>
          {UI.nav.commissioni}
        </TabButton>
      </nav>

      {tab === "ops" && <OperativitaTab deals={deals} />}
      {tab === "analytics" && <AnaliticheTab deals={deals} />}
      {tab === "commissions" && <CommissioniTab commissions={commissions} />}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "-mb-px px-4 py-2 text-sm font-medium transition-colors",
        active
          ? "border-b-2 border-ink-900 text-ink-900"
          : "border-b-2 border-transparent text-ink-500 hover:text-ink-800",
      )}
    >
      {children}
    </button>
  );
}
