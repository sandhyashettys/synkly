import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
  label?: string
  hint?:  string
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, label, hint, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            {label}
          </label>
        )}
        <textarea
          className={cn(
            "flex min-h-[96px] w-full rounded-lg border-[1.5px] bg-white px-3.5 py-2.5 text-sm",
            "placeholder:text-slate-400 text-slate-900",
            "outline-none transition-all duration-150 resize-vertical",
            "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50",
            error
              ? "border-red-400 bg-red-50 focus:ring-red-500/10 focus:border-red-500"
              : "border-slate-200",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
            <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="mt-1.5 text-xs text-slate-400">{hint}</p>
        )}
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
