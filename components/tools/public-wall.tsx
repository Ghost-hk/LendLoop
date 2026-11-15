import { CATEGORY_META } from "@/lib/labels"
import type { Category } from "@/convex/lib/validators"
import { ToolGlyph } from "./tool-glyph"

export function PublicWall({ tools }: { tools: { name: string; category: Category }[] }) {
  if (tools.length === 0) {
    return (
      <div className="pegboard grid min-h-72 place-items-center rounded-2xl p-6">
        <p className="rounded-lg bg-card px-5 py-3 text-center font-semibold shadow-[0_2px_6px_rgb(60_40_10/0.18)]">
          The wall is empty. Be the first to hang a tool.
        </p>
      </div>
    )
  }
  return (
    <ul className="pegboard grid grid-cols-2 gap-4 rounded-2xl p-4 pt-6 sm:grid-cols-3 sm:p-6 sm:pt-8">
      {tools.map((tool, i) => (
        <li
          key={`${tool.name}-${i}`}
          className="relative flex flex-col gap-2 rounded-xl bg-card p-2.5 shadow-[0_2px_6px_rgb(60_40_10/0.18)]"
        >
          <span aria-hidden className="absolute -top-1.5 left-1/2 size-3 -translate-x-1/2 rounded-full bg-ink" />
          <ToolGlyph category={tool.category} name={tool.name} className="h-20" />
          <div className="px-1 pb-1">
            <p className="line-clamp-2 font-title text-xl">{tool.name}</p>
            <p className="text-sm text-muted-foreground">{CATEGORY_META[tool.category].label}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}
