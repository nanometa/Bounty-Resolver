import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "../../lib/utils";

const buttonVariants = {
  variant: {
    default: "bg-red-600 text-white hover:bg-red-500",
    destructive: "bg-red-900 text-red-100 hover:bg-red-800",
    outline: "border border-[#2a2a3e] bg-transparent hover:bg-white/5 hover:text-white text-slate-300",
    secondary: "bg-[#1a1a2e] text-slate-200 hover:bg-[#2a2a3e]",
    ghost: "hover:bg-white/5 hover:text-white text-slate-400",
    link: "text-red-400 underline-offset-4 hover:underline",
    gradient: "from-red-600 via-red-500/60 to-red-600 bg-transparent bg-gradient-to-r [background-size:200%_auto] hover:bg-transparent hover:bg-[99%_center] text-white",
  },
  size: {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10",
  },
};

function getButtonClasses(variant = "default", size = "default") {
  const base = "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50 disabled:pointer-events-none disabled:opacity-50";
  const v = buttonVariants.variant[variant] || buttonVariants.variant.default;
  const s = buttonVariants.size[size] || buttonVariants.size.default;
  return `${base} ${v} ${s}`;
}

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(getButtonClasses(variant, size), className)}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = "Button";

export { Button, getButtonClasses };
