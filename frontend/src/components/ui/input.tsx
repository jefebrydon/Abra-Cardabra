import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-[12px] border border-[#F7D9B8] bg-white px-4 text-base font-medium text-[#4F433A] placeholder:text-[#B3A59A] shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(245,158,11,0.25)] focus-visible:border-[#ED9A3A] disabled:cursor-not-allowed disabled:bg-[#F8F3EC] disabled:text-[#C7B9A4]",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
