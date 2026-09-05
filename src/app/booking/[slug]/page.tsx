"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  Calendar, Clock, MapPin, User, Phone, Mail,
  CheckCircle2, ArrowLeft, ArrowRight, Loader2, Sparkles, Music,
  DollarSign, Globe,
} from "lucide-react";

function BookingForm() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const { data: session } = useSession();

  const [artist, setArtist] = useState<any>(null);
  const [venues, setVenues] = useState<any[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  const [bookedDates, setBookedDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showingSuccess, setShowingSuccess] = useState(false);

  const [form, setForm] = useState({
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    date: "",
    timeSlot: "",
    venueId: "",
    eventType: "",
    notes: "",
    regionId: "",
  });

  useEffect(() => {
    console.log("🔄 [Booking] Loading data for:", slug);
    
    Promise.all([
      fetch(`/api/artists/${slug}`).then((r) => r.json()).catch(() => null),
      fetch("/api/venues").then((r) => r.json()).catch(() => []),
      fetch(`/api/artists/${slug}/pricing-regions`).then((r) => r.json()).catch(() => []),
      fetch(`/api/artists/${slug}/bookings`).then((r) => r.json()).catch(() => []),
    ]).then(([a, v, pr, bk]) => {
      console.log("📦 [Booking] Artist:", a);
      console.log("📦 [Booking] Regions:", pr);
      console.log("📦 [Booking] Bookings:", bk);
      
      setArtist(a);
      setVenues(Array.isArray(v) ? v : v?.data || []);
      
      // معالجة مناطق التسعير
      const regionsList = Array.isArray(pr) ? pr : (pr?.data || []);
      setRegions(regionsList);
      
      // معالجة الحجوزات المحجوزة
      const bookingsList = Array.isArray(bk) ? bk : (bk?.data || []);
      const dates = bookingsList.map((b: any) => {
        if (b.eventDate || b.date) {
          return new Date(b.eventDate || b.date).toISOString().split("T")[0];
        }
        return null;
      }).filter(Boolean);
      setBookedDates(dates);
      
      console.log("🗺️ Regions loaded:", regionsList.length);
      console.log("📅 Booked dates:", dates);
      
      setLoading(false);
    });
  }, [slug]);

  // التحقق من رقم الجوال الدولي
  const validatePhone = (phone: string): boolean => {
    if (!phone) return false;
    
    const cleaned = phone.replace(/[\s-]/g, "");
    
    // نمط دولي: يبدأ بـ + أو 00 متبوعاً بـ 7-15 رقم
    const internationalPattern = /^(\+|00)[1-9]\d{6,14}$/;
    
    // نمط محلي: 10-11 رقم يبدأ بـ 0
    const localPattern = /^0\d{9,10}$/;
    
    return internationalPattern.test(cleaned) || localPattern.test(cleaned);
  };

  // ✅ إصلاح: استخدام ?. لحماية من null
  const selectedRegion = regions.find((r) => r.id === form.regionId);
  const basePrice = selectedRegion 
    ? Number(selectedRegion.basePrice) + Number(selectedRegion.travelFee || 0)
    : (artist?.basePrice || artist?.minPrice || 1000);

  const handleSubmit = async () => {
    if (!validatePhone(form.clientPhone)) {
      setError("رقم الجوال غير صالح. أدخل رقماً دولياً (مثل: +201000000000) أو محلياً (مثل: 01000000000)");
      setStep(1);
      return;
    }

    if (!artist?.id) {
      setError("فشل تحميل بيانات الفنان");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          clientEmail: form.clientEmail || session?.user?.email || "",
          artistId: artist.id,
          artistSlug: slug,
          grossAmount: basePrice,
        
          venueId: form.venueId || undefined,
          countryCode: "+20",
          phoneNumber: form.clientPhone,
          region: selectedRegion?.regionName || "",
          travelFee: selectedRegion ? Number(selectedRegion.travelFee || 0) : 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل إنشاء الحجز");
      const bookingId = data.id || data.bookingId;
      
      // ✅ عرض رسالة نجاح قبل التوجيه
      setSuccessMessage(data.message || "تم إرسال الحجز بنجاح — سيتم المراجعة خلال دقائق");
      setShowingSuccess(true);
      
      // انتظار ثانيتين ثم التوجيه
      setTimeout(() => {
        if (bookingId) {
          router.push(`/booking/${slug}/invoice?id=${bookingId}`);
        } else {
          router.push("/my-bookings");
        }
      }, 2500);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  // التحقق من التاريخ المحجوز
  const isDateBooked = (dateStr: string) => {
    return bookedDates.includes(dateStr);
  };

  // الحصول على أدنى تاريخ (غداً)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-[#b8941f]" />
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-xl font-bold mb-4">الفنان غير موجود</p>
          <Link href="/artists" className="text-[#b8941f] hover:underline">
            العودة لقائمة الفنانين
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf8f0] to-white dark:from-[#0a0a0a] dark:to-[#111]" dir="rtl">
      <header className="bg-white/95 dark:bg-[#111]/95 backdrop-blur-xl border-b border-[#e8e4d9] dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 lg:px-8 h-20 flex items-center justify-between">
          <Link href={`/artists/${slug}`} className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-[#b8941f]">
            <ArrowRight size={18} />
            <span className="font-bold">العودة</span>
          </Link>
          <h1 className="text-lg font-black text-gray-900 dark:text-white">حجز {artist?.name || "الفنان"}</h1>
          <div className="w-20"></div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 lg:px-8 py-8">
        {/* Steps Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm ${
                step >= s 
                  ? "bg-gradient-to-r from-[#D4AF37] to-[#b8941f] text-[#111]" 
                  : "bg-gray-200 dark:bg-gray-700 text-gray-500"
              }`}>
                {s}
              </div>
              {s < 3 && <div className={`w-12 h-0.5 ${step > s ? "bg-[#D4AF37]" : "bg-gray-200 dark:bg-gray-700"}`}></div>}
            </div>
          ))}
        </div>

        {showingSuccess && (
          <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center animate-[fadeIn_0.3s]">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <CheckCircle2 size={40} className="text-white" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">تم إرسال الحجز بنجاح! 🎉</h2>
              <p className="text-gray-600 mb-4">{successMessage}</p>
              <div className="bg-[#faf8f0] border border-[#D4AF37]/30 rounded-xl p-4 mb-4">
                <p className="text-sm text-gray-700">
                  <strong>الخطوة التالية:</strong><br />
                  سيتم مراجعة حجزك من قبل إدارة المنصة، وبعدها ستتلقى إشعاراً لإتمام عملية الدفع.
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 text-[#D4AF37]">
                <Loader2 size={18} className="animate-spin" />
                <span className="text-sm font-bold">جاري التوجيه...</span>
              </div>
            </div>
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-red-700 dark:text-red-300 font-bold">
            {error}
          </div>
        )}

        {/* Step 1: معلومات العميل */}
        {step === 1 && (
          <div className="card-pro p-6 space-y-4">
            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <User size={20} className="text-[#b8941f]" />
              معلومات العميل
            </h2>

            <div>
              <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">الاسم الكامل *</label>
              <input
                type="text"
                value={form.clientName}
                onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 dark:bg-[#1a1a1a] dark:text-white rounded-2xl focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                placeholder="أدخل اسمك الكامل"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                <Globe size={16} /> رقم الهاتف * (دولي أو محلي)
              </label>
              <div className="relative">
                <Phone size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  value={form.clientPhone}
                  onChange={(e) => setForm({ ...form, clientPhone: e.target.value })}
                  className="w-full pr-12 pl-4 py-3 border border-gray-200 dark:border-gray-700 dark:bg-[#1a1a1a] dark:text-white rounded-2xl focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                  placeholder="مثال: +201000000000 أو 01000000000"
                  dir="ltr"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                يقبل الأرقام الدولية (+20, +966, +1) والمحلية (010, 050)
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">البريد الإلكتروني (اختياري)</label>
              <div className="relative">
                <Mail size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={form.clientEmail}
                  onChange={(e) => setForm({ ...form, clientEmail: e.target.value })}
                  className="w-full pr-12 pl-4 py-3 border border-gray-200 dark:border-gray-700 dark:bg-[#1a1a1a] dark:text-white rounded-2xl focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                  placeholder="example@email.com"
                  dir="ltr"
                />
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!form.clientName || !form.clientPhone}
              className="w-full bg-gradient-to-r from-[#D4AF37] to-[#b8941f] text-[#111] font-black py-4 rounded-2xl hover:shadow-lg transition disabled:opacity-50"
            >
              التالي — اختيار التاريخ
            </button>
          </div>
        )}

        {/* Step 2: التاريخ والمنطقة */}
        {step === 2 && (
          <div className="card-pro p-6 space-y-4">
            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Calendar size={20} className="text-[#b8941f]" />
              التاريخ والمنطقة
            </h2>

            {/* اختيار المنطقة */}
            {regions.length > 0 && (
              <div>
                <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                  <MapPin size={16} /> اختر المنطقة * (يؤثر على السعر)
                </label>
                <select
                  value={form.regionId}
                  onChange={(e) => setForm({ ...form, regionId: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 dark:bg-[#1a1a1a] dark:text-white rounded-2xl focus:ring-2 focus:ring-[#D4AF37]"
                >
                  <option value="">— اختر منطقة —</option>
                  {regions.map((r: any) => (
                    <option key={r.id} value={r.id}>
                      {r.regionName} — {Number(r.basePrice).toLocaleString()} ج.م
                      {Number(r.travelFee) > 0 ? ` (+${Number(r.travelFee).toLocaleString()} سفر)` : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">التاريخ *</label>
              <input
                type="date"
                value={form.date}
                min={getMinDate()}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 dark:bg-[#1a1a1a] dark:text-white rounded-2xl focus:ring-2 focus:ring-[#D4AF37]"
              />
              {isDateBooked(form.date) && (
                <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                  ⚠️ هذا التاريخ محجوز بالفعل، اختر تاريخاً آخر
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">الفترة الزمنية *</label>
              <select
                value={form.timeSlot}
                onChange={(e) => setForm({ ...form, timeSlot: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 dark:bg-[#1a1a1a] dark:text-white rounded-2xl focus:ring-2 focus:ring-[#D4AF37]"
              >
                <option value="">— اختر الفترة —</option>
                <option value="MORNING">صباحاً (8 ص - 12 م)</option>
                <option value="AFTERNOON">ظهراً (12 م - 5 م)</option>
                <option value="EVENING">مساءً (5 م - 9 م)</option>
                <option value="NIGHT">ليلاً (9 م - 12 ص)</option>
              </select>
            </div>

            {/* ملخص السعر */}
            <div className="bg-gradient-to-br from-[#111] to-[#232323] p-5 rounded-2xl text-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-300">السعر الأساسي</span>
                <span className="font-bold">{(artist?.basePrice || artist?.minPrice || 1000).toLocaleString()} ج.م</span>
              </div>
              {selectedRegion && (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-300">رسوم السفر ({selectedRegion.regionName})</span>
                    <span className="font-bold">+ {Number(selectedRegion.travelFee || 0).toLocaleString()} ج.م</span>
                  </div>
                </>
              )}
              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <span className="font-bold text-[#d4af37]">الإجمالي</span>
                <span className="text-2xl font-black text-[#d4af37]">{basePrice.toLocaleString()} ج.م</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-4 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-2xl font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                السابق
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!form.date || !form.timeSlot || isDateBooked(form.date)}
                className="flex-1 bg-gradient-to-r from-[#D4AF37] to-[#b8941f] text-[#111] font-black py-4 rounded-2xl hover:shadow-lg transition disabled:opacity-50"
              >
                التالي — تفاصيل إضافية
              </button>
            </div>
          </div>
        )}

        {/* Step 3: التفاصيل النهائية */}
        {step === 3 && (
          <div className="card-pro p-6 space-y-4">
            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Sparkles size={20} className="text-[#b8941f]" />
              تفاصيل إضافية
            </h2>

            <div>
              <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">نوع المناسبة *</label>
              <select
                value={form.eventType}
                onChange={(e) => setForm({ ...form, eventType: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 dark:bg-[#1a1a1a] dark:text-white rounded-2xl focus:ring-2 focus:ring-[#D4AF37]"
              >
                <option value="">— اختر نوع المناسبة —</option>
                <option value="wedding">حفل زفاف</option>
                <option value="birthday">عيد ميلاد</option>
                <option value="corporate">فعالية شركة</option>
                <option value="concert">حفل موسيقي</option>
                <option value="other">أخرى</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">المكان / القاعة</label>
              <select
                value={form.venueId}
                onChange={(e) => setForm({ ...form, venueId: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 dark:bg-[#1a1a1a] dark:text-white rounded-2xl focus:ring-2 focus:ring-[#D4AF37]"
              >
                <option value="">— اختر قاعة (اختياري) —</option>
                {venues.map((v: any) => (
                  <option key={v.id} value={v.id}>{v.name} — {v.city || v.address}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">ملاحظات إضافية</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 dark:bg-[#1a1a1a] dark:text-white rounded-2xl focus:ring-2 focus:ring-[#D4AF37]"
                placeholder="أي تفاصيل إضافية تريد إخبارنا بها..."
              />
            </div>

            {/* ملخص نهائي */}
            <div className="bg-gray-50 dark:bg-[#1a1a1a] p-5 rounded-2xl space-y-2 text-sm">
              <h3 className="font-black text-gray-900 dark:text-white mb-3">ملخص الحجز</h3>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">الفنان</span>
                <span className="font-bold text-gray-900 dark:text-white">{artist?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">الاسم</span>
                <span className="font-bold text-gray-900 dark:text-white">{form.clientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">الهاتف</span>
                <span className="font-bold text-gray-900 dark:text-white" dir="ltr">{form.clientPhone}</span>
              </div>
              {selectedRegion && (
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">المنطقة</span>
                  <span className="font-bold text-gray-900 dark:text-white">{selectedRegion.regionName}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">التاريخ</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {form.date ? new Date(form.date).toLocaleDateString("ar-EG") : "—"}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="font-black text-gray-900 dark:text-white">المبلغ الإجمالي</span>
                <span className="text-2xl font-black text-[#b8941f]">{basePrice.toLocaleString()} ج.م</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-4 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-2xl font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                السابق
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || !form.eventType}
                className="flex-1 bg-gradient-to-r from-[#D4AF37] to-[#b8941f] text-[#111] font-black py-4 rounded-2xl hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <><Loader2 size={18} className="animate-spin" /> جاري الحجز...</>
                ) : (
                  <><CheckCircle2 size={18} /> تأكيد الحجز</>
                )}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 size={40} className="animate-spin text-[#b8941f]" /></div>}>
      <BookingForm />
    </Suspense>
  );
}