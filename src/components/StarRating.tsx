"use client"

import { Star } from "lucide-react"

interface StarRatingProps {
  rating: number
  size?: number
  interactive?: boolean
  onChange?: (rating: number) => void
  showValue?: boolean
}

export default function StarRating({ 
  rating, 
  size = 20, 
  interactive = false, 
  onChange,
  showValue = false 
}: StarRatingProps) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= Math.round(rating)
        const partial = star - rating < 1 && star - rating > 0
        
        return (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange?.(star)}
            className={`${interactive ? "cursor-pointer hover:scale-110 transition" : "cursor-default"}`}
          >
            <Star
              size={size}
              className={
                filled 
                  ? "fill-yellow-400 text-yellow-400" 
                  : partial
                  ? "fill-yellow-400/50 text-yellow-400"
                  : "text-neutral-600"
              }
            />
          </button>
        )
      })}
      {showValue && rating > 0 && (
        <span className="text-yellow-400 font-bold mr-2 text-lg">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
}