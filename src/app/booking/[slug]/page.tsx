"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  Calendar, Clock, MapPin, User, Phone, Mail,
  CheckCircle2, ArrowLeft, ArrowRight, Loader2, Sparkles, Music,
} from "lucide-react";

function BookingForm() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = params.slug as string;

  const [artist, setArtist] = useState<any>(null);
  const [venues, setVenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    date: "",
    timeSlot: "",
    venueId: "",
    eventType: "",
    notes: "",
  });

  useEffect(() => {
    Promise.all([
      fetch(`/api/artists/${slug}`).then((r) => r.json()).catch(() => null),
      fetch("/api/venues").then((r) => r.json()).catch(() => []),
    ]).then(([a, v]) => {
      setArtist(a);
      setVenues(Array.isArray(v) ? v : v?.data || []);
      setLoading(false);
    });
  }, [slug]);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          artistId: artist?.id,
          artistSlug: slug,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل إنشاء الحجز");
      const bookingId = data.id || data.bookingId;
      router.push(bookingId ? `/booking/${slug}/invoice?id=${bookingId}` : "/my-bookings?success=true");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
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
        <p className="text-gray-500">الفنان غير موجود</p>
      </div>
    );
  }

  const basePrice = artist.basePrice || artist.minPrice || 1000;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf8f0] to-white" dir="rtl">
      <header className="bg-white/95 backdrop-blur-xl border-b border-[#e8e4d9] sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 lg:px-8 h-20 flex items-center justify-between">
          <Link href={`/artists/${slug}`} className="flex items-center gap-2 text-gray-700 hover:text-[#b8941f]">
            <ArrowRight size={18} />
            <span className="font-bold">العودة</span>
          </Link>
          <h1 className="text-lg font-black text-gray-900">حجز {artist.name}</h1>
          <div className="w-20"></div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 lg:px-8 py-6">
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex-1 flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm ${
                step >= s ? "bg-gradient-to-br from-[#d4af37] to-[#b8941f] text-[#111]" : "bg-gray-200 text-gray-400"
              }`}>
                {step > s ? <CheckCircle2 size={18} /> : s}
              </div>
              {s < 3 && <div className={`flex-1 h-1 mx-2 rounded ${step > s ? "bg-[#d4af37]" : "bg-gray-200"}`}></div>}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-3 text-xs font-bold text-gray-500">
          <span className={step === 1 ? "text-[#b8941f]" : ""}>التاريخ والوقت</span>
          <span className={step === 2 ? "text-[#b8941f]" : ""}>بياناتك</span>
          <span className={step === 3 ? "text-[#b8941f]" : ""}>المراجعة</span>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 lg:px-8 pb-20">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card-pro p-8">
            {error && (
              <div className="mb-5 p-4 bg-red-50 border-2 border-red-100 rounded-2xl text-sm text-red-700 font-bold">
                {error}
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 mb-2">اختر التاريخ والوقت</h2>
                  <p className="text-gray-500 text-sm">حدد التاريخ المناسب لفعاليتك</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">تاريخ الفعالية</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    min={new Date().toISOString().split("T")[0]}
                    className="input-modern"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">الفترة الزمنية</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {["صباحاً (8-12)", "ظهراً (12-4)", "مساءً (4-8)", "ليلاً (8-12)", "طوال اليوم", "حسب الاتفاق"].map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setForm({ ...form, timeSlot: slot })}
                        className={`p-4 rounded-2xl border-2 font-bold text-sm transition ${
                          form.timeSlot === slot
                            ? "border-[#d4af37] bg-[#d4af37]/10 text-[#b8941f]"
                            : "border-[#e8e4d9] bg-white text-gray-700 hover:border-[#d4af37]"
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">نوع الفعالية</label>
                  <select
                    value={form.eventType}
                    onChange={(e) => setForm({ ...form, eventType: e.target.value })}
                    className="input-modern"
                  >
                    <option value="">اختر نوع الفعالية</option>
                    <option value="wedding">حفل زفاف</option>
                    <option value="birthday">عيد ميلاد</option>
                    <option value="corporate">فعالية شركة</option>
                    <option value="graduation">حفلة تخرج</option>
                    <option value="private">حفلة خاصة</option>
                    <option value="other">أخرى</option>
                  </select>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 mb-2">بياناتك الشخصية</h2>
                  <p className="text-gray-500 text-sm">معلومات للتواصل معك</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">الاسم الكامل *</label>
                  <div className="relative">
                    <User size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={form.clientName}
                      onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                      placeholder="أدخل اسمك الكامل"
                      className="input-modern"
                      style={{ paddingInlineEnd: "3rem" }}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">رقم الهاتف *</label>
                  <div className="relative">
                    <Phone size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      required
                      value={form.clientPhone}
                      onChange={(e) => setForm({ ...form, clientPhone: e.target.value })}
                      placeholder="01xxxxxxxxx"
                      dir="ltr"
                      className="input-modern"
                      style={{ paddingInlineEnd: "3rem" }}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">البريد الإلكتروني</label>
                  <div className="relative">
                    <Mail size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={form.clientEmail}
                      onChange={(e) => setForm({ ...form, clientEmail: e.target.value })}
                      placeholder="example@email.com"
                      dir="ltr"
                      className="input-modern"
                      style={{ paddingInlineEnd: "3rem" }}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">مكان الفعالية *</label>
                  <select
                    required
                    value={form.venueId}
                    onChange={(e) => setForm({ ...form, venueId: e.target.value })}
                    className="input-modern"
                  >
                    <option value="">اختر المكان</option>
                    {venues.map((v: any) => (
                      <option key={v.id} value={v.id}>{v.name} — {v.city || ""}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">ملاحظات إضافية</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="أي تفاصيل إضافية..."
                    rows={4}
                    className="input-modern"
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 mb-2">مراجعة الطلب</h2>
                  <p className="text-gray-500 text-sm">تأكد من صحة البيانات قبل التأكيد</p>
                </div>
                <div className="space-y-3">
                  {[
                    { label: "التاريخ", value: form.date ? new Date(form.date).toLocaleDateString("ar-EG") : "—" },
                    { label: "الوقت", value: form.timeSlot || "—" },
                    { label: "نوع الفعالية", value: form.eventType || "—" },
                    { label: "العميل", value: form.clientName },
                    { label: "الهاتف", value: form.clientPhone, ltr: true },
                  ].map((row, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-[#faf8f0] rounded-2xl">
                      <span className="font-bold text-gray-700">{row.label}</span>
                      <span className="font-black text-gray-900" dir={row.ltr ? "ltr" : "rtl"}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between gap-3 pt-8 mt-8 border-t border-[#e8e4d9]">
              {step > 1 ? (
                <button onClick={() => setStep(step - 1)} className="btn-outline">
                  <ArrowRight size={16} />
                  السابق
                </button>
              ) : <div></div>}

              {step < 3 ? (
                <button onClick={() => setStep(step + 1)} className="btn-gold">
                  التالي
                  <ArrowLeft size={16} />
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={submitting} className="btn-gold">
                  {submitting ? (
                    <><Loader2 size={18} className="animate-spin" /> جاري الحجز...</>
                  ) : (
                    <><CheckCircle2 size={18} /> تأكيد الحجز</>
                  )}
                </button>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 card-pro p-6 space-y-5">
              <div className="flex items-center gap-3 pb-5 border-b border-[#e8e4d9]">
                {artist.profileImage ? (
                  <img src={artist.profileImage} alt={artist.name} className="w-16 h-16 rounded-2xl object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#111] to-[#232323] flex items-center justify-center">
                    <Music size={24} className="text-[#d4af37]" />
                  </div>
                )}
                <div>
                  <p className="font-black text-gray-900">{artist.name}</p>
                  <p className="text-xs text-gray-500">{artist.category}</p>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">السعر الأساسي</span>
                  <span className="font-black text-gray-900">{basePrice.toLocaleString()} ج.م</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">الرسوم</span>
                  <span className="font-black text-gray-900">10%</span>
                </div>
                <div className="h-px bg-[#e8e4d9]"></div>
                <div className="flex items-center justify-between">
                  <span className="font-black text-gray-900">الإجمالي</span>
                  <span className="text-xl font-black gold-text">
                    {Math.round(basePrice * 1.1).toLocaleString()} ج.م
                  </span>
                </div>
              </div>

              <div className="pt-5 border-t border-[#e8e4d9] space-y-2 text-xs text-gray-600">
                <div className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#b8941f]" /><span>دفع آمن ومشفّر</span></div>
                <div className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#b8941f]" /><span>ضمان استرداد كامل</span></div>
                <div className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#b8941f]" /><span>تأكيد فوري للحجز</span></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function BookingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 size={40} className="animate-spin text-[#b8941f]" />
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<BookingFallback />}>
      <BookingForm />
    </Suspense>
  );
}