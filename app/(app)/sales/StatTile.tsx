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
        "rounded-lg border bg-surface p-4 shadow-card",
        tone === "alert" ? "border-alert-ring" : "border-line",
      )}
    >
      <div className="text-xs uppercase tracking-wider text-muted">{label}</div>
      <div className={cn("mt-1 text-2xl font-semibold", tone === "alert" ? "text-alert" : "text-primary")}>
        {value}
      </div>
    </div>
  );
}
