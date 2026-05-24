"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Star } from "lucide-react"

interface StarRatingProps {
  value: number
  onChange?: (rating: number) => void
  readonly?: boolean
  size?: "sm" | "md" | "lg"
  showCount?: boolean
  count?: number
}

const sizeMap = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
}

export function StarRating({
  value,
  onChange,
  readonly = false,
  size = "md",
  showCount = false,
  count,
}: StarRatingProps) {
  const [hovered, setHovered] = useState(0)

  const displayValue = hovered || value

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.button
          key={star}
          type="button"
          disabled={readonly}
          whileHover={readonly ? {} : { scale: 1.2 }}
          whileTap={readonly ? {} : { scale: 0.9 }}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          onClick={() => onChange?.(star)}
          className={`transition-colors ${readonly ? "cursor-default" : "cursor-pointer"}`}
        >
          <Star
            className={`${sizeMap[size]} transition-colors duration-150 ${
              star <= displayValue
                ? "fill-amber-400 text-amber-400"
                : "text-slate-200 dark:text-slate-700"
            } ${!readonly && star > displayValue ? "hover:text-amber-200" : ""}`}
          />
        </motion.button>
      ))}
      {showCount && count !== undefined && (
        <span className="ml-1.5 text-sm font-bold text-slate-500 dark:text-slate-400">
          ({count})
        </span>
      )}
    </div>
  )
}


interface StarDistributionProps {
  reviews: { rating: number }[]
}

export function StarDistribution({ reviews }: StarDistributionProps) {
  const total = reviews.length
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    percentage: total > 0 ? (reviews.filter((r) => r.rating === star).length / total) * 100 : 0,
  }))

  return (
    <div className="space-y-2">
      {distribution.map(({ star, count, percentage }) => (
        <div key={star} className="flex items-center gap-3 text-sm">
          <span className="w-8 font-bold text-slate-600 dark:text-slate-400 text-right">
            {star}★
          </span>
          <div className="flex-1 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.6, delay: (5 - star) * 0.1 }}
              className="h-full bg-amber-400 rounded-full"
            />
          </div>
          <span className="w-8 text-xs font-semibold text-slate-400">
            {count}
          </span>
        </div>
      ))}
    </div>
  )
}
