"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { approveBooking, rejectBooking, confirmPayment } from "../actions"
import { 
  CheckCircle2, 
  XCircle, 
  MessageCircle,
  Loader2,
  DollarSign,
  Wallet
} from "lucide-react"

interface BookingActionsProps {
  bookingId: string
  status: string
  artistName: string
  clientName: string
  clientPhone: string
  clientEmail: string
  depositAmount: number
  totalAmount: number
  date: string
  timeSlot: string
  venue: string
}

export default function BookingActions({
  bookingId,
  status,
  artistName,
  clientName,
  clientPhone,
  depositAmount,
  totalAmount,
  date,
  timeSlot,
  venue,
}: BookingActionsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [pendingAction, setPendingAction] = useState<string | null>(null)
  const [error, setError] = useState("")

  const handleApprove = () => {
    setError("")
    setPendingAction("approve")
    startTransition(async () => {
      const result = await approveBooking(bookingId)
      if (result.success) {
        alert("✅ " + result.message)
        router.refresh()
      } else {
        setError(result.error || "فشل تأكيد الحجز")
      }
      setPendingAction(null)
    })
  }

  const handleReject = () => {
    if (!confirm("هل أنت متأكد من رفض هذا الحجز؟")) return
    
    setError("")
    setPendingAction("reject")
    startTransition(async () => {
      const result = await rejectBooking(bookingId)
      if (result.success) {
        alert(result.message)
        router.refresh()
      } else {
        setError(result.error || "فشل رفض الحجز")
      }
      setPendingAction(null)
    })
  }

  const handleConfirmDeposit = () => {
    setError("")
    setPendingAction("confirm-deposit")
    startTransition(async () => {
      const result = await confirmPayment(bookingId, depositAmount, "deposit")
      if (result.success) {
        alert("✅ " + result.message)
        router.refresh()
      } else {
        setError(result.error || "فشل تأكيد الدفع")
      }
      setPendingAction(null)
    })
  }

  const handleConfirmFullPayment = () => {
    setError("")
    setPendingAction("confirm-full")
    startTransition(async () => {
      const result = await confirmPayment(bookingId, totalAmount, "full")
      if (result.success) {
        alert("✅ " + result.message)
        router.refresh()
      } else {
        setError(result.error || "فشل تأكيد الدفع")
      }
      setPendingAction(null)
    })
  }

  const openWhatsApp = () => {
    const message = `مرحباً ${clientName}،%0A%0A🎉 تم تأكيد حجزك بنجاح!%0A%0A📋 تفاصيل الحجز:%0A🎵 الفنان: ${artistName}%0A📅 التاريخ: ${date}%0A⏰ الوقت: ${timeSlot}%0A📍 المكان: ${venue}%0A%0A💰 المبلغ الإجمالي: ${totalAmount.toLocaleString()} ج.م%0A💳 العربون المطلوب: ${depositAmount.toLocaleString()} ج.م%0A%0Aشكراً لاختيارك Nooryi Studio! 🎵`
    
    const cleanPhone = clientPhone.replace(/[^0-9]/g, "")
    const fullPhone = cleanPhone.startsWith("20") ? cleanPhone : `20${cleanPhone}`
    window.open(`https://wa.me/${fullPhone}?text=${message}`, "_blank")
  }

  const isLoading = isPending || pendingAction !== null

  return (
    <div className="glass rounded-3xl p-6">
      <h3 className="text-sm text-white/40 uppercase mb-4">إجراءات</h3>
      
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}
      
      <div className="space-y-3">
        {status === "PENDING_APPROVAL" && (
          <>
            <button
              onClick={handleApprove}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3.5 rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {pendingAction === "approve" ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <CheckCircle2 size={18} />
              )}
              تأكيد الحجز
            </button>

            <button
              onClick={handleReject}
              disabled={isLoading}
              className="w-full bg-red-500/10 border border-red-500/20 text-red-400 font-bold py-3.5 rounded-xl hover:bg-red-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {pendingAction === "reject" ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <XCircle size={18} />
              )}
              رفض الحجز
            </button>
          </>
        )}

        {status === "APPROVED" && (
          <>
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl mb-2">
              <p className="text-xs text-white/60 mb-1">المبلغ المطلوب تأكيده</p>
              <p className="text-2xl font-black text-yellow-400">
                {depositAmount.toLocaleString()} ج.م
              </p>
              <p className="text-xs text-white/40 mt-1">العربون (20% من الإجمالي)</p>
            </div>

            <button
              onClick={handleConfirmDeposit}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold py-3.5 rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {pendingAction === "confirm-deposit" ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Wallet size={18} />
              )}
              تأكيد دفع العربون
            </button>

            <button
              onClick={handleConfirmFullPayment}
              disabled={isLoading}
              className="w-full bg-green-500/10 border border-green-500/20 text-green-400 font-bold py-3.5 rounded-xl hover:bg-green-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {pendingAction === "confirm-full" ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <DollarSign size={18} />
              )}
              تأكيد الدفع الكامل
            </button>
          </>
        )}

        <button
          onClick={openWhatsApp}
          disabled={isLoading}
          className="w-full bg-green-500/10 border border-green-500/20 text-green-400 font-bold py-3.5 rounded-xl hover:bg-green-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <MessageCircle size={18} />
          إرسال إشعار واتساب
        </button>
      </div>
    </div>
  )
}