"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CATEGORY_META, CONDITION_LABELS } from "@/lib/labels"
import { formatDay } from "@/lib/dates"
import { cn } from "@/lib/utils"
import { HangTag } from "./hang-tag"
import { ToolGlyph } from "./tool-glyph"
import { TrustedMark } from "./trusted-mark"
import type { WallTool } from "./types"

function tagFor(tool: WallTool) {
  const out = tool.availability === "on_loan"
  const back = out ? formatDay(tool.bookedRanges[0].endDate) : null
  if (tool.isMine && out) return <HangTag variant="out">Yours · out till {back}</HangTag>
  if (tool.isMine) return <HangTag variant="yours">Yours</HangTag>
  if (tool.hasPendingRequest) return <HangTag variant="pending">Request sent</HangTag>
  if (out) return <HangTag variant="out">Out · back {back}</HangTag>
  return <HangTag variant="home">On the wall</HangTag>
}

function TileAction({ tool, onRequest }: { tool: WallTool; onRequest: (tool: WallTool) => void }) {
  if (tool.isMine) {
    return (
      <Button variant="outline" nativeButton={false} render={<Link href="/app/listings" />}>
        Manage
      </Button>
    )
  }
  if (tool.hasPendingRequest) {
    return (
      <Button variant="outline" nativeButton={false} render={<Link href="/app/requests" />}>
        View request
      </Button>
    )
  }
  const out = tool.availability === "on_loan"
  return (
    <Button variant={out ? "outline" : "default"} onClick={() => onRequest(tool)}>
      {out ? "Request later dates" : "Request to borrow"}
    </Button>
  )
}

export function ToolTile({ tool, onRequest }: { tool: WallTool; onRequest: (tool: WallTool) => void }) {
  const out = tool.availability === "on_loan"
  return (
    <article
      className={cn(
        "relative flex gap-3 rounded-xl p-3 transition-[background-color,box-shadow,border-color] duration-500 ease-out sm:flex-col",
        out
          ? "border-2 border-dashed border-ink/70 bg-paper/75"
          : "border-2 border-transparent bg-card shadow-[0_2px_6px_rgb(60_40_10/0.18)]",
      )}
    >
      <span aria-hidden className="absolute -top-1.5 left-1/2 size-3 -translate-x-1/2 rounded-full bg-ink shadow-[0_1px_1px_rgb(0_0_0/0.4)]" />
      <ToolGlyph category={tool.category} name={tool.name} out={out} size="sm" className="sm:hidden" />
      <ToolGlyph category={tool.category} name={tool.name} out={out} className="hidden sm:grid" />
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex flex-1 flex-col gap-1 sm:px-1">
          <h3 className="line-clamp-2 font-title text-xl sm:text-2xl">{tool.name}</h3>
          <p className="text-sm text-muted-foreground">
            {CATEGORY_META[tool.category].label} · {CONDITION_LABELS[tool.condition]}
          </p>
          <p className="flex flex-wrap items-center gap-2 text-sm">
            {tool.isMine ? "Listed by you" : tool.owner.name}
            {tool.owner.trustedLender && <TrustedMark />}
          </p>
          {tool.description && (
            <p className="hidden text-sm text-muted-foreground sm:line-clamp-2">{tool.description}</p>
          )}
        </div>
        <div className="flex flex-col gap-3 sm:px-1 sm:pb-1">
          {tagFor(tool)}
          <TileAction tool={tool} onRequest={onRequest} />
        </div>
      </div>
    </article>
  )
}
