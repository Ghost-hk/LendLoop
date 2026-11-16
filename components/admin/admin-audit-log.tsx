"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { FunctionReturnType } from "convex/server"
import { eventEmailLabel, isLoanEvent } from "@/lib/activity"

type Entry = FunctionReturnType<typeof api.admin.queries.auditLog>[number]

function describe(entry: Entry) {
  switch (entry.action) {
    case "tool_removed":
      return `Removed "${entry.detail}" listed by ${entry.subject ?? "a former member"}`
    case "trusted_granted":
      return `Marked ${entry.subject} as Trusted Lender`
    case "trusted_revoked":
      return `Removed Trusted Lender from ${entry.subject}`
    case "role_changed":
      return `Set ${entry.subject}'s role to ${entry.detail}`
    case "delivery_retried": {
      const [event, tool] = (entry.detail ?? "").split(" · ")
      const label = isLoanEvent(event) ? eventEmailLabel(event) : "Email"
      return `Retried the failed ${label.toLowerCase()} to ${entry.subject ?? "a former member"}${tool ? ` (${tool})` : ""}`
    }
  }
}

const WHEN = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" })

export function AdminAuditLog() {
  const entries = useQuery(api.admin.queries.auditLog)
  if (entries === undefined) return <Skeleton className="h-40 rounded-xl" />
  if (entries.length === 0) return <p className="text-muted-foreground">No admin actions recorded yet.</p>
  return (
    <div className="rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>When</TableHead>
            <TableHead>Who</TableHead>
            <TableHead>What</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => (
            <TableRow key={entry._id}>
              <TableCell className="whitespace-nowrap tabular text-muted-foreground">{WHEN.format(entry.createdAt)}</TableCell>
              <TableCell className="font-semibold">{entry.actor}</TableCell>
              <TableCell className="whitespace-normal">{describe(entry)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
