import type { LucideIcon } from "lucide-react"

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-input px-6 py-14 text-center">
      <Icon aria-hidden size={40} strokeWidth={1.5} strokeDasharray="3 3" className="text-muted-foreground" />
      <h2 className="font-title text-2xl">{title}</h2>
      <p className="max-w-sm text-muted-foreground">{description}</p>
      {action}
    </div>
  )
}
