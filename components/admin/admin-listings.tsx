"use client"

import { useState } from "react"
import { useMutation, useQuery } from "convex/react"
import { Trash2 } from "lucide-react"
import { api } from "@/convex/_generated/api"
import { ConfirmDialog } from "@/components/states/confirm-dialog"
import { ToolGlyph } from "@/components/tools/tool-glyph"
import type { WallTool } from "@/components/tools/types"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useRunMutation } from "@/hooks/use-run-mutation"
import { CATEGORY_META } from "@/lib/labels"

export function AdminListings() {
  const tools = useQuery(api.tools.queries.list, {})
  const removeTool = useMutation(api.admin.mutations.removeTool)
  const { run } = useRunMutation()
  const [removing, setRemoving] = useState<WallTool | null>(null)

  if (tools === undefined) return <Skeleton className="h-40 rounded-xl" />
  if (tools.length === 0) return <p className="text-muted-foreground">No active listings.</p>

  return (
    <>
      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tool</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tools.map((tool) => (
              <TableRow key={tool._id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <ToolGlyph category={tool.category} name={tool.name} out={tool.availability === "on_loan"} size="sm" className="size-9" />
                    <div>
                      <p className="font-semibold">{tool.name}</p>
                      <p className="text-sm text-muted-foreground">{CATEGORY_META[tool.category].label}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{tool.isMine ? "You" : tool.owner.name}</TableCell>
                <TableCell>{tool.availability === "on_loan" ? "Out on loan" : "On the wall"}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    onClick={() => setRemoving(tool)}
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 aria-hidden />
                    Remove
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <ConfirmDialog
        open={removing !== null}
        title={`Remove ${removing?.name ?? "this listing"}?`}
        description="It comes off the wall for everyone and pending requests are declined. Loans already approved stay as they are. This is recorded in the audit log."
        confirmLabel="Remove listing"
        onClose={() => setRemoving(null)}
        onConfirm={() => {
          if (removing) void run(() => removeTool({ toolId: removing._id }), "Listing removed")
          setRemoving(null)
        }}
      />
    </>
  )
}
