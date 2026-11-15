import type { LucideProps } from "lucide-react"

function Svg({ size = 24, strokeWidth = 2, children, ...props }: LucideProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  )
}

export function LadderIcon(props: LucideProps) {
  return (
    <Svg {...props}>
      <path d="M7 2v20M17 2v20M7 6h10M7 10h10M7 14h10M7 18h10" />
    </Svg>
  )
}

export function SawIcon(props: LucideProps) {
  return (
    <Svg {...props}>
      <path d="M3 15 15 3l3 3L6 18" />
      <path d="M6 18l2-2 1 1 2-2 1 1 2-2 1 1 2-2" />
      <path d="M15 3l4.5 4.5a2 2 0 0 1 0 2.8L18 11.8" />
    </Svg>
  )
}
