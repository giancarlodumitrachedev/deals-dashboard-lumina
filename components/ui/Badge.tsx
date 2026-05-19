import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "alert" | "muted" | "ok";

const tones: Record<Tone, string> = {
  neutral: "bg-ink-100 text-ink-800",
  muted: "bg-ink-50 text-ink-500",
  alert: "bg-alert text-white",
  ok: "bg-emerald-100 text-emerald-800",
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
