import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:     "bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md",
        destructive: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
        outline:     "border-[1.5px] border-blue-600 bg-transparent text-blue-600 hover:bg-blue-50",
        secondary:   "bg-slate-100 text-slate-900 hover:bg-slate-200",
        ghost:       "border-[1.5px] border-slate-200 bg-transparent text-slate-600 hover:bg-slate-100 hover:border-slate-300",
        link:        "text-blue-600 underline-offset-4 hover:underline",
        success:     "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm",
        warning:     "bg-amber-500 text-white hover:bg-amber-600 shadow-sm",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm:      "h-8 rounded-md px-3.5 text-xs",
        lg:      "h-11 rounded-xl px-7 text-base",
        xl:      "h-12 rounded-xl px-8 text-base font-bold",
        icon:    "h-9 w-9",
        xs:      "h-7 px-2.5 text-xs rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size:    "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
