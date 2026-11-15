import { BadgeCheck } from "lucide-react"

export function TrustedMark() {
  return (
    <span className="inline-flex items-center gap-1 rounded-sm bg-safety px-1.5 text-xs leading-5 font-bold text-ink">
      <BadgeCheck aria-hidden size={14} />
      Trusted
    </span>
  )
}
