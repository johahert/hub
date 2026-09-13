import * as React from "react";
import { cn } from "../../lib/utils";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "block w-full min-h-9 rounded-full border border-divider bg-surface px-3.5 py-1.5 text-sm text-text placeholder:text-neutral-600 hover:border-[color-mix(in_srgb,var(--color-text)_45%,transparent)] focus-visible:border-accent outline-none disabled:opacity-45",
        className
      )}
      {...props}
    />
  );
}
