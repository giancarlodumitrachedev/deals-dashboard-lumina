"use client";

import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...rest }, ref) {
    return (
      <select
        ref={ref}
        className={cn(
          "h-9 w-full appearance-none rounded-md border border-line bg-surface px-3 pr-8 text-sm text-primary",
          "focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-muted",
          className,
        )}
        {...rest}
      >
        {children}
      </select>
    );
  },
);
