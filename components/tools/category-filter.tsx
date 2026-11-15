"use client"

import { CATEGORY_OPTIONS } from "@/lib/labels"
import type { Category } from "@/convex/lib/validators"
import { cn } from "@/lib/utils"

export function CategoryFilter({
  value,
  onChange,
}: {
  value: Category | undefined
  onChange: (value: Category | undefined) => void
}) {
  const options = [{ value: undefined, label: "All" }, ...CATEGORY_OPTIONS]
  return (
    <div role="group" aria-label="Filter by category" className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.label}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "h-9 shrink-0 rounded-full border px-4 text-sm font-semibold whitespace-nowrap transition-colors",
              active ? "border-ink bg-ink text-paper" : "border-input bg-card text-ink hover:border-ink",
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
