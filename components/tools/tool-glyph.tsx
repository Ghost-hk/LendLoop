import { createElement } from "react"
import { iconFor } from "@/lib/labels"
import type { Category } from "@/convex/lib/validators"
import { cn } from "@/lib/utils"

const SIZES = {
  sm: { box: "size-12 rounded-md", icon: 26 },
  lg: { box: "h-28 w-full rounded-md", icon: 64 },
} as const

export function ToolGlyph({
  category,
  name,
  out = false,
  size = "lg",
  className,
}: {
  category: Category
  name?: string
  out?: boolean
  size?: keyof typeof SIZES
  className?: string
}) {
  const s = SIZES[size]
  return (
    <div
      aria-hidden
      className={cn(
        "grid shrink-0 place-items-center transition-colors duration-300",
        s.box,
        out ? "bg-ink text-safety" : "bg-secondary text-ink",
        className,
      )}
    >
      {createElement(iconFor(category, name), {
        size: s.icon,
        strokeWidth: out ? 1.6 : 1.75,
        strokeDasharray: out ? "3 3" : undefined,
        strokeLinecap: "round",
      })}
    </div>
  )
}
