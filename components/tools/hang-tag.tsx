import { cn } from "@/lib/utils"

const VARIANTS = {
  home: "bg-kraft text-ink border-kraft-edge",
  out: "bg-ink text-safety border-ink",
  pending: "bg-safety text-ink border-ink",
  overdue: "bg-tag-red text-white border-tag-red",
  yours: "bg-card text-ink border-ink",
  done: "bg-secondary text-muted-foreground border-border",
} as const

export type HangTagVariant = keyof typeof VARIANTS

export function HangTag({
  variant,
  children,
  className,
}: {
  variant: HangTagVariant
  children: React.ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        "relative inline-flex h-7 w-fit items-center gap-1.5 rounded-l-[3px] rounded-r-xl border py-0.5 pr-3 pl-5 text-xs font-bold tracking-wide uppercase tabular",
        "before:absolute before:top-1/2 before:left-1.5 before:size-1.5 before:-translate-y-1/2 before:rounded-full before:bg-paper before:ring-1 before:ring-current/40",
        VARIANTS[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}
