"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import {
  CreditCard, Loader2, CheckCircle2, Smartphone,
  Building2, ArrowRight, DollarSign, Shield,
} from "lucide-react"

function PaymentProcessForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const id = searchParams.get("id")
  const type = searchParams.get("type") // deposit or full
  const amount = searchParams.get("amount")

  const [method, setMethod] = useState("card")
  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  // Card fields
  const [cardNumber, setCardNumber] = useState("")
  const [cardName, setCardName] = useState("")
  const [cardExpiry, setCardExpiry] = useState("")
  const [cardCvv, setCardCvv] = useState("")

  // Wallet fields
  const [walletNumber, setWalletNumber] = useState("")
  const [walletProvider, setWalletProvider] = useState("vodafone")

  // Bank fields
  const [bankRef, setBankRef] = useState("")

  if (!id || !amount) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">بيانات الدفع غير صحيحة</p>
      </div>
    )
  }

  const handlePay = async () => {
    setProcessing(true)
    setError("")

    try {
      const res = await fetch("/api/payments/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
          credentials: "include",
        body: JSON.stringify({
          bookingId: id,
          amount: parseFloat(amount),
          paymentType: type,
          paymentMethod: method,
          cardLast4: method === "card" ? cardNumber.slice(-4) : null,
          walletNumber: method === "wallet" ? walletNumber : null,
          walletProvider: method === "wallet" ? walletProvider : null,
          bankReference: method === "bank" ? bankRef : null,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "فشل عملية الدفع")
      }

      setSuccess(true)

      // التوجيه لصفحة الفاتورة بعد ثانيتين
      setTimeout(() => {
        router.push(`/booking/artist/invoice?id=${id}&paid=true`)
      }, 2500)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setProcessing(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <CheckCircle2 size={48} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-green-900 mb-2">تم الدفع بنجاح! 🎉</h1>
          <p className="text-gray-600 mb-4">
            تم استلام مبلغ <strong className="text-green-700">{parseFloat(amount).toLocaleString()} ج.م</strong> بنجاح
          </p>
          <p className="text-sm text-gray-500 mb-6">
            ✅ تم إرسال فاتورتك الرسمية على بريدك الإلكتروني<br/>
            🖨️ يمكنك طباعتها من رابط الفاتورة
          </p>
          <div className="flex items-center justify-center gap-2 text-[#D4AF37]">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm font-bold">جاري التوجيه لصفحة الفاتورة...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-[#faf8f0] to-white py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button onClick={() => window.history.back()} className="flex items-center gap-2 text-gray-600 hover:text-[#b8941f]">
            <ArrowRight size={18} />
            العودة
          </button>
          <div className="flex items-center gap-2 text-green-600">
            <Shield size={16} />
            <span className="text-sm font-bold">دفع آمن ومشفر</span>
          </div>
        </div>

        {/* Amount Summary */}
        <div className="bg-gradient-to-r from-[#111] to-[#0a0a0a] rounded-2xl p-6 text-white text-center">
          <p className="text-sm text-gray-300 mb-1">
            {type === "deposit" ? "💰 دفع العربون" : "✅ الدفع الكامل"}
          </p>
          <p className="text-4xl font-black text-[#D4AF37]">
            {parseFloat(amount).toLocaleString()} <span className="text-lg">ج.م</span>
          </p>
        </div>

        {/* Payment Method Selection */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-black text-gray-900 mb-4">اختر طريقة الدفع</h3>
          
          <div className="grid grid-cols-3 gap-3 mb-6">
            <button
              onClick={() => setMethod("card")}
              className={`p-4 rounded-xl border-2 transition ${
                method === "card"
                  ? "border-[#D4AF37] bg-[#D4AF37]/10"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <CreditCard size={24} className={`mx-auto mb-2 ${method === "card" ? "text-[#D4AF37]" : "text-gray-400"}`} />
              <p className="text-sm font-bold">بطاقة ائتمان</p>
            </button>
            <button
              onClick={() => setMethod("wallet")}
              className={`p-4 rounded-xl border-2 transition ${
                method === "wallet"
                  ? "border-[#D4AF37] bg-[#D4AF37]/10"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <Smartphone size={24} className={`mx-auto mb-2 ${method === "wallet" ? "text-[#D4AF37]" : "text-gray-400"}`} />
              <p className="text-sm font-bold">محفظة</p>
            </button>
            <button
              onClick={() => setMethod("bank")}
              className={`p-4 rounded-xl border-2 transition ${
                method === "bank"
                  ? "border-[#D4AF37] bg-[#D4AF37]/10"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <Building2 size={24} className={`mx-auto mb-2 ${method === "bank" ? "text-[#D4AF37]" : "text-gray-400"}`} />
              <p className="text-sm font-bold">تحويل بنكي</p>
            </button>
          </div>

          {/* Card Form */}
          {method === "card" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">رقم البطاقة</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16))}
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl font-mono"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">اسم حامل البطاقة</label>
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="الاسم كما على البطاقة"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">تاريخ الانتهاء</label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value.slice(0, 5))}
                    placeholder="MM/YY"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl font-mono"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">CVV</label>
                  <input
                    type="text"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
                    placeholder="123"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl font-mono"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Wallet Form */}
          {method === "wallet" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">المحفظة</label>
                <select
                  value={walletProvider}
                  onChange={(e) => setWalletProvider(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl"
                >
                  <option value="vodafone">Vodafone Cash</option>
                  <option value="etisalat">Etisalat Cash</option>
                  <option value="orange">Orange Cash</option>
                  <option value="instapay">InstaPay</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">رقم المحفظة</label>
                <input
                  type="tel"
                  value={walletNumber}
                  onChange={(e) => setWalletNumber(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl font-mono"
                  dir="ltr"
                />
              </div>
            </div>
          )}

          {/* Bank Form */}
          {method === "bank" && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-900">
                <p className="font-bold mb-2">📋 بيانات التحويل البنكي:</p>
                <p>البنك: البنك الأهلي المصري</p>
                <p>رقم الحساب: 1234567890</p>
                <p>الاسم: Nooryi Studio</p>
                <p className="mt-2 text-xs">أدخل رقم مرجع التحويل بعد الإرسال</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">رقم مرجع التحويل</label>
                <input
                  type="text"
                  value={bankRef}
                  onChange={(e) => setBankRef(e.target.value)}
                  placeholder="مثال: TXN-2026-001"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl font-mono"
                  dir="ltr"
                />
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 font-bold text-center">
            ❌ {error}
          </div>
        )}

        <button
          onClick={handlePay}
          disabled={processing}
          className="w-full bg-gradient-to-r from-[#D4AF37] to-[#b8941f] text-[#111] font-black py-4 rounded-2xl hover:shadow-xl transition disabled:opacity-50 flex items-center justify-center gap-2 text-lg"
        >
          {processing ? (
            <><Loader2 size={20} className="animate-spin" /> جاري المعالجة...</>
          ) : (
            <><DollarSign size={20} /> ادفع {parseFloat(amount).toLocaleString()} ج.م</>
          )}
        </button>
      </div>
    </div>
  )
}

export default function PaymentProcessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#D4AF37]" size={40} /></div>}>
      <PaymentProcessForm />
    </Suspense>
  )
}