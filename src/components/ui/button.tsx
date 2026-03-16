import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

type ButtonProps = {
  href?: string;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const styles = {
  primary:
    "inline-flex items-center justify-center rounded-full bg-gold-300 px-5 py-3 text-sm font-semibold text-base-950 transition hover:bg-gold-200",
  secondary:
    "inline-flex items-center justify-center rounded-full border border-white/12 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-gold-300/40 hover:bg-white/10",
  ghost: "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium text-white/70 transition hover:text-white"
};

export function Button({ href, variant = "primary", className, children, ...props }: ButtonProps) {
  if (href) {
    return (
      <Link href={href} className={cn(styles[variant], className)}>
        {children}
      </Link>
    );
  }

  return (
    <button className={cn(styles[variant], className)} {...props}>
      {children}
    </button>
  );
}
