"use client";

import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...rest }, ref) {
    return (
      <select
        ref={ref}
        className={cn(
          "h-9 w-full appearance-none rounded-md border border-ink-200 bg-white px-3 pr-8 text-sm",
          "focus:outline-none focus:ring-2 focus:ring-ink-900/10 focus:border-ink-400",
          className,
        )}
        {...rest}
      >
        {children}
      </select>
    );
  },
);
