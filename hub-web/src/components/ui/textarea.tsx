import * as React from "react";
import { cn } from "../../lib/utils";

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "block w-full min-h-[90px] resize-y rounded-md border border-divider bg-neutral-100 px-3.5 py-2.5 text-sm leading-relaxed text-text placeholder:text-neutral-600 hover:border-[color-mix(in_srgb,var(--color-text)_45%,transparent)] focus-visible:border-accent outline-none disabled:opacity-45",
        className
      )}
      {...props}
    />
  );
}
