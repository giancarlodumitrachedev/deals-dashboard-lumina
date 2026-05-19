import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "alert" | "muted" | "ok";

const tones: Record<Tone, string> = {
  neutral: "bg-surface-2 text-primary",
  muted: "bg-surface-2 text-muted",
  alert: "bg-alert text-white",
  ok: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
