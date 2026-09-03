"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar as CalIcon, Music, Clock, MapPin, Plus } from "lucide-react";

export default function AdminCalendarPage() {
  const [artists, setArtists] = useState<any[]>([]);
  const [selectedArtist, setSelectedArtist] = useState("");
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/artists").then(r => r.json()).then(d => setArtists(Array.isArray(d) ? d : d.data || []));
  }, []);

  useEffect(() => {
    if (!selectedArtist) { setBookings([]); return; }
    const artist = artists.find((a: any) => a.id === selectedArtist);
    if (!artist) return;
    setLoading(true);
    fetch(`/api/artists/${artist.slug}/bookings`).then(r => r.json())
      .then(d => setBookings(Array.isArray(d) ? d : d.data || []))
      .finally(() => setLoading(false));
  }, [selectedArtist, artists]);

  return (
    <div dir="rtl" className="space-y-6">
      <div>
        <div className="badge-gold mb-3">التقويم</div>
        <h1 className="text-4xl font-black text-gray-900">تقويم الحجوزات</h1>
        <p className="text-gray-500 mt-1">عرض جدول الحجوزات لكل فنان</p>
      </div>

      <div className="card-pro p-6">
        <label className="block text-sm font-bold text-gray-800 mb-2">اختر الفنان</label>
        <select
          value={selectedArtist}
          onChange={(e) => setSelectedArtist(e.target.value)}
          className="input-modern"
        >
          <option value="">— اختر فناناً —</option>
          {artists.map((a: any) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
      </div>

      {!selectedArtist ? (
        <div className="card-pro text-center py-20">
          <CalIcon className="mx-auto text-gray-300 mb-4" size={56} />
          <p className="text-gray-500">اختر فناناً لعرض تقويمه</p>
        </div>
      ) : loading ? (
        <div className="card-pro text-center py-20 text-gray-500">جاري التحميل...</div>
      ) : bookings.length === 0 ? (
        <div className="card-pro text-center py-20">
          <CalIcon className="mx-auto text-gray-300 mb-4" size={56} />
          <p className="text-gray-500">لا توجد حجوزات لهذا الفنان</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bookings.map((b: any) => (
            <div key={b.id} className="stat-card">
              <div className="flex items-start justify-between mb-3">
                <span className={`status-chip ${
                  b.status === "CONFIRMED" ? "status-confirmed" :
                  b.status === "PENDING" ? "status-pending" : "status-completed"
                }`}>
                  {b.status === "CONFIRMED" ? "مؤكد" : b.status === "PENDING" ? "قيد الانتظار" : "مكتمل"}
                </span>
                <CalIcon size={18} className="text-[#b8941f]" />
              </div>
              <p className="font-black text-lg text-gray-900 mb-1">
                {new Date(b.eventDate).toLocaleDateString("ar-EG")}
              </p>
              <p className="text-xs text-gray-500 mb-4">{b.eventType || "فعالية"}</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <Clock size={14} className="text-gray-400" />
                  <span>{b.eventTime || "—"}</span>
                </div>
                {b.location && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <MapPin size={14} className="text-gray-400" />
                    <span className="truncate">{b.location}</span>
                  </div>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-[#e8e4d9]">
                <p className="text-xs text-gray-500 mb-1">العميل</p>
                <p className="font-bold text-gray-900 text-sm">{b.clientName || b.user?.name || "—"}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}