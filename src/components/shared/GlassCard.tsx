"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const GlassCardContext = React.createContext<{ variant?: 'default' | 'opaque' }>({ variant: 'default' });

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'opaque';
}

const GlassCardRoot = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <GlassCardContext.Provider value={{ variant }}>
      <Card
        ref={ref}
        className={cn(
          variant === 'default' ? "bg-card/60 backdrop-blur-lg border-white/10 shadow-xl" : "bg-card border-border shadow-lg",
          "rounded-xl transition-all duration-300", // Added rounded-xl for better glass feel
          className
        )}
        {...props}
      />
    </GlassCardContext.Provider>
  )
);
GlassCardRoot.displayName = "GlassCard";


const GlassCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { variant } = React.useContext(GlassCardContext);
  return (
    <CardHeader
      ref={ref}
      className={cn(variant === 'default' ? "text-primary-foreground/90" : "", className)}
      {...props}
    />
  );
});
GlassCardHeader.displayName = "GlassCardHeader";

const GlassCardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
   const { variant } = React.useContext(GlassCardContext);
  return (
    <CardTitle
      ref={ref}
      className={cn(variant === 'default' ? "text-primary-foreground" : "text-foreground", "font-headline", className)}
      {...props}
    />
  );
});
GlassCardTitle.displayName = "GlassCardTitle";

const GlassCardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { variant } = React.useContext(GlassCardContext);
  return (
    <CardDescription
      ref={ref}
      className={cn(variant === 'default' ? "text-primary-foreground/70" : "text-muted-foreground", className)}
      {...props}
    />
  );
});
GlassCardDescription.displayName = "GlassCardDescription";

const GlassCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { variant } = React.useContext(GlassCardContext);
  return (
    <CardContent
      ref={ref}
      className={cn(variant === 'default' ? "text-primary-foreground/80" : "", className)}
      {...props}
    />
  );
});
GlassCardContent.displayName = "GlassCardContent";

const GlassCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { variant } = React.useContext(GlassCardContext);
  return (
    <CardFooter
      ref={ref}
      className={cn(variant === 'default' ? "text-primary-foreground/70" : "", className)}
      {...props}
    />
  );
});
GlassCardFooter.displayName = "GlassCardFooter";

export { GlassCardRoot as GlassCard, GlassCardHeader, GlassCardTitle, GlassCardDescription, GlassCardContent, GlassCardFooter };
