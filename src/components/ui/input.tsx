"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  error?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", icon, error, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-gray-500)]">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            "h-[var(--input-height)] w-full rounded-[var(--radius-base)] border bg-white px-4 text-sm text-[var(--color-gray-900)] placeholder:text-[var(--color-gray-500)] transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-offset-0",
            icon && "pl-10",
            error
              ? "border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-[var(--color-error)]/20"
              : "border-[var(--color-gray-300)] focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]/20",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
