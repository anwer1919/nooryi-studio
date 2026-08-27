"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { 
  CreditCard, 
  Wallet, 
  Building2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowRight
} from "lucide-react"

interface PaymentFormProps {
  bookingId: string
  grossAmount: number
  depositAmount: number
  remainingAmount: number
  platformFee: number
}

export default function PaymentForm({
  bookingId,
  grossAmount,
  depositAmount,
  remainingAmount,
  platformFee,
}: PaymentFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const [paymentData, setPaymentData] = useState({
    paymentType: "deposit" as "deposit" | "full",
    paymentMethod: "card" as "card" | "wallet" | "bank",
    cardNumber: "",
    cardExpiry: "",
    cardCvv: "",
    walletNumber: "",
    bankReference: "",
  })

  const currentAmount = paymentData.paymentType === "deposit" 
    ? depositAmount + platformFee 
    : grossAmount + platformFee

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    setLoading(true)
    setError("")

    // Validation
    if (paymentData.paymentMethod === "card") {
      if (!paymentData.cardNumber || !paymentData.cardExpiry || !paymentData.cardCvv) {
        setError("يرجى ملء جميع بيانات البطاقة")
        setLoading(false)
        return
      }
    } else if (paymentData.paymentMethod === "wallet") {
      if (!paymentData.walletNumber) {
        setError("يرجى إدخال رقم المحفظة")
        setLoading(false)
        return
      }
    } else if (paymentData.paymentMethod === "bank") {
      if (!paymentData.bankReference) {
        setError("يرجى إدخال رقم مرجع التحويل البنكي")
        setLoading(false)
        return
      }
    }

    try {
      const response = await fetch("/api/payments/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          amount: currentAmount,
          paymentType: paymentData.paymentType,
          paymentMethod: paymentData.paymentMethod,
          cardLast4: paymentData.cardNumber.slice(-4) || null,
          walletNumber: paymentData.walletNumber || null,
          bankReference: paymentData.bankReference || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "فشل عملية الدفع")
      }

      setSuccess(true)
      
      setTimeout(() => {
        router.push(`/booking/${bookingId}/invoice`)
      }, 3000)
    } catch (err: any) {
      console.error("Payment error:", err)
      setError(err.message || "حدث خطأ في عملية الدفع")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="glass rounded-3xl p-12 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 mb-6">
          <CheckCircle2 className="text-green-400" size={40} />
        </div>
        <h3 className="text-2xl font-bold mb-3 text-green-400">تم الدفع بنجاح! 🎉</h3>
        <p className="text-white/70 mb-2">
          تم استلام مبلغ {currentAmount.toLocaleString()} ج.م
        </p>
        <p className="text-sm text-white/50">
          جاري تحويلك لصفحة الفاتورة...
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="glass rounded-3xl p-6 space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-start gap-2">
          <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={16} />
          <p className="text-sm text-red-400 font-semibold">{error}</p>
        </div>
      )}

      {/* Payment Type Selection */}
      <div>
        <h3 className="text-lg font-bold mb-3">اختر نوع الدفع</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setPaymentData({ ...paymentData, paymentType: "deposit" })}
            className={`p-4 rounded-2xl border-2 transition-all text-right ${
              paymentData.paymentType === "deposit"
                ? "border-yellow-500 bg-yellow-500/10"
                : "border-white/10 hover:border-white/20"
            }`}
          >
            <p className="font-bold text-sm mb-1">العربون (20%)</p>
            <p className="text-2xl font-black text-green-400">
              {(depositAmount + platformFee).toLocaleString()}
            </p>
            <p className="text-xs text-white/60 mt-1">ج.م</p>
            <p className="text-xs text-white/40 mt-2">
              ادفع الآن والباقي يوم الفعالية
            </p>
          </button>

          <button
            type="button"
            onClick={() => setPaymentData({ ...paymentData, paymentType: "full" })}
            className={`p-4 rounded-2xl border-2 transition-all text-right ${
              paymentData.paymentType === "full"
                ? "border-yellow-500 bg-yellow-500/10"
                : "border-white/10 hover:border-white/20"
            }`}
          >
            <p className="font-bold text-sm mb-1">الدفع الكامل</p>
            <p className="text-2xl font-black text-yellow-400">
              {(grossAmount + platformFee).toLocaleString()}
            </p>
            <p className="text-xs text-white/60 mt-1">ج.م</p>
            <p className="text-xs text-white/40 mt-2">
              ادفع كامل المبلغ الآن
            </p>
          </button>
        </div>
      </div>

      {/* Payment Method Selection */}
      <div>
        <h3 className="text-lg font-bold mb-3">اختر طريقة الدفع</h3>
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setPaymentData({ ...paymentData, paymentMethod: "card" })}
            className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${
              paymentData.paymentMethod === "card"
                ? "border-yellow-500 bg-yellow-500/10"
                : "border-white/10 hover:border-white/20"
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <CreditCard className="text-blue-400" size={24} />
            </div>
            <div className="flex-1 text-right">
              <p className="font-bold">بطاقة ائتمانية</p>
              <p className="text-xs text-white/60">Visa, MasterCard, Meeza</p>
            </div>
            {paymentData.paymentMethod === "card" && (
              <CheckCircle2 className="text-yellow-400" size={20} />
            )}
          </button>

          <button
            type="button"
            onClick={() => setPaymentData({ ...paymentData, paymentMethod: "wallet" })}
            className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${
              paymentData.paymentMethod === "wallet"
                ? "border-yellow-500 bg-yellow-500/10"
                : "border-white/10 hover:border-white/20"
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Wallet className="text-purple-400" size={24} />
            </div>
            <div className="flex-1 text-right">
              <p className="font-bold">محفظة إلكترونية</p>
              <p className="text-xs text-white/60">فودافون كاش، اتصالات كاش، أورانج كاش</p>
            </div>
            {paymentData.paymentMethod === "wallet" && (
              <CheckCircle2 className="text-yellow-400" size={20} />
            )}
          </button>

          <button
            type="button"
            onClick={() => setPaymentData({ ...paymentData, paymentMethod: "bank" })}
            className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${
              paymentData.paymentMethod === "bank"
                ? "border-yellow-500 bg-yellow-500/10"
                : "border-white/10 hover:border-white/20"
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
              <Building2 className="text-green-400" size={24} />
            </div>
            <div className="flex-1 text-right">
              <p className="font-bold">تحويل بنكي</p>
              <p className="text-xs text-white/60">تحويل مباشر مع رفع إيصال التحويل</p>
            </div>
            {paymentData.paymentMethod === "bank" && (
              <CheckCircle2 className="text-yellow-400" size={20} />
            )}
          </button>
        </div>
      </div>

      {/* Payment Details */}
      <div className="space-y-4">
        {paymentData.paymentMethod === "card" && (
          <>
            <div>
              <label className="block text-sm text-white/60 mb-1.5">رقم البطاقة</label>
              <input
                type="text"
                value={paymentData.cardNumber}
                onChange={(e) => setPaymentData({ ...paymentData, cardNumber: e.target.value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim() })}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-yellow-500/50"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-white/60 mb-1.5">تاريخ الانتهاء</label>
                <input
                  type="text"
                  value={paymentData.cardExpiry}
                  onChange={(e) => {
                    let val = e.target.value.replace(/\D/g, '')
                    if (val.length >= 2) val = val.slice(0, 2) + '/' + val.slice(2, 4)
                    setPaymentData({ ...paymentData, cardExpiry: val })
                  }}
                  placeholder="MM/YY"
                  maxLength={5}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-yellow-500/50"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1.5">CVV</label>
                <input
                  type="password"
                  value={paymentData.cardCvv}
                  onChange={(e) => setPaymentData({ ...paymentData, cardCvv: e.target.value.replace(/\D/g, '') })}
                  placeholder="123"
                  maxLength={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-yellow-500/50"
                />
              </div>
            </div>
          </>
        )}

        {paymentData.paymentMethod === "wallet" && (
          <div>
            <label className="block text-sm text-white/60 mb-1.5">رقم المحفظة</label>
            <input
              type="tel"
              value={paymentData.walletNumber}
              onChange={(e) => setPaymentData({ ...paymentData, walletNumber: e.target.value })}
              placeholder="01xxxxxxxxx"
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-yellow-500/50"
            />
          </div>
        )}

        {paymentData.paymentMethod === "bank" && (
          <div>
            <label className="block text-sm text-white/60 mb-1.5">رقم مرجع التحويل</label>
            <input
              type="text"
              value={paymentData.bankReference}
              onChange={(e) => setPaymentData({ ...paymentData, bankReference: e.target.value })}
              placeholder="أدخل رقم العملية البنكية"
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-yellow-500/50"
            />
            <p className="text-xs text-white/40 mt-2">
              📞 للتحويل: بنك مصر - حساب رقم: 1234567890 - باسم: Nooryi Studio
            </p>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold py-4 rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            جاري المعالجة...
          </>
        ) : (
          <>
            <CheckCircle2 size={18} />
            ادفع {currentAmount.toLocaleString()} ج.م الآن
          </>
        )}
      </button>

      <p className="text-xs text-white/40 text-center">
        بالضغط على "ادفع الآن"، أنت توافق على شروط الاستخدام وسياسة الخصوصية
      </p>
    </form>
  )
}