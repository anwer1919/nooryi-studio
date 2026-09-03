"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Calendar, Clock, MapPin, User, Phone, Mail, Loader2, Music, Printer } from "lucide-react";

function PrintView() {
  const searchParams = useSearchParams();
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

  useEffect(() => {
    if (booking) {
      setTimeout(() => window.print(), 500);
    }
  }, [booking]);

  if (loading || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-[#b8941f]" />
      </div>
    );
  }

  const grossAmount = booking.grossAmount || 0;
  const depositAmount = booking.depositAmount || 0;
  const remainingAmount = booking.remainingAmount || 0;

  return (
    <div dir="rtl" className="bg-white p-8 max-w-[21cm] mx-auto print:p-0 print:max-w-none">
      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
        }
      `}</style>

      <button onClick={() => window.print()} className="no-print btn-gold w-full mb-6 py-4">
        <Printer size={18} />
        طباعة الآن
      </button>

      {/* Header */}
      <div className="flex items-start justify-between pb-6 border-b-2 border-[#d4af37] mb-6">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-14 h-14 rounded-2xl bg-[#111] flex items-center justify-center">
              <span className="text-[#d4af37] text-2xl font-black">N</span>
            </div>
            <div>
              <p className="text-2xl font-black text-[#111]">Nooryi Studio</p>
              <p className="text-xs text-[#b8941f] font-bold tracking-widest">فاتورة حجز</p>
            </div>
          </div>
          <p className="text-xs text-gray-600">info@noorystudio.com</p>
          <p className="text-xs text-gray-600" dir="ltr">+20 100 000 0000</p>
        </div>
        <div className="text-left">
          <p className="text-xs text-gray-500 mb-1">رقم الفاتورة</p>
          <p className="font-black text-[#111]" dir="ltr">#INV-{booking.id.slice(-8).toUpperCase()}</p>
          <p className="text-xs text-gray-500 mt-3 mb-1">التاريخ</p>
          <p className="font-bold text-[#111]">{new Date(booking.createdAt).toLocaleDateString("ar-EG")}</p>
        </div>
      </div>

      {/* Client Info */}
      <div className="mb-6 p-4 bg-[#faf8f0] rounded-xl">
        <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">فاتورة إلى</p>
        <p className="text-lg font-black text-[#111] mb-1">
          {booking.clientName || booking.customer?.name || booking.user?.name || "عميل"}
        </p>
        <p className="text-xs text-gray-600" dir="ltr">{booking.clientPhone || "—"}</p>
        {(booking.clientEmail || booking.customer?.email) && (
          <p className="text-xs text-gray-600" dir="ltr">{booking.clientEmail || booking.customer?.email}</p>
        )}
      </div>

      {/* Details */}
      <div className="mb-6">
        <h3 className="text-base font-black text-[#111] mb-3 flex items-center gap-2">
          <Music size={16} className="text-[#b8941f]" />
          تفاصيل الحجز
        </h3>
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b border-[#e8e4d9]">
              <td className="py-2 text-gray-600">الفنان</td>
              <td className="py-2 font-bold text-right">{booking.artist?.name || "—"}</td>
            </tr>
            <tr className="border-b border-[#e8e4d9]">
              <td className="py-2 text-gray-600">التاريخ</td>
              <td className="py-2 font-bold text-right">{booking.date ? new Date(booking.date).toLocaleDateString("ar-EG") : "—"}</td>
            </tr>
            <tr className="border-b border-[#e8e4d9]">
              <td className="py-2 text-gray-600">الوقت</td>
              <td className="py-2 font-bold text-right">{booking.timeSlot || "—"}</td>
            </tr>
            <tr className="border-b border-[#e8e4d9]">
              <td className="py-2 text-gray-600">المكان</td>
              <td className="py-2 font-bold text-right">{booking.venue?.name || "—"}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="mb-6 border-t-2 border-b-2 border-[#e8e4d9] py-4">
        <div className="flex justify-between mb-2">
          <span className="text-gray-700">المبلغ الإجمالي</span>
          <span className="font-bold">{grossAmount.toLocaleString()} ج.م</span>
        </div>
        {depositAmount > 0 && (
          <div className="flex justify-between mb-2">
            <span className="text-gray-700">العربون المدفوع</span>
            <span className="font-bold text-green-600">- {depositAmount.toLocaleString()} ج.م</span>
          </div>
        )}
        <div className="flex justify-between pt-3 border-t border-[#e8e4d9]">
          <span className="text-xl font-black">المتبقي</span>
          <span className="text-2xl font-black text-[#b8941f]">{remainingAmount.toLocaleString()} ج.م</span>
        </div>
      </div>

      <div className="text-center pt-6 border-t border-[#e8e4d9]">
        <p className="text-xs text-gray-500">شكراً لثقتك بنا • Nooryi Studio © 2026</p>
      </div>
    </div>
  );
}

export default function PrintInvoicePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 size={40} className="animate-spin text-[#b8941f]" /></div>}>
      <PrintView />
    </Suspense>
  );
}