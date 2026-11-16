"use client"

import { useMutation, useQuery } from "convex/react"
import type { FunctionReturnType } from "convex/server"
import { RotateCw } from "lucide-react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { Section } from "@/components/states/section"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useRunMutation } from "@/hooks/use-run-mutation"
import { eventEmailLabel } from "@/lib/activity"
import { cn } from "@/lib/utils"

type Overview = FunctionReturnType<typeof api.automation.queries.overview>
type Delivery = Overview["failed"][number]

const WHEN = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
})
const TIME = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
})

function Stat({
  value,
  label,
  alert,
}: {
  value: number
  label: string
  alert?: boolean
}) {
  return (
    <div className="flex items-baseline gap-2">
      <dt className="sr-only">{label}</dt>
      <dd
        className={cn(
          "font-title text-3xl tabular",
          alert && value > 0 && "text-destructive"
        )}
      >
        {value}
      </dd>
      <span aria-hidden className="text-sm text-muted-foreground">
        {label}
      </span>
    </div>
  )
}

function Calm({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed px-4 py-3 text-muted-foreground">
      {children}
    </p>
  )
}

function RetryButton({ deliveryId }: { deliveryId: Id<"webhookDeliveries"> }) {
  const retry = useMutation(api.automation.mutations.retryDelivery)
  const { run, pending } = useRunMutation()
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() => void run(() => retry({ deliveryId }), "Retry scheduled")}
    >
      <RotateCw
        aria-hidden
        className={cn(pending && "motion-safe:animate-spin")}
      />
      Retry now
    </Button>
  )
}

function deliveryWhen(row: Delivery, mode: "failed" | "retrying") {
  if (mode === "failed")
    return row.failedAt ? `Gave up ${WHEN.format(row.failedAt)}` : "Gave up"
  return row.nextAttemptAt
    ? `Next try ${TIME.format(row.nextAttemptAt)}`
    : "Next try soon"
}

function DeliveryList({
  rows,
  mode,
}: {
  rows: Delivery[]
  mode: "failed" | "retrying"
}) {
  return (
    <ul className="divide-y rounded-xl border bg-card md:hidden">
      {rows.map((row) => (
        <li key={row._id} className="space-y-2 p-4 text-sm">
          <p>
            <span className="font-semibold">{eventEmailLabel(row.event)}</span>{" "}
            to {row.recipient}
            <span className="block text-muted-foreground">{row.toolName}</span>
          </p>
          {row.lastError && (
            <p
              className="line-clamp-3 break-words text-muted-foreground"
              title={row.lastError}
            >
              {row.lastError}
            </p>
          )}
          <div className="flex items-center justify-between gap-3">
            <p className="text-muted-foreground tabular">
              {row.attempts} {row.attempts === 1 ? "attempt" : "attempts"} ·{" "}
              {deliveryWhen(row, mode)}
            </p>
            {mode === "failed" && <RetryButton deliveryId={row._id} />}
          </div>
        </li>
      ))}
    </ul>
  )
}

function DeliveryTable({
  rows,
  mode,
}: {
  rows: Delivery[]
  mode: "failed" | "retrying"
}) {
  return (
    <>
      <DeliveryList rows={rows} mode={mode} />
      <div className="hidden rounded-xl border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>To</TableHead>
              <TableHead className="text-right">Attempts</TableHead>
              <TableHead>Last error</TableHead>
              <TableHead>
                {mode === "failed" ? "Gave up" : "Next try"}
              </TableHead>
              {mode === "failed" && (
                <TableHead className="sr-only">Action</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row._id}>
                <TableCell>
                  <span className="font-semibold">
                    {eventEmailLabel(row.event)}
                  </span>
                  <span className="block text-muted-foreground">
                    {row.toolName}
                  </span>
                </TableCell>
                <TableCell>{row.recipient}</TableCell>
                <TableCell className="text-right tabular">
                  {row.attempts}
                </TableCell>
                <TableCell className="max-w-80 break-words whitespace-normal text-muted-foreground">
                  <span className="line-clamp-3" title={row.lastError}>
                    {row.lastError ?? "—"}
                  </span>
                </TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground tabular">
                  {mode === "failed"
                    ? row.failedAt && WHEN.format(row.failedAt)
                    : row.nextAttemptAt
                      ? TIME.format(row.nextAttemptAt)
                      : "soon"}
                </TableCell>
                {mode === "failed" && (
                  <TableCell className="text-right">
                    <RetryButton deliveryId={row._id} />
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}

function EventTable({
  rows,
  label,
}: {
  rows: Overview["workflowErrors"]
  label: string
}) {
  return (
    <>
      <ul className="divide-y rounded-xl border bg-card md:hidden">
        {rows.map((row) => (
          <li key={row._id} className="space-y-1 p-4 text-sm">
            <p className="break-words">{row.detail ?? "—"}</p>
            <p className="text-muted-foreground tabular">
              {WHEN.format(row.at)}
              {row.toolName && ` · ${row.toolName}`}
            </p>
          </li>
        ))}
      </ul>
      <div className="hidden rounded-xl border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>When</TableHead>
              <TableHead>Tool</TableHead>
              <TableHead>{label}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row._id}>
                <TableCell className="whitespace-nowrap text-muted-foreground tabular">
                  {WHEN.format(row.at)}
                </TableCell>
                <TableCell>{row.toolName ?? "—"}</TableCell>
                <TableCell className="max-w-xl break-words whitespace-normal">
                  {row.detail ?? "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}

export function AdminAutomation() {
  const overview = useQuery(api.automation.queries.overview)
  if (overview === undefined) return <Skeleton className="h-40 rounded-xl" />
  const { stats } = overview

  return (
    <>
      <section
        aria-labelledby="automation-week"
        className="mb-10 rounded-xl border bg-card px-5 py-4"
      >
        <h2
          id="automation-week"
          className="mb-2 text-sm font-semibold text-muted-foreground"
        >
          Last 7 days
        </h2>
        <dl className="flex flex-wrap gap-x-8 gap-y-2">
          <Stat value={stats.notificationsSent} label="emails sent" />
          <Stat value={stats.notificationsRetrying} label="retrying" />
          <Stat value={stats.notificationsFailed} label="emails failed" alert />
          <Stat value={stats.remindersSent} label="reminders sent" />
          <Stat value={stats.remindersFailed} label="reminders failed" alert />
          <Stat value={stats.workflowErrors} label="workflow errors" alert />
        </dl>
      </section>

      <Section title="Failed emails" count={overview.failed.length}>
        {overview.failed.length === 0 ? (
          <Calm>Nothing has failed. Every notification went through.</Calm>
        ) : (
          <DeliveryTable rows={overview.failed} mode="failed" />
        )}
      </Section>

      {overview.retrying.length > 0 && (
        <Section title="Retrying" count={overview.retrying.length}>
          <DeliveryTable rows={overview.retrying} mode="retrying" />
        </Section>
      )}

      <Section
        title="Failed reminders"
        count={overview.reminderFailures.length}
      >
        {overview.reminderFailures.length === 0 ? (
          <Calm>
            No overdue reminder has failed. A failed one is retried on the next
            daily run.
          </Calm>
        ) : (
          <EventTable rows={overview.reminderFailures} label="Reason" />
        )}
      </Section>

      <Section title="Workflow errors" count={overview.workflowErrors.length}>
        {overview.workflowErrors.length === 0 ? (
          <Calm>No n8n workflow has errored.</Calm>
        ) : (
          <EventTable
            rows={overview.workflowErrors}
            label="Workflow and step"
          />
        )}
      </Section>
    </>
  )
}
