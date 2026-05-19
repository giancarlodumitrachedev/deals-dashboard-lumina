import { cn } from "@/lib/utils";

export function StatTile({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "alert";
}) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-white p-4 shadow-card",
        tone === "alert" ? "border-alert-ring" : "border-ink-200",
      )}
    >
      <div className="text-xs uppercase tracking-wider text-ink-500">{label}</div>
      <div className={cn("mt-1 text-2xl font-semibold", tone === "alert" ? "text-alert" : "text-ink-900")}>
        {value}
      </div>
    </div>
  );
}
