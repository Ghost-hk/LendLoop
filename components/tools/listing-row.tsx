"use client"

import Link from "next/link"
import { Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CATEGORY_META, CONDITION_LABELS } from "@/lib/labels"
import { formatDay } from "@/lib/dates"
import { HangTag } from "./hang-tag"
import { ToolGlyph } from "./tool-glyph"
import type { MyTool } from "./types"

export function ListingRow({
  tool,
  onEdit,
  onRemove,
}: {
  tool: MyTool
  onEdit: () => void
  onRemove: () => void
}) {
  const out = tool.availability === "on_loan"
  return (
    <li className="flex flex-col gap-4 rounded-xl border bg-card p-4 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <ToolGlyph category={tool.category} name={tool.name} out={out} size="sm" />
        <div className="min-w-0">
          <h3 className="truncate font-title text-2xl">{tool.name}</h3>
          <p className="text-sm text-muted-foreground">
            {CATEGORY_META[tool.category].label} · {CONDITION_LABELS[tool.condition]}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {out ? (
          <HangTag variant="out">Out · back {formatDay(tool.bookedRanges[0].endDate)}</HangTag>
        ) : (
          <HangTag variant="home">On the wall</HangTag>
        )}
        {tool.pendingCount > 0 && (
          <Link href="/app/incoming" className="rounded-sm focus-visible:outline-2">
            <HangTag variant="pending">
              {tool.pendingCount} {tool.pendingCount === 1 ? "request" : "requests"}
            </HangTag>
          </Link>
        )}
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onEdit}>
          <Pencil aria-hidden />
          Edit
        </Button>
        <Button variant="ghost" onClick={onRemove} className="text-destructive hover:bg-destructive/10 hover:text-destructive">
          <Trash2 aria-hidden />
          Remove
        </Button>
      </div>
    </li>
  )
}
