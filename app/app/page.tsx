"use client"

import { useState } from "react"
import { useQuery } from "convex/react"
import { Plus, SearchX } from "lucide-react"
import { api } from "@/convex/_generated/api"
import type { Category } from "@/convex/lib/validators"
import { PageHeader } from "@/components/layout/page-header"
import { EmptyState } from "@/components/states/empty-state"
import { CategoryFilter } from "@/components/tools/category-filter"
import { RequestDialog } from "@/components/tools/request-dialog"
import { ToolFormDialog } from "@/components/tools/tool-form-dialog"
import { ToolTile } from "@/components/tools/tool-tile"
import type { WallTool } from "@/components/tools/types"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { CATEGORY_META } from "@/lib/labels"

export default function ToolWallPage() {
  const [category, setCategory] = useState<Category | undefined>()
  const [requesting, setRequesting] = useState<WallTool | null>(null)
  const [hanging, setHanging] = useState(false)
  const tools = useQuery(api.tools.queries.list, { category })

  const outCount = tools?.filter((t) => t.availability === "on_loan").length ?? 0

  return (
    <>
      <PageHeader
        title="The tool wall"
        description={
          tools === undefined
            ? "Loading the wall…"
            : `${tools.length} ${tools.length === 1 ? "tool" : "tools"} hanging · ${outCount} out on loan`
        }
        action={
          <Button variant="accent" size="lg" onClick={() => setHanging(true)}>
            <Plus aria-hidden />
            Hang a tool
          </Button>
        }
      />
      <CategoryFilter value={category} onChange={setCategory} />

      {tools === undefined ? (
        <div className="pegboard grid gap-5 rounded-2xl p-4 sm:grid-cols-2 sm:p-6 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-80 rounded-xl bg-card/70" />
          ))}
        </div>
      ) : tools.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title={category ? `Nothing in ${CATEGORY_META[category].label} yet` : "The wall is empty"}
          description="Be the first neighbor to lend something. It takes under a minute."
          action={
            <Button variant="accent" onClick={() => setHanging(true)}>
              Hang a tool
            </Button>
          }
        />
      ) : (
        <div className="pegboard grid gap-5 rounded-2xl p-4 pt-6 sm:grid-cols-2 sm:p-6 sm:pt-8 xl:grid-cols-4">
          {tools.map((tool) => (
            <ToolTile key={tool._id} tool={tool} onRequest={setRequesting} />
          ))}
        </div>
      )}

      <RequestDialog tool={requesting} onClose={() => setRequesting(null)} />
      <ToolFormDialog open={hanging} onClose={() => setHanging(false)} />
    </>
  )
}
