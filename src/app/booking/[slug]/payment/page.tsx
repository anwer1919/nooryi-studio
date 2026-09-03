"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  CreditCard, Wallet, Building, DollarSign, CheckCircle2,
  ArrowRight, Loader2, Lock, ShieldCheck, Calendar
} from "lucide-react";

function PaymentForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = searchParams.get("id");
  
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [payAmount, setPayAmount] = useState<"deposit" | "full">("deposit");
  const [method, setMethod] = useState("CREDIT_CARD");

  useEffect(() => {
    if (!bookingId) { setLoading(false); return; }
    fetch(`/api/bookings/${bookingId}`)
      .then(r => r.json())
      .then(data => { setBooking(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [bookingId]);

  const handlePay = async () => {
    if (!booking) return;
    setSubmitting(true);
    try {
      const amount = payAmount === "deposit"
        ? Math.max(booking.grossAmount * 0.3, 500)
        : booking.remainingAmount || booking.grossAmount;

      const res = await fetch(`/api/bookings/${booking.id}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, method }),
      });

      if (!res.ok) throw new Error("فشل إتمام عملية الدفع");

      router.push(`/booking/${booking.artist?.slug || "artist"}/invoice?id=${booking.id}&paid=true`);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-[#b8941f]" />
      </div>
    );
  }

  const grossAmount = booking.grossAmount || 0;
  const depositAmount = booking.depositAmount || 0;
  const remainingAmount = booking.remainingAmount || grossAmount;
  const suggestedDeposit = Math.max(grossAmount * 0.3, 500);
  const currentPay = payAmount === "deposit" ? suggestedDeposit : remainingAmount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf8f0] to-white" dir="rtl">
      <header className="bg-white/95 backdrop-blur-xl border-b border-[#e8e4d9] sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 lg:px-8 h-20 flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-700 hover:text-[#b8941f]">
            <ArrowRight size={18} />
            <span className="font-bold">العودة</span>
          </button>
          <h1 className="text-lg font-black text-gray-900">إتمام الدفع</h1>
          <div className="w-20"></div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="card-pro p-6">
              <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign size={20} className="text-[#b8941f]" />
                اختر المبلغ
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPayAmount("deposit")}
                  className={`p-5 rounded-2xl border-2 text-right transition ${
                    payAmount === "deposit"
                      ? "border-[#d4af37] bg-[#d4af37]/10"
                      : "border-[#e8e4d9] bg-white hover:border-[#d4af37]"
                  }`}
                >
                  <p className="text-xs text-gray-500 mb-1">عربون (30%)</p>
                  <p className="text-2xl font-black text-gray-900">{suggestedDeposit.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">ج.م</p>
                </button>
                <button
                  onClick={() => setPayAmount("full")}
                  className={`p-5 rounded-2xl border-2 text-right transition ${
                    payAmount === "full"
                      ? "border-[#d4af37] bg-[#d4af37]/10"
                      : "border-[#e8e4d9] bg-white hover:border-[#d4af37]"
                  }`}
                >
                  <p className="text-xs text-gray-500 mb-1">المبلغ المتبقي</p>
                  <p className="text-2xl font-black text-gray-900">{remainingAmount.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">ج.م</p>
                </button>
              </div>
            </div>

            <div className="card-pro p-6">
              <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard size={20} className="text-[#b8941f]" />
                طريقة الدفع
              </h2>
              <div className="space-y-2">
                {[
                  { id: "CREDIT_CARD", icon: CreditCard, label: "بطاقة ائتمان", desc: "Visa / Mastercard" },
                  { id: "INSTAPAY", icon: Wallet, label: "إنستا باي", desc: "تحويل فوري" },
                  { id: "BANK", icon: Building, label: "تحويل بنكي", desc: "من أي بنك" },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMethod(m.id)}
                    className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 text-right transition ${
                      method === m.id
                        ? "border-[#d4af37] bg-[#d4af37]/10"
                        : "border-[#e8e4d9] bg-white hover:border-[#d4af37]"
                    }`}
                  >
                    <div className="icon-circle">
                      <m.icon size={18} />
                    </div>
                    <div className="flex-1">
                      <p className="font-black text-gray-900">{m.label}</p>
                      <p className="text-xs text-gray-500">{m.desc}</p>
                    </div>
                    {method === m.id && <CheckCircle2 size={20} className="text-[#b8941f]" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="sticky top-24 card-pro p-6 space-y-5">
              <h3 className="text-lg font-black text-gray-900">ملخص الدفع</h3>

              <div className="p-4 bg-[#faf8f0] rounded-2xl space-y-2">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#111] to-[#232323] flex items-center justify-center">
                    <Music size={18} className="text-[#d4af37]" />
                  </div>
                  <div>
                    <p className="font-black text-gray-900">{booking.artist?.name}</p>
                    <p className="text-xs text-gray-500">
                      {booking.date ? new Date(booking.date).toLocaleDateString("ar-EG") : ""}
                    </p>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">المبلغ الإجمالي</span>
                  <span className="font-bold">{grossAmount.toLocaleString()} ج.م</span>
                </div>
                {depositAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">المدفوع مسبقاً</span>
                    <span className="font-bold text-green-600">- {depositAmount.toLocaleString()} ج.م</span>
                  </div>
                )}
              </div>

              <div className="p-5 bg-gradient-to-br from-[#111] to-[#232323] rounded-2xl text-white">
                <p className="text-xs text-[#d4af37] font-bold mb-1">المبلغ المطلوب دفعه الآن</p>
                <p className="text-3xl font-black text-[#d4af37]">{currentPay.toLocaleString()} ج.م</p>
              </div>

              <button onClick={handlePay} disabled={submitting} className="btn-gold w-full py-4">
                {submitting ? (
                  <><Loader2 size={18} className="animate-spin" /> جاري المعالجة...</>
                ) : (
                  <><Lock size={18} /> ادفع الآن بأمان</>
                )}
              </button>

              <div className="flex items-center gap-2 text-xs text-gray-500 justify-center">
                <ShieldCheck size={14} className="text-[#b8941f]" />
                <span>جميع المعاملات مشفرة وآمنة</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 size={40} className="animate-spin text-[#b8941f]" /></div>}>
      <PaymentForm />
    </Suspense>
  );
}

import { Music } from "lucide-react";