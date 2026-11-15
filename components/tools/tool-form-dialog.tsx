"use client"

import { useState } from "react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { LIMITS, type Category, type Condition } from "@/convex/lib/validators"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useRunMutation } from "@/hooks/use-run-mutation"
import { CATEGORY_OPTIONS, CONDITION_OPTIONS } from "@/lib/labels"

export type ToolFormValues = {
  _id?: Id<"tools">
  name: string
  category: Category
  condition: Condition
  description: string
}

const EMPTY: ToolFormValues = { name: "", category: "power_tools", condition: "good", description: "" }

export function ToolFormDialog({
  open,
  initial,
  onClose,
}: {
  open: boolean
  initial?: ToolFormValues
  onClose: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-lg">
        {open && <ToolForm initial={initial ?? EMPTY} onDone={onClose} />}
      </DialogContent>
    </Dialog>
  )
}

function ToolForm({ initial, onDone }: { initial: ToolFormValues; onDone: () => void }) {
  const create = useMutation(api.tools.mutations.create)
  const update = useMutation(api.tools.mutations.update)
  const { run, pending } = useRunMutation()
  const [values, setValues] = useState(initial)
  const editing = initial._id !== undefined
  const set = <K extends keyof ToolFormValues>(key: K, value: ToolFormValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }))

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    const fields = {
      name: values.name,
      category: values.category,
      condition: values.condition,
      description: values.description,
    }
    const result = editing
      ? await run(() => update({ toolId: initial._id!, ...fields }), "Listing updated")
      : await run(() => create(fields), `${values.name.trim()} is on the wall`)
    if (result.ok) onDone()
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <DialogHeader>
        <DialogTitle className="font-title text-3xl">{editing ? "Edit listing" : "Hang a tool"}</DialogTitle>
        <DialogDescription>
          Neighbors see the name, category, condition and description, plus your name. Never your email.
        </DialogDescription>
      </DialogHeader>

      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="tool-name">Name</FieldLabel>
          <Input
            id="tool-name"
            required
            value={values.name}
            maxLength={LIMITS.toolName}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Cordless drill"
            className="h-10"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="tool-category">Category</FieldLabel>
            <Select
              items={CATEGORY_OPTIONS}
              value={values.category}
              onValueChange={(value) => value && set("category", value as Category)}
            >
              <SelectTrigger id="tool-category" className="h-10 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="tool-condition">Condition</FieldLabel>
            <Select
              items={CONDITION_OPTIONS}
              value={values.condition}
              onValueChange={(value) => value && set("condition", value as Condition)}
            >
              <SelectTrigger id="tool-condition" className="h-10 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONDITION_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="tool-description">Description (optional)</FieldLabel>
          <Textarea
            id="tool-description"
            value={values.description}
            maxLength={LIMITS.toolDescription}
            onChange={(e) => set("description", e.target.value)}
            placeholder="18V, two batteries and a charger. Bits not included."
            rows={4}
          />
          <FieldDescription className="text-right tabular">
            {values.description.length}/{LIMITS.toolDescription}
          </FieldDescription>
        </Field>
      </FieldGroup>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" variant="accent" disabled={pending || values.name.trim().length === 0}>
          {pending ? "Saving…" : editing ? "Save changes" : "Hang it on the wall"}
        </Button>
      </DialogFooter>
    </form>
  )
}
