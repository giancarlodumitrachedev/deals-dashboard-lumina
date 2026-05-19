"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...rest }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          "h-9 w-full rounded-md border border-line bg-surface px-3 text-sm text-primary",
          "placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-muted",
          className,
        )}
        {...rest}
      />
    );
  },
);
