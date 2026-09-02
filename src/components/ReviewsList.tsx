"use client"

import { useEffect, useState } from "react"
import { MessageCircle, Star } from "lucide-react"
import StarRating from "./StarRating"

interface Review {
  id: string
  rating: number
  comment: string | null
  clientName: string | null
  createdAt: string
}

interface ReviewStats {
  total: number
  average: number
  distribution: Record<number, number>
}

export default function ReviewsList({ artistSlug }: { artistSlug: string }) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<ReviewStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/artists/${artistSlug}/reviews`)
      .then((res) => res.json())
      .then((data) => {
        setReviews(data.reviews || [])
        setStats(data.stats || null)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }, [artistSlug])

  if (loading) {
    return (
      <div className="text-center py-8 text-neutral-500">
        جاري تحميل التقييمات...
      </div>
    )
  }

  if (!stats || stats.total === 0) {
    return (
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-12 text-center">
        <MessageCircle className="mx-auto text-neutral-600 mb-3" size={48} />
        <p className="text-neutral-400 mb-1">لا توجد تقييمات بعد</p>
        <p className="text-neutral-500 text-sm">
          كن أول من يقيّم هذا الفنان بعد الحجز
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ملخص التقييمات */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
        <div className="grid md:grid-cols-2 gap-8">
          {/* المتوسط */}
          <div className="text-center border-l border-neutral-800 md:pl-8">
            <div className="text-6xl font-bold text-yellow-400 mb-2">
              {stats.average.toFixed(1)}
            </div>
            <div className="flex justify-center mb-2">
              <StarRating rating={stats.average} size={24} />
            </div>
            <p className="text-neutral-400 text-sm">
              بناءً على {stats.total} تقييم
            </p>
          </div>

          {/* توزيع التقييمات */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = stats.distribution[star] || 0
              const percentage =
                stats.total > 0 ? (count / stats.total) * 100 : 0

              return (
                <div key={star} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-12">
                    <span className="text-sm text-neutral-400">{star}</span>
                    <Star size={14} className="fill-yellow-400 text-yellow-400" />
                  </div>
                  <div className="flex-1 bg-neutral-800 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-neutral-500 w-8 text-left">
                    {count}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* قائمة التقييمات */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white">
          التقييمات ({reviews.length})
        </h3>

        {reviews.map((review) => (
          <div
            key={review.id}
            className="bg-neutral-900 border border-neutral-800 rounded-xl p-6"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-full flex items-center justify-center text-black font-bold">
                  {(review.clientName || "ع").charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-white">
                    {review.clientName || "عميل"}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {new Date(review.createdAt).toLocaleDateString("ar-EG", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      timeZone: "UTC",
                    })}
                  </p>
                </div>
              </div>
              <StarRating rating={review.rating} size={18} />
            </div>

            {review.comment && (
              <p className="text-neutral-300 leading-relaxed">
                {review.comment}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}