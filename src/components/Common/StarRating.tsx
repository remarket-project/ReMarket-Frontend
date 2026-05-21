import { Star } from "lucide-react"

import { cn } from "@/lib/utils"

interface StarRatingProps {
  value: number
  size?: "sm" | "md"
  showValue?: boolean
  className?: string
}

export default function StarRating({
  value,
  size = "md",
  showValue = false,
  className,
}: StarRatingProps) {
  const rounded = Math.max(0, Math.min(5, value))
  const iconSize = size === "sm" ? "size-3.5" : "size-4"

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {Array.from({ length: 5 }).map((_, idx) => {
        const filled = idx < Math.round(rounded)
        return (
          <Star
            key={idx}
            className={cn(
              iconSize,
              filled ? "fill-amber-400 text-amber-400" : "text-blue-200",
            )}
          />
        )
      })}
      {showValue ? (
        <span className="ml-1 text-xs font-semibold text-blue-900/75">
          {rounded.toFixed(1)}
        </span>
      ) : null}
    </div>
  )
}
