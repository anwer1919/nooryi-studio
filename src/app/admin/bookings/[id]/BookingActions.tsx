"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { 
  CheckCircle2, 
  XCircle, 
  MessageCircle,
  CreditCard,
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
  clientEmail,
  depositAmount,
  totalAmount,
  date,
  timeSlot,
  venue,
}: BookingActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  // تأكيد الحجز (الموافقة)
  const handleApprove = async () => {
    setLoading("approve")
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}/approve`, {
        method: "POST",
      })
      
      if (response.ok) {
        router.refresh()
        alert("✅ تم تأكيد الحجز بنجاح وإرسال الإشعارات")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("❌ حدث خطأ")
    } finally {
      setLoading(null)
    }
  }

  // رفض الحجز
  const handleReject = async () => {
    if (!confirm("هل أنت متأكد من رفض هذا الحجز؟")) return
    
    setLoading("reject")
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}/reject`, {
        method: "POST",
      })
      
      if (response.ok) {
        router.refresh()
        alert("تم رفض الحجز")
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(null)
    }
  }

  // تأكيد الدفع (العربون)
  const handleConfirmDeposit = async () => {
    setLoading("confirm-deposit")
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}/confirm-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          amount: depositAmount, 
          type: "deposit" 
        }),
      })
      
      if (response.ok) {
        router.refresh()
        alert("✅ تم تأكيد دفع العربون بنجاح")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("❌ حدث خطأ")
    } finally {
      setLoading(null)
    }
  }

  // تأكيد الدفع (الكامل)
  const handleConfirmFullPayment = async () => {
    setLoading("confirm-full")
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}/confirm-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          amount: totalAmount, 
          type: "full" 
        }),
      })
      
      if (response.ok) {
        router.refresh()
        alert("✅ تم تأكيد الدفع الكامل بنجاح")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("❌ حدث خطأ")
    } finally {
      setLoading(null)
    }
  }

  // فتح واتساب لإرسال إشعار
  const openWhatsApp = () => {
    const message = `مرحباً ${clientName}،%0A%0A🎉 تم تأكيد حجزك بنجاح!%0A%0A📋 تفاصيل الحجز:%0A🎵 الفنان: ${artistName}%0A📅 التاريخ: ${date}%0A⏰ الوقت: ${timeSlot}%0A📍 المكان: ${venue}%0A%0A💰 المبلغ الإجمالي: ${totalAmount.toLocaleString()} ج.م%0A💳 العربون المطلوب: ${depositAmount.toLocaleString()} ج.م%0A%0Aشكراً لاختيارك Nooryi Studio! 🎵`
    
    const cleanPhone = clientPhone.replace(/[^0-9]/g, "")
    const fullPhone = cleanPhone.startsWith("20") ? cleanPhone : `20${cleanPhone}`
    window.open(`https://wa.me/${fullPhone}?text=${message}`, "_blank")
  }

  return (
    <div className="glass rounded-3xl p-6">
      <h3 className="text-sm text-white/40 uppercase mb-4">إجراءات</h3>
      
      <div className="space-y-3">
        {/* Approve Button */}
        {status === "PENDING_APPROVAL" && (
          <>
            <button
              onClick={handleApprove}
              disabled={loading === "approve"}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3.5 rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading === "approve" ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <CheckCircle2 size={18} />
              )}
              تأكيد الحجز
            </button>

            <button
              onClick={handleReject}
              disabled={loading === "reject"}
              className="w-full bg-red-500/10 border border-red-500/20 text-red-400 font-bold py-3.5 rounded-xl hover:bg-red-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading === "reject" ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <XCircle size={18} />
              )}
              رفض الحجز
            </button>
          </>
        )}

        {/* Confirm Payment Buttons */}
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
              disabled={loading === "confirm-deposit"}
              className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold py-3.5 rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading === "confirm-deposit" ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Wallet size={18} />
              )}
              تأكيد دفع العربون
            </button>

            <button
              onClick={handleConfirmFullPayment}
              disabled={loading === "confirm-full"}
              className="w-full bg-green-500/10 border border-green-500/20 text-green-400 font-bold py-3.5 rounded-xl hover:bg-green-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading === "confirm-full" ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <DollarSign size={18} />
              )}
              تأكيد الدفع الكامل
            </button>
          </>
        )}

        {/* WhatsApp Button */}
        <button
          onClick={openWhatsApp}
          className="w-full bg-green-500/10 border border-green-500/20 text-green-400 font-bold py-3.5 rounded-xl hover:bg-green-500/20 transition-all flex items-center justify-center gap-2"
        >
          <MessageCircle size={18} />
          إرسال إشعار واتساب
        </button>
      </div>

      {/* Client Contact */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <p className="text-xs text-white/40 mb-2">التواصل مع العميل</p>
        <div className="flex gap-2">
          <a 
            href={`tel:${clientPhone}`}
            className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs transition-colors"
          >
            <Phone size={12} />
            اتصال
          </a>
          {clientEmail && (
            <a 
              href={`mailto:${clientEmail}`}
              className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs transition-colors"
            >
              <Mail size={12} />
              إيميل
            </a>
          )}
        </div>
      </div>
    </div>
  )
}