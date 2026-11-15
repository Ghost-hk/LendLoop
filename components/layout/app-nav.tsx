"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowDownToLine, ClipboardList, LayoutGrid, ShieldCheck, Wrench } from "lucide-react"
import { cn } from "@/lib/utils"

const ITEMS = [
  { href: "/app", label: "Tool wall", icon: LayoutGrid },
  { href: "/app/listings", label: "My listings", icon: Wrench },
  { href: "/app/requests", label: "My requests", icon: ClipboardList },
  { href: "/app/incoming", label: "Incoming", icon: ArrowDownToLine },
] as const

export function AppNav({
  isAdmin,
  incomingCount,
  onNavigate,
}: {
  isAdmin: boolean
  incomingCount: number
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const items = isAdmin ? [...ITEMS, { href: "/app/admin", label: "Admin", icon: ShieldCheck }] : ITEMS

  return (
    <nav aria-label="Main" className="flex flex-col gap-1">
      {items.map(({ href, label, icon: Icon }) => {
        const active = href === "/app" ? pathname === "/app" : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex h-11 items-center gap-3 rounded-md px-3 font-semibold transition-colors",
              "focus-visible:outline-safety",
              active ? "bg-safety text-ink" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-paper",
            )}
          >
            <Icon aria-hidden size={18} />
            <span className="flex-1">{label}</span>
            {href === "/app/incoming" && incomingCount > 0 && (
              <span className="rounded-full bg-tag-red px-2 text-xs leading-5 font-bold text-white tabular">
                {incomingCount}
                <span className="sr-only"> waiting on you</span>
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}
