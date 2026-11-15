"use client"

import { useMemo, useState } from "react"
import type { DateRange } from "react-day-picker"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { LIMITS } from "@/convex/lib/validators"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import { useRunMutation } from "@/hooks/use-run-mutation"
import {
  addDaysIso,
  formatRange,
  isoToLocalDate,
  isoToday,
  loanLength,
  localDateToIso,
  daysBetween,
} from "@/lib/dates"
import type { WallTool } from "./types"

export function RequestDialog({ tool, onClose }: { tool: WallTool | null; onClose: () => void }) {
  return (
    <Dialog open={tool !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">{tool && <RequestForm tool={tool} onDone={onClose} />}</DialogContent>
    </Dialog>
  )
}

function RequestForm({ tool, onDone }: { tool: WallTool; onDone: () => void }) {
  const requestLoan = useMutation(api.loans.mutations.request)
  const { run, pending } = useRunMutation()
  const [range, setRange] = useState<DateRange | undefined>()
  const [note, setNote] = useState("")

  const today = isoToday()
  const disabled = useMemo(
    () => [
      { before: isoToLocalDate(today) },
      { after: isoToLocalDate(addDaysIso(today, LIMITS.maxLeadDays)) },
      ...tool.bookedRanges.map((r) => ({ from: isoToLocalDate(r.startDate), to: isoToLocalDate(r.endDate) })),
    ],
    [today, tool.bookedRanges],
  )

  const startDate = range?.from ? localDateToIso(range.from) : undefined
  const endDate = range?.to ? localDateToIso(range.to) : startDate
  const tooLong = startDate && endDate ? daysBetween(startDate, endDate) + 1 > LIMITS.maxLoanDays : false

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!startDate || !endDate || tooLong) return
    const result = await run(
      () => requestLoan({ toolId: tool._id, startDate, endDate, note: note || undefined }),
      `Request sent to ${tool.owner.name}`,
    )
    if (result.ok) onDone()
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <DialogHeader>
        <DialogTitle className="font-title text-3xl">Borrow {tool.name}</DialogTitle>
        <DialogDescription>
          Pick the days you need it, up to {LIMITS.maxLoanDays} days. {tool.owner.name} gets an email and answers here.
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col items-center gap-2">
        <Calendar
          mode="range"
          selected={range}
          onSelect={setRange}
          disabled={disabled}
          excludeDisabled
          startMonth={isoToLocalDate(today)}
          endMonth={isoToLocalDate(addDaysIso(today, LIMITS.maxLeadDays))}
          className="rounded-lg border bg-card [--cell-size:--spacing(10)]"
        />
        {tool.bookedRanges.length > 0 && (
          <p className="text-sm text-muted-foreground">
            Already booked: {tool.bookedRanges.map((r) => formatRange(r.startDate, r.endDate)).join(", ")}
          </p>
        )}
      </div>

      <p aria-live="polite" className="min-h-6 text-center font-semibold tabular">
        {startDate && endDate ? (
          tooLong ? (
            <span className="text-destructive">That&apos;s longer than {LIMITS.maxLoanDays} days. Pick a shorter range.</span>
          ) : (
            `${formatRange(startDate, endDate)} · ${loanLength(startDate, endDate)}`
          )
        ) : (
          <span className="font-normal text-muted-foreground">Choose a start and end day</span>
        )}
      </p>

      <Field>
        <FieldLabel htmlFor="request-note">Note for {tool.owner.name} (optional)</FieldLabel>
        <Textarea
          id="request-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={LIMITS.loanNote}
          placeholder="What's it for? When can you pick it up?"
          rows={3}
        />
        <FieldDescription className="text-right tabular">
          {note.length}/{LIMITS.loanNote}
        </FieldDescription>
      </Field>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" variant="accent" disabled={!startDate || tooLong || pending}>
          {pending ? "Sending…" : "Send request"}
        </Button>
      </DialogFooter>
    </form>
  )
}
