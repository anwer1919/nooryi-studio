"use client"

import { useState } from "react"
import { Star, Send, Loader2, CheckCircle } from "lucide-react"
import StarRating from "./StarRating"

interface ReviewFormProps {
  bookingId: string
  artistName: string
  onSuccess?: () => void
}

export default function ReviewForm({ bookingId, artistName, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (rating === 0) {
      setError("الرجاء اختيار تقييم بالنجوم")
      return
    }

    setSubmitting(true)
    setError("")

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, rating, comment }),
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess(true)
        setRating(0)
        setComment("")
        onSuccess?.()
      } else {
        setError(data.error || "فشل إرسال التقييم")
      }
    } catch (err) {
      setError("حدث خطأ أثناء إرسال التقييم")
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 text-center">
        <CheckCircle className="mx-auto text-green-400 mb-3" size={48} />
        <p className="text-green-400 font-bold mb-1">شكراً لتقييمك!</p>
        <p className="text-neutral-400 text-sm">
          تم إرسال تقييمك للفنان {artistName} بنجاح
        </p>
      </div>
    )
  }

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
      <h3 className="text-lg font-bold text-white mb-4">
        قيّم تجربتك مع {artistName}
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="text-center py-4">
          <p className="text-neutral-400 text-sm mb-3">اضغط على النجوم للتقييم</p>
          <div className="flex justify-center">
            <StarRating 
              rating={rating} 
              size={40} 
              interactive 
              onChange={setRating} 
            />
          </div>
          {rating > 0 && (
            <p className="text-yellow-400 font-bold mt-2">
              {rating === 5 ? "ممتاز! 🌟" : 
               rating === 4 ? "جيد جداً 👍" : 
               rating === 3 ? "جيد 🙂" : 
               rating === 2 ? "مقبول 😐" : "سيئ 😞"}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm text-neutral-300 mb-2">
            تعليقك (اختياري)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            maxLength={500}
            className="w-full p-3 bg-black border border-neutral-700 rounded-lg text-white focus:border-yellow-500 outline-none resize-none"
            placeholder="شاركنا تجربتك مع الفنان..."
          />
          <p className="text-xs text-neutral-500 mt-1 text-left" dir="ltr">
            {comment.length}/500
          </p>
        </div>

        <button
          type="submit"
          disabled={submitting || rating === 0}
          className="w-full flex items-center justify-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-black font-bold py-3 rounded-lg transition disabled:opacity-50"
        >
          {submitting ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Send size={20} />
          )}
          {submitting ? "جاري الإرسال..." : "إرسال التقييم"}
        </button>
      </form>
    </div>
  )
}