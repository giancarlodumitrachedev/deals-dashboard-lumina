"use client";

import { useTheme, type ThemeMode } from "./ThemeProvider";
import { cn } from "@/lib/utils";

const MODES: { value: ThemeMode; label: string; icon: string }[] = [
  { value: "light", label: "Chiaro", icon: "☀" },
  { value: "dark", label: "Scuro", icon: "☾" },
  { value: "system", label: "Sistema", icon: "◐" },
];

export function ThemeToggle() {
  const { mode, setMode } = useTheme();
  return (
    <div className="flex items-center gap-0.5 rounded-md border border-line bg-surface p-0.5">
      {MODES.map((m) => (
        <button
          key={m.value}
          onClick={() => setMode(m.value)}
          aria-label={m.label}
          title={m.label}
          className={cn(
            "rounded px-2 py-1 text-xs transition-colors",
            mode === m.value
              ? "bg-primary text-base"
              : "text-muted hover:text-primary",
          )}
        >
          {m.icon}
        </button>
      ))}
    </div>
  );
}
