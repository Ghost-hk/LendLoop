"use client"

import { Clock, History, Loader, Mail, MailWarning } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { describeActivity, type ActivityItem, type ActivityState } from "@/lib/activity"
import { formatRelative } from "@/lib/dates"
import { cn } from "@/lib/utils"

const ICONS: Record<ActivityState, typeof Mail> = {
  sent: Mail,
  sending: Loader,
  retrying: Clock,
  failed: MailWarning,
}

const WHEN = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })

function ActivityIcon({ state }: { state: ActivityState }) {
  const Icon = ICONS[state]
  return (
    <Icon
      aria-hidden
      size={16}
      className={cn(
        "mt-0.5 shrink-0",
        state === "failed" ? "text-destructive" : "text-muted-foreground",
        state === "sending" && "motion-safe:animate-spin",
      )}
    />
  )
}

export function LoanActivity({ activity }: { activity: ActivityItem[] }) {
  if (activity.length === 0) return null
  const [latest] = activity

  return (
    <div className="mt-3 flex items-start justify-between gap-3 border-t border-dashed pt-3 text-sm">
      <p className={cn("flex min-w-0 gap-2", latest.state === "failed" ? "text-destructive" : "text-muted-foreground")}>
        <ActivityIcon state={latest.state} />
        <span>
          {describeActivity(latest)}
          {latest.state !== "retrying" && latest.state !== "sending" && (
            <span className="whitespace-nowrap"> · {formatRelative(latest.at)}</span>
          )}
        </span>
      </p>
      {activity.length > 1 && (
        <Popover>
          <PopoverTrigger
            render={
              <Button variant="ghost" size="sm" className="-my-1 shrink-0 text-ink">
                <History aria-hidden />
                Activity
                <span className="tabular text-muted-foreground">{activity.length}</span>
              </Button>
            }
          />
          <PopoverContent align="end" className="w-80 max-w-[calc(100vw-2rem)] gap-0 p-0">
            <p className="border-b px-3 py-2 font-semibold">Email activity</p>
            <ol className="max-h-72 divide-y overflow-y-auto">
              {activity.map((item) => (
                <li key={item.id} className="flex gap-2 px-3 py-2.5">
                  <ActivityIcon state={item.state} />
                  <div className="min-w-0">
                    <p className={item.state === "failed" ? "text-destructive" : "text-ink"}>{describeActivity(item)}</p>
                    <p className="text-xs text-muted-foreground tabular">{WHEN.format(item.at)}</p>
                  </div>
                </li>
              ))}
            </ol>
          </PopoverContent>
        </Popover>
      )}
    </div>
  )
}
