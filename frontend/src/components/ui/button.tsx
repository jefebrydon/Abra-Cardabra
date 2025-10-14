import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full text-base font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(245,158,11,0.25)] focus-visible:ring-offset-0 disabled:pointer-events-none disabled:bg-[#F8F3EC] disabled:bg-none disabled:text-[#C7B9A4] disabled:border disabled:border-[#EADFCC] disabled:shadow-none [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border border-transparent bg-[linear-gradient(90deg,#F59E0B_0%,#EA580C_100%)] text-white shadow-[0_8px_20px_rgba(234,88,12,0.28)] hover:shadow-[0_12px_28px_rgba(234,88,12,0.32)] hover:brightness-[1.06]",
        destructive:
          "bg-red-600 text-stone-50 shadow-sm hover:bg-red-600/90",
        outline:
          "border border-orange-200 bg-white text-stone-800 shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-orange-100 text-stone-800 shadow-sm hover:bg-orange-100/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-14 px-6",
        sm: "h-10 rounded-full px-4 text-sm",
        lg: "h-16 rounded-full px-8 text-lg",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
