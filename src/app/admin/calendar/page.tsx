"use client";

import { useState, useEffect } from "react";
import { Calendar as CalIcon, Music, Clock, MapPin, Printer, User, Phone, ChevronLeft, ChevronRight } from "lucide-react";

export default function AdminCalendarPage() {
  const [artists, setArtists] = useState<any[]>([]);
  const [selectedArtist, setSelectedArtist] = useState("");
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [artistInfo, setArtistInfo] = useState<any>(null);

  useEffect(() => {
    fetch("/api/admin/artists")
      .then(r => r.json())
      .then(d => setArtists(Array.isArray(d) ? d : d.data || []));
  }, []);

  useEffect(() => {
    if (!selectedArtist) {
      setBookings([]);
      setArtistInfo(null);
      return;
    }
    const artist = artists.find((a: any) => a.id === selectedArtist);
    if (!artist) return;
    setArtistInfo(artist);
    setLoading(true);
    fetch(`/api/artists/${artist.slug}/bookings`)
      .then(r => r.json())
      .then(d => setBookings(Array.isArray(d) ? d : d.data || []))
      .finally(() => setLoading(false));
  }, [selectedArtist, artists]);

  // فلترة الحجوزات حسب الشهر الحالي
  const monthBookings = bookings.filter(b => {
    const d = new Date(b.eventDate);
    return d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
  });

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthName = currentDate.toLocaleDateString("ar-EG", { month: "long", year: "numeric" });

  const statusConfig: any = {
    PENDING_APPROVAL: { label: "قيد المراجعة", bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-300" },
    APPROVED: { label: "موافق عليه", bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-300" },
    CONFIRMED: { label: "مؤكد", bg: "bg-green-100", text: "text-green-700", border: "border-green-300" },
    COMPLETED: { label: "مكتمل", bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-300" },
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div dir="rtl" className="space-y-6">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          @page { margin: 1cm; size: A4 landscape; }
        }
      `}</style>

      {/* Header */}
      <div className="no-print">
        <div className="badge-gold mb-3">التقويم</div>
        <h1 className="text-4xl font-black text-gray-900 dark:text-white">تقويم الحجوزات</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">عرض جدول الحجوزات لكل فنان مع إمكانية الطباعة</p>
      </div>

      {/* اختيار الفنان */}
      <div className="card-pro p-6 no-print">
        <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">اختر الفنان</label>
        <select
          value={selectedArtist}
          onChange={(e) => setSelectedArtist(e.target.value)}
          className="input-modern w-full"
        >
          <option value="">— اختر فناناً —</option>
          {artists.map((a: any) => (
            <option key={a.id} value={a.id}>{a.name} — {a.category || "فنان"}</option>
          ))}
        </select>
      </div>

      {/* المحتوى */}
      {!selectedArtist ? (
        <div className="card-pro text-center py-20 no-print">
          <CalIcon className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={56} />
          <p className="text-gray-500 dark:text-gray-400">اختر فناناً لعرض تقويمه</p>
        </div>
      ) : loading ? (
        <div className="card-pro text-center py-20 text-gray-500">جاري التحميل...</div>
      ) : (
        <>
          {/* Printable Report */}
          <div className="print-area bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            {/* Report Header */}
            <div className="bg-gradient-to-r from-[#0a0a0a] to-[#111] p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {artistInfo?.profileImage ? (
                    <img src={artistInfo.profileImage} alt={artistInfo.name} className="w-14 h-14 rounded-xl object-cover" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#b8941f] flex items-center justify-center">
                      <span className="text-[#111] text-2xl font-black">{artistInfo?.name?.charAt(0) || "ف"}</span>
                    </div>
                  )}
                  <div>
                    <h2 className="text-2xl font-black">{artistInfo?.name}</h2>
                    <p className="text-sm text-gray-300">{artistInfo?.category || "فنان"} — تقويم {monthName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">إجمالي الحجوزات</p>
                  <p className="text-3xl font-black text-[#D4AF37]">{monthBookings.length}</p>
                </div>
              </div>
            </div>

            {/* Navigation + Print */}
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between no-print">
              <div className="flex items-center gap-2">
                <button onClick={prevMonth} className="p-2 hover:bg-gray-200 rounded-lg transition">
                  <ChevronRight size={20} />
                </button>
                <h3 className="text-xl font-black text-gray-900 min-w-[200px] text-center">{monthName}</h3>
                <button onClick={nextMonth} className="p-2 hover:bg-gray-200 rounded-lg transition">
                  <ChevronLeft size={20} />
                </button>
              </div>
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#b8941f] text-[#111] font-bold rounded-xl hover:shadow-lg transition"
              >
                <Printer size={16} />
                طباعة
              </button>
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
                    const eventDate = new Date(b.eventDate);
                    
                    return (
                      <div key={b.id} className="bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-700 rounded-2xl p-5 hover:shadow-lg transition">
                        {/* Date + Status */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="bg-gradient-to-br from-[#D4AF37] to-[#b8941f] text-[#111] rounded-xl p-3 text-center min-w-[60px]">
                            <p className="text-2xl font-black">{eventDate.getDate()}</p>
                            <p className="text-[10px] font-bold uppercase">
                              {eventDate.toLocaleDateString("ar-EG", { month: "short" })}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${status.bg} ${status.text} border ${status.border}`}>
                            {status.label}
                          </span>
                        </div>

                        {/* Time */}
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-2">
                          <Clock size={14} className="text-[#D4AF37]" />
                          <span className="font-bold text-sm">{b.eventTime || "—"}</span>
                        </div>

                        {/* Location */}
                        {b.location && (
                          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-2">
                            <MapPin size={14} className="text-[#D4AF37]" />
                            <span className="text-sm truncate">{b.location}</span>
                          </div>
                        )}

                        {/* Client */}
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

                        {/* Amount */}
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

            {/* Footer */}
            <div className="bg-gray-50 p-4 border-t border-gray-200 text-center no-print">
              <p className="text-xs text-gray-500">
                تم إنشاء هذا التقويم تلقائياً — Nooryi Studio © {new Date().getFullYear()}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}