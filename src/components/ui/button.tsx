"use client";

import { forwardRef } from "react";

import { Slot } from "@radix-ui/react-slot";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer",
  {
    variants: {
      variant: {
        primary:
          "from-[#C41B2C] to-[#A01A24] bg-gradient-to-r text-white hover:from-[#A01A24] hover:to-[#8B161F] focus-visible:ring-[#C41B2C]/50",

        success:
          "bg-[#1F8641] text-white hover:bg-[#1a7339] focus-visible:ring-[#1F8641]/50",

        secondary:
          "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] focus-visible:ring-[var(--color-primary)]",

        outline:
          "border border-[var(--color-gray-300)] bg-white text-[var(--color-gray-700)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]",

        ghost:
          "text-[var(--color-gray-700)] hover:bg-[var(--color-gray-100)]",

        link:
          "text-[var(--color-primary)] underline-offset-4 hover:underline",

        headerLogin:
          "flex items-center gap-2 bg-neutral-700/70 hover:bg-neutral-700/80 rounded-full px-3 py-1.5 text-white text-sm font-medium transition-colors",
      },

      size: {
        sm: "min-h-9 px-3 text-xs rounded-[var(--radius-sm)]",

        default: "min-h-[44px] p-3 rounded-2xl",

        lg: "min-h-[50px] px-6 text-sm rounded-2xl",

        fixed: "min-h-[60px] px-6 text-base rounded-none w-full",

        icon: "h-10 w-10 rounded-[var(--radius-base)] flex items-center justify-center",

        full: "min-h-[44px] p-3 rounded-2xl w-full",

        search: "h-[55px] w-full rounded-[20px] text-[18px] font-bold",
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
