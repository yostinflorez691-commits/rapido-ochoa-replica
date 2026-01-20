"use client";

import { forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-dark)] focus-visible:ring-[var(--color-accent)]",
        secondary:
          "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] focus-visible:ring-[var(--color-primary)]",
        outline:
          "border border-[var(--color-gray-300)] bg-white text-[var(--color-gray-700)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]",
        ghost:
          "text-[var(--color-gray-700)] hover:bg-[var(--color-gray-100)]",
        link:
          "text-[var(--color-primary)] underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-9 px-3 text-xs rounded-[var(--radius-sm)]",
        default: "h-[45px] px-4 text-sm rounded-[var(--radius-base)]",
        lg: "h-[50px] px-6 text-sm rounded-[var(--radius-base)]",
        fixed: "h-[60px] px-6 text-base rounded-none w-full",
        icon: "h-10 w-10 rounded-[var(--radius-base)]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
