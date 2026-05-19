"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...rest }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          "h-9 w-full rounded-md border border-ink-200 bg-white px-3 text-sm",
          "placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-ink-900/10 focus:border-ink-400",
          className,
        )}
        {...rest}
      />
    );
  },
);
