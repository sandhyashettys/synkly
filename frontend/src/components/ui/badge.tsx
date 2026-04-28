import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:     "bg-blue-100 text-blue-700 border border-blue-200",
        secondary:   "bg-slate-100 text-slate-700",
        destructive: "bg-red-100 text-red-700 border border-red-200",
        outline:     "border border-slate-300 text-slate-700",
        // Named color variants used throughout the project
        green:   "bg-green-100 text-green-700",
        blue:    "bg-blue-100 text-blue-700",
        amber:   "bg-amber-100 text-amber-700",
        red:     "bg-red-100 text-red-700",
        purple:  "bg-purple-100 text-purple-700",
        cyan:    "bg-cyan-100 text-cyan-700",
        gray:    "bg-slate-100 text-slate-600",
        success: "bg-green-100 text-green-700",
        warning: "bg-amber-100 text-amber-700",
        error:   "bg-red-100 text-red-700",
        info:    "bg-blue-100 text-blue-700",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
