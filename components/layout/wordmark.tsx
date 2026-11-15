import Link from "next/link"
import { cn } from "@/lib/utils"

export function Wordmark({ href = "/", className }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={cn("font-title text-[1.75rem] leading-none text-safety", className)}>
      LendLoop
    </Link>
  )
}
