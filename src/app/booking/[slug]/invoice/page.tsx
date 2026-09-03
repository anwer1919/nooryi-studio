"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  FileText, Download, Printer, Calendar, Clock, MapPin,
  DollarSign, User, Phone, Mail, CheckCircle2, CreditCard,
  ArrowRight, Loader2, Music, Sparkles
} from "lucide-react";

function InvoiceView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = searchParams.get("id");
  
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookingId) { setLoading(false); return; }
    fetch(`/api/bookings/${bookingId}`)
      .then(r => r.json())
      .then(data => { setBooking(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [bookingId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-[#b8941f]" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">الحجز غير موجود</p>
      </div>
    );
  }

  const getStatus = (s: string) => {
    const u = (s || "").toUpperCase();
    if (["CONFIRMED", "APPROVED", "ACCEPTED"].includes(u)) return { label: "مؤكد", class: "status-confirmed" };
    if (["PENDING_APPROVAL", "PENDING"].includes(u)) return { label: "قيد المراجعة", class: "status-pending" };
    if (["COMPLETED", "DONE"].includes(u)) return { label: "مكتمل", class: "status-completed" };
    return { label: "مرفوض", class: "status-rejected" };
  };

  const status = getStatus(booking.status);
  const grossAmount = booking.grossAmount || 0;
  const depositAmount = booking.depositAmount || 0;
  const remainingAmount = booking.remainingAmount || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf8f0] to-white" dir="rtl">
      <header className="bg-white/95 backdrop-blur-xl border-b border-[#e8e4d9] sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 lg:px-8 h-20 flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-700 hover:text-[#b8941f]">
            <ArrowRight size={18} />
            <span className="font-bold">العودة</span>
          </button>
          <h1 className="text-lg font-black text-gray-900">الفاتورة</h1>
          <div className="flex gap-2">
            <Link href={`/booking/${booking.artist?.slug || "artist"}/invoice/print?id=${bookingId}`} target="_blank" className="btn-outline text-sm py-2">
              <Printer size={14} />
              طباعة
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 lg:px-8 py-8">
        <div className="card-pro p-8 lg:p-12">
          {/* Header */}
          <div className="flex items-start justify-between pb-8 border-b-2 border-[#d4af37]/30 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#111] to-[#232323] flex items-center justify-center">
                  <span className="text-[#d4af37] text-2xl font-black">N</span>
                </div>
                <div>
                  <p className="text-2xl font-black text-gray-900">Nooryi</p>
                  <p className="text-[10px] text-[#b8941f] font-bold tracking-[0.25em] uppercase">Studio</p>
                </div>
              </div>
              <p className="text-sm text-gray-500">info@noorystudio.com</p>
              <p className="text-sm text-gray-500" dir="ltr">+20 100 000 0000</p>
            </div>
            <div className="text-left">
              <p className="text-xs text-gray-500 mb-1">رقم الفاتورة</p>
              <p className="font-black text-gray-900" dir="ltr">#INV-{booking.id.slice(-8).toUpperCase()}</p>
              <p className="text-xs text-gray-500 mt-3 mb-1">التاريخ</p>
              <p className="font-bold text-gray-900">{new Date(booking.createdAt).toLocaleDateString("ar-EG")}</p>
            </div>
          </div>

          {/* Client Info */}
          <div className="mb-8 p-6 bg-[#faf8f0] rounded-2xl">
            <p className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">فاتورة إلى</p>
            <p className="text-xl font-black text-gray-900 mb-1">
              {booking.clientName || booking.customer?.name || booking.user?.name || "عميل"}
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <Phone size={14} />
              <span dir="ltr">{booking.clientPhone || booking.customer?.phone || "—"}</span>
            </div>
            {(booking.clientEmail || booking.customer?.email) && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail size={14} />
                <span dir="ltr">{booking.clientEmail || booking.customer?.email}</span>
              </div>
            )}
          </div>

          {/* Booking Details */}
          <div className="mb-8">
            <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
              <Music size={18} className="text-[#b8941f]" />
              تفاصيل الحجز
            </h3>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-3 bg-[#faf8f0] rounded-xl">
                <User size={16} className="text-[#b8941f]" />
                <div>
                  <p className="text-xs text-gray-500">الفنان</p>
                  <p className="font-bold text-gray-900">{booking.artist?.name || "—"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-[#faf8f0] rounded-xl">
                <Calendar size={16} className="text-[#b8941f]" />
                <div>
                  <p className="text-xs text-gray-500">التاريخ</p>
                  <p className="font-bold text-gray-900">
                    {booking.date ? new Date(booking.date).toLocaleDateString("ar-EG") : "—"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-[#faf8f0] rounded-xl">
                <Clock size={16} className="text-[#b8941f]" />
                <div>
                  <p className="text-xs text-gray-500">الوقت</p>
                  <p className="font-bold text-gray-900">{booking.timeSlot || "—"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-[#faf8f0] rounded-xl">
                <MapPin size={16} className="text-[#b8941f]" />
                <div>
                  <p className="text-xs text-gray-500">المكان</p>
                  <p className="font-bold text-gray-900">{booking.venue?.name || "—"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="mb-8">
            <div className="border-t-2 border-b-2 border-[#e8e4d9] py-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-700">المبلغ الإجمالي</span>
                <span className="font-bold text-gray-900">{grossAmount.toLocaleString()} ج.م</span>
              </div>
              {depositAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-700">العربون المدفوع</span>
                  <span className="font-bold text-green-600">- {depositAmount.toLocaleString()} ج.م</span>
                </div>
              )}
              <div className="flex justify-between pt-3 border-t border-[#e8e4d9]">
                <span className="text-xl font-black text-gray-900">المتبقي</span>
                <span className="text-2xl font-black gold-text">{remainingAmount.toLocaleString()} ج.م</span>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between p-5 bg-gradient-to-r from-[#111] to-[#232323] rounded-2xl mb-8">
            <div>
              <p className="text-xs text-[#d4af37] font-bold mb-1">حالة الحجز</p>
              <span className={`status-chip ${status.class}`}>{status.label}</span>
            </div>
            <div className="text-left">
              <p className="text-xs text-white/60 mb-1">الإجمالي</p>
              <p className="text-2xl font-black text-[#d4af37]">{grossAmount.toLocaleString()} ج.م</p>
            </div>
          </div>

          {/* Actions */}
          <div className="grid md:grid-cols-2 gap-3">
            <Link href={`/booking/${booking.artist?.slug || "artist"}/payment?id=${bookingId}`} className="btn-gold py-4">
              <CreditCard size={18} />
              إكمال الدفع
            </Link>
            <Link href="/my-bookings" className="btn-outline py-4">
              <ArrowRight size={18} />
              العودة لحجوزاتي
            </Link>
          </div>

          {/* Footer */}
          <div className="mt-10 pt-6 border-t border-[#e8e4d9] text-center">
            <p className="text-xs text-gray-500 mb-2">شكراً لثقتك بنا</p>
            <p className="text-xs text-gray-400">© 2026 Nooryi Studio. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function InvoicePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 size={40} className="animate-spin text-[#b8941f]" /></div>}>
      <InvoiceView />
    </Suspense>
  );
}