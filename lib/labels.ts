import {
  ChefHat,
  CookingPot,
  Droplets,
  Flame,
  Scissors,
  Wrench,
  Drill,
  Hammer,
  Package,
  Shovel,
  SprayCan,
  Tent,
  Truck,
  type LucideIcon,
  type LucideProps,
} from "lucide-react"
import { LadderIcon, SawIcon } from "@/components/tools/authored-icons"
import { CATEGORIES, CONDITIONS, type Category, type Condition } from "@/convex/lib/validators"

type GlyphIcon = LucideIcon | ((props: LucideProps) => React.JSX.Element)

export const CATEGORY_META: Record<Category, { label: string; icon: GlyphIcon }> = {
  power_tools: { label: "Power tools", icon: Drill },
  hand_tools: { label: "Hand tools", icon: Hammer },
  garden: { label: "Garden", icon: Shovel },
  kitchen: { label: "Kitchen", icon: CookingPot },
  camping: { label: "Camping", icon: Tent },
  cleaning: { label: "Cleaning", icon: SprayCan },
  ladders_moving: { label: "Ladders & moving", icon: Truck },
  other: { label: "Other", icon: Package },
}

export const CONDITION_LABELS: Record<Condition, string> = {
  new: "New",
  like_new: "Like new",
  good: "Good",
  fair: "Fair",
  worn: "Worn",
}

export const CATEGORY_OPTIONS = CATEGORIES.map((value) => ({ value, label: CATEGORY_META[value].label }))
export const CONDITION_OPTIONS = CONDITIONS.map((value) => ({ value, label: CONDITION_LABELS[value] }))

const NAME_ICONS: [RegExp, GlyphIcon][] = [
  [/ladder|step ?stool/i, LadderIcon],
  [/\bsaw\b|jigsaw/i, SawIcon],
  [/socket|wrench|spanner/i, Wrench],
  [/trimmer|shears|clipper|pruner/i, Scissors],
  [/stove|burner|grill|bbq/i, Flame],
  [/mixer|blender|food processor/i, ChefHat],
  [/pressure washer|hose|sprinkler/i, Droplets],
]

export function iconFor(category: Category, name?: string): GlyphIcon {
  if (name) {
    const match = NAME_ICONS.find(([pattern]) => pattern.test(name))
    if (match) return match[1]
  }
  return CATEGORY_META[category].icon
}
