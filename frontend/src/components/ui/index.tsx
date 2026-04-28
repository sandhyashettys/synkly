// ─── Re-exports from individual ShadCN UI files ───────────────────────────
export * from "./button"
export * from "./input"
export * from "./label"
export * from "./textarea"
export * from "./select"
export * from "./badge"
export * from "./card"
export * from "./dialog"
export * from "./avatar"
export * from "./skeleton"
export * from "./separator"
export * from "./switch"
export * from "./progress"
export * from "./table"
export * from "./tabs"
export * from "./tooltip"
export * from "./popover"
export * from "./sheet"
export * from "./alert"
export * from "./alert-dialog"
export * from "./form"
export * from "./checkbox"
export * from "./scroll-area"
export * from "./dropdown-menu"
export * from "./toaster"

// ─── Custom composite components ─────────────────────────────────────────
import React from "react"
import { cn } from "@/lib/utils"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { toast as hookToast } from "@/hooks/use-toast"

/** Convenience toast helper — call toast.success(), toast.error(), etc. */
export const toast = hookToast

/** Animated loading spinner */
export const Spinner = ({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg"
  className?: string
}) => {
  const s = { sm: "w-4 h-4 border-2", md: "w-5 h-5 border-2", lg: "w-7 h-7 border-[3px]" }[size]
  return (
    <span
      className={cn(
        "inline-block rounded-full border-current border-t-transparent animate-spin",
        s,
        className
      )}
    />
  )
}

/** Modal — wraps Radix Dialog with header / scrollable body / footer */
interface ModalProps {
  open:     boolean
  onClose:  () => void
  title:    string
  children: React.ReactNode
  footer?:  React.ReactNode
  size?:    "sm" | "md" | "lg" | "xl"
}

export const Modal = ({ open, onClose, title, children, footer, size = "md" }: ModalProps) => {
  const maxW = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" }[size]

  React.useEffect(() => {
    if (open) document.body.style.overflow = "hidden"
    else       document.body.style.overflow = ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  if (!open) return null

  return (
    <DialogPrimitive.Root open={open} onOpenChange={v => !v && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 animate-in fade-in-0 duration-200" />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50",
            "w-full bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh]",
            "animate-in fade-in-0 zoom-in-95 duration-200",
            maxW
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl z-10 flex-shrink-0">
            <DialogPrimitive.Title className="text-base font-bold text-slate-900">
              {title}
            </DialogPrimitive.Title>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6"  y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          {/* Scrollable body */}
          <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
          {/* Footer */}
          {footer && (
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 rounded-b-2xl flex items-center justify-end gap-3 flex-shrink-0">
              {footer}
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

/** Gradient initials avatar */
export const AvatarInitials = ({
  name = "",
  size = 36,
  className,
}: {
  name?:     string
  size?:     number
  className?: string
}) => {
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?"
  return (
    <div
      className={cn(
        "rounded-full bg-gradient-to-br from-blue-500 to-purple-600",
        "flex items-center justify-center text-white font-bold flex-shrink-0 select-none",
        className
      )}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials}
    </div>
  )
}
// Alias used in dashboard code
export { AvatarInitials as Avatar }

/** KPI stat card */
export const StatCard = ({
  icon,
  label,
  value,
  change,
  changeDir,
  color    = "#2563eb",
  bgColor,
}: {
  icon:       string
  label:      string
  value:      string | number
  change?:    string
  changeDir?: "up" | "down"
  color?:     string
  bgColor?:   string
}) => (
  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-3">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
        style={{ background: bgColor || `${color}18` }}
      >
        {icon}
      </div>
      {change && (
        <span className={cn("text-xs font-bold", changeDir === "up" ? "text-emerald-600" : "text-red-500")}>
          {changeDir === "up" ? "↑" : "↓"} {change}
        </span>
      )}
    </div>
    <div className="text-2xl font-black tracking-tight" style={{ color }}>{value}</div>
    <div className="text-sm text-slate-400 mt-0.5">{label}</div>
  </div>
)

/** Generic data table with loading skeleton and empty state */
interface Column<T> {
  key:     string
  label:   string
  render?: (row: T) => React.ReactNode
}
interface DataTableProps<T> {
  columns:       Column<T>[]
  data:          T[]
  loading?:      boolean
  emptyMessage?: string
  emptyIcon?:    string
  onRowClick?:   (row: T) => void
}

export function DataTable<T extends { _id?: string; id?: string }>({
  columns, data, loading,
  emptyMessage = "No records found",
  emptyIcon    = "📋",
  onRowClick,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="p-5 space-y-2.5">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-10 w-full rounded-lg bg-slate-100 animate-pulse" />
        ))}
      </div>
    )
  }
  return (
    <div className="overflow-x-auto">
      <table className="data-table w-full">
        <thead>
          <tr>{columns.map(col => <th key={col.key}>{col.label}</th>)}</tr>
        </thead>
        <tbody>
          {!data.length ? (
            <tr>
              <td colSpan={columns.length}>
                <div className="text-center py-14">
                  <div className="text-5xl opacity-25 mb-3">{emptyIcon}</div>
                  <p className="text-sm text-slate-400 font-medium">{emptyMessage}</p>
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={(row as any)._id || (row as any).id || i}
                onClick={() => onRowClick?.(row)}
                className={onRowClick ? "cursor-pointer" : ""}
              >
                {columns.map(col => (
                  <td key={col.key}>
                    {col.render ? col.render(row) : String((row as any)[col.key] ?? "—")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

/** Thin progress bar */
export const ProgressBar = ({
  value,
  color     = "#2563eb",
  className,
}: {
  value:      number
  color?:     string
  className?: string
}) => (
  <div className={cn("h-1.5 bg-slate-100 rounded-full overflow-hidden", className)}>
    <div
      className="h-full rounded-full transition-all duration-700 ease-out"
      style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: color }}
    />
  </div>
)

/** Pill section label used on landing pages */
export const SectionTag = ({ children }: { children: React.ReactNode }) => (
  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider">
    {children}
  </div>
)

/** Horizontal rule */
export const Divider = ({ className }: { className?: string }) => (
  <div className={cn("h-px bg-slate-200", className)} />
)
