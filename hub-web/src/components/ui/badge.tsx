import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full text-[11px] font-medium tracking-wide px-2.5 py-0.5 whitespace-nowrap",
  {
    variants: {
      variant: {
        accent: "bg-accent-100 text-accent-800",
        accent2: "bg-accent-2-100 text-accent-2-800",
        neutral: "bg-neutral-200 text-neutral-700",
        outline: "border border-accent text-accent",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  }
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
