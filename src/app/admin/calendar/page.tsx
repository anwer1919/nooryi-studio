"use client";

import { useState, useEffect } from "react";
import { Calendar as CalIcon, Clock, MapPin, Printer, ChevronLeft, ChevronRight, Loader2, User, Phone } from "lucide-react";

export default function AdminCalendarPage() {
  const [artists, setArtists] = useState<any[]>([]);
  const [selectedArtistId, setSelectedArtistId] = useState("");
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [error, setError] = useState("");

  useEffect(() => {
    console.log("🔄 [Calendar] Fetching artists...");
    fetch("/api/artists")
      .then(async (res) => {
        const text = await res.text();
        console.log("📦 [Calendar] Raw:", text);
        try {
          const data = JSON.parse(text);
          const list = Array.isArray(data) ? data : (data.data || []);
          console.log(`✅ [Calendar] Got ${list.length} artists`);
          setArtists(list);
        } catch (e) {
          console.error("❌ [Calendar] Parse error:", e);
          setError("فشل في قراءة الفنانين");
        }
      })
      .catch(err => {
        console.error("❌ [Calendar] Fetch error:", err);
        setError("فشل في الاتصال");
      });
  }, []);

  useEffect(() => {
    if (!selectedArtistId) { setBookings([]); return; }
    const artist = artists.find(a => a.id === selectedArtistId);
    if (!artist || !artist.slug) return;

    setLoading(true);
    console.log(`🔍 [Calendar] Fetching bookings for: ${artist.slug}`);
    
    fetch(`/api/artists/${artist.slug}/bookings`)
      .then(async (res) => {
        const text = await res.text();
        console.log("📦 [Calendar] Bookings raw:", text);
        try {
          const data = JSON.parse(text);
          const list = Array.isArray(data) ? data : (data.data || []);
          console.log(`✅ [Calendar] Got ${list.length} bookings`);
          setBookings(list);
        } catch (e) {
          console.error("❌ [Calendar] Parse error:", e);
        }
      })
      .catch(err => console.error("❌ [Calendar] Bookings error:", err))
      .finally(() => setLoading(false));
  }, [selectedArtistId, artists]);

  const monthBookings = bookings.filter(b => {
    const d = new Date(b.eventDate || b.date);
    return d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
  });

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const monthName = currentDate.toLocaleDateString("ar-EG", { month: "long", year: "numeric" });
  const selectedArtist = artists.find(a => a.id === selectedArtistId);

  const statusConfig: any = {
    PENDING_APPROVAL: { label: "قيد المراجعة", bg: "bg-yellow-100", text: "text-yellow-700" },
    APPROVED: { label: "موافق عليه", bg: "bg-blue-100", text: "text-blue-700" },
    CONFIRMED: { label: "مؤكد", bg: "bg-green-100", text: "text-green-700" },
    COMPLETED: { label: "مكتمل", bg: "bg-emerald-100", text: "text-emerald-700" },
  };

  return (
    <div dir="rtl" className="p-6 space-y-6 max-w-6xl mx-auto">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          @page { margin: 1cm; size: A4 landscape; }
        }
      `}</style>

      <div className="flex items-center justify-between no-print">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">تقويم الحجوزات</h1>
          <p className="text-gray-500 mt-1">عرض جدول الحجوزات لكل فنان</p>
        </div>
        <button
          onClick={() => window.print()}
          disabled={!selectedArtistId || monthBookings.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#b8941f] text-[#111] font-bold rounded-xl hover:shadow-lg transition disabled:opacity-50"
        >
          <Printer size={16} />
          طباعة
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-700 dark:text-red-300 font-bold">
          ❌ {error}
        </div>
      )}

      <div className="bg-white dark:bg-[#111] rounded-2xl p-6 border border-gray-200 dark:border-gray-800 no-print">
        <label className="block text-sm font-bold mb-2">
          اختر الفنان ({artists.length} متاح)
        </label>
        <select
          value={selectedArtistId}
          onChange={(e) => setSelectedArtistId(e.target.value)}
          className="w-full px-4 py-3 border rounded-xl dark:bg-[#1a1a1a] dark:border-gray-700 dark:text-white"
        >
          <option value="">— اختر فناناً —</option>
          {artists.map(a => (
            <option key={a.id} value={a.id}>
              {a.name} {a.slug ? `(${a.slug})` : "❌ بدون slug"}
            </option>
          ))}
        </select>
        {artists.length === 0 && (
          <p className="text-xs text-red-500 mt-2">⚠️ لا يوجد فنانين — تحقق من Console (F12)</p>
        )}
      </div>

      {!selectedArtistId ? (
        <div className="bg-white dark:bg-[#111] rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-800 no-print">
          <CalIcon className="mx-auto text-gray-300 mb-4" size={56} />
          <p className="text-gray-500">اختر فناناً لعرض تقويمه</p>
        </div>
      ) : loading ? (
        <div className="text-center py-12">
          <Loader2 size={40} className="animate-spin text-[#D4AF37] mx-auto" />
        </div>
      ) : (
        <div className="bg-white dark:bg-[#111] rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden print-area">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#0a0a0a] to-[#111] p-6 text-white">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#b8941f] flex items-center justify-center">
                  <span className="text-[#111] text-2xl font-black">{selectedArtist?.name?.charAt(0) || "ف"}</span>
                </div>
                <div>
                  <h2 className="text-2xl font-black">{selectedArtist?.name}</h2>
                  <p className="text-sm text-gray-300">{monthName}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">حجوزات هذا الشهر</p>
                <p className="text-3xl font-black text-[#D4AF37]">{monthBookings.length}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="p-4 bg-gray-50 dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-gray-700 flex items-center justify-between no-print">
            <div className="flex items-center gap-2">
              <button onClick={prevMonth} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg">
                <ChevronRight size={20} />
              </button>
              <h3 className="text-xl font-black text-gray-900 dark:text-white min-w-[200px] text-center">{monthName}</h3>
              <button onClick={nextMonth} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg">
                <ChevronLeft size={20} />
              </button>
            </div>
          </div>

          {/* Bookings Grid */}
          <div className="p-6">
            {monthBookings.length === 0 ? (
              <div className="text-center py-12">
                <CalIcon className="mx-auto text-gray-300 mb-3" size={48} />
                <p className="text-gray-500">لا توجد حجوزات في {monthName}</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {monthBookings.map((b: any) => {
                  const status = statusConfig[b.status] || statusConfig.PENDING_APPROVAL;
                  const eventDate = new Date(b.eventDate || b.date);
                  
                  return (
                    <div key={b.id} className="border border-gray-200 dark:border-gray-700 rounded-2xl p-5 hover:shadow-lg transition">
                      <div className="flex items-start justify-between mb-3">
                        <div className="bg-gradient-to-br from-[#D4AF37] to-[#b8941f] text-[#111] rounded-xl p-3 text-center min-w-[60px]">
                          <p className="text-2xl font-black">{eventDate.getDate()}</p>
                          <p className="text-[10px] font-bold uppercase">{eventDate.toLocaleDateString("ar-EG", { month: "short" })}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${status.bg} ${status.text}`}>
                          {status.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-2">
                        <Clock size={14} className="text-[#D4AF37]" />
                        <span className="font-bold text-sm">{b.eventTime || b.timeSlot || "—"}</span>
                      </div>

                      {b.location && (
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-2">
                          <MapPin size={14} className="text-[#D4AF37]" />
                          <span className="text-sm truncate">{b.location}</span>
                        </div>
                      )}

                      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-1">
                          <User size={14} className="text-gray-400" />
                          <span className="font-bold text-sm">{b.clientName || "—"}</span>
                        </div>
                        {b.clientPhone && (
                          <div className="flex items-center gap-2 text-gray-500 text-xs">
                            <Phone size={12} />
                            <span dir="ltr">{b.clientPhone}</span>
                          </div>
                        )}
                      </div>

                      {b.grossAmount && (
                        <div className="mt-3 text-center">
                          <span className="text-lg font-black text-[#D4AF37]">
                            {Number(b.grossAmount).toLocaleString()} ج.م
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}