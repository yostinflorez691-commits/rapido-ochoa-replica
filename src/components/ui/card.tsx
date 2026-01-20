"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-[var(--radius-base)] border border-[var(--color-gray-100)] bg-white p-4 shadow-[var(--shadow-base)]",
          className
        )}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex flex-col space-y-1.5 pb-4", className)}
        {...props}
      />
    );
  }
);
CardHeader.displayName = "CardHeader";

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={cn(
          "text-lg font-semibold leading-none tracking-tight text-[var(--color-gray-900)]",
          className
        )}
        {...props}
      />
    );
  }
);
CardTitle.displayName = "CardTitle";

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn("", className)} {...props} />;
  }
);
CardContent.displayName = "CardContent";

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-center pt-4", className)}
        {...props}
      />
    );
  }
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardTitle, CardContent, CardFooter };
