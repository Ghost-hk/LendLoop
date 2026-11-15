"use client"

import { useState } from "react"
import { useMutation, useQuery } from "convex/react"
import { Plus, Wrench } from "lucide-react"
import { api } from "@/convex/_generated/api"
import { PageHeader } from "@/components/layout/page-header"
import { ConfirmDialog } from "@/components/states/confirm-dialog"
import { EmptyState } from "@/components/states/empty-state"
import { ListingRow } from "@/components/tools/listing-row"
import { ToolFormDialog, type ToolFormValues } from "@/components/tools/tool-form-dialog"
import type { MyTool } from "@/components/tools/types"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useRunMutation } from "@/hooks/use-run-mutation"

export default function MyListingsPage() {
  const tools = useQuery(api.tools.queries.mine)
  const removeTool = useMutation(api.tools.mutations.remove)
  const { run } = useRunMutation()
  const [form, setForm] = useState<{ open: boolean; initial?: ToolFormValues }>({ open: false })
  const [removing, setRemoving] = useState<MyTool | null>(null)

  const hang = () => setForm({ open: true })
  const edit = (tool: MyTool) =>
    setForm({
      open: true,
      initial: {
        _id: tool._id,
        name: tool.name,
        category: tool.category,
        condition: tool.condition,
        description: tool.description,
      },
    })

  return (
    <>
      <PageHeader
        title="My listings"
        description="Tools you've hung on the wall for neighbors to borrow."
        action={
          <Button variant="accent" size="lg" onClick={hang}>
            <Plus aria-hidden />
            Hang a tool
          </Button>
        }
      />

      {tools === undefined ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : tools.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="Nothing on the wall yet"
          description="List a tool you rarely use. You approve every request, and it comes back with a reminder if it's late."
          action={
            <Button variant="accent" onClick={hang}>
              Hang your first tool
            </Button>
          }
        />
      ) : (
        <ul className="space-y-3">
          {tools.map((tool) => (
            <ListingRow key={tool._id} tool={tool} onEdit={() => edit(tool)} onRemove={() => setRemoving(tool)} />
          ))}
        </ul>
      )}

      <ToolFormDialog open={form.open} initial={form.initial} onClose={() => setForm({ open: false })} />
      <ConfirmDialog
        open={removing !== null}
        title={`Remove ${removing?.name ?? "this tool"}?`}
        description="It comes off the wall and any pending requests are declined automatically. A tool that's out on loan can't be removed until it's returned."
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
