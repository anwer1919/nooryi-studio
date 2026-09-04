"use client";

import { useState, useEffect } from "react";

export default function DebugAPIsPage() {
  const [artists, setArtists] = useState<any[]>([]);
  const [selectedArtist, setSelectedArtist] = useState("");
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/artists")
      .then(r => r.json())
      .then(d => {
        const list = Array.isArray(d) ? d : (d.data || []);
        setArtists(list);
      });
  }, []);

  const testAPIs = async () => {
    if (!selectedArtist) return;
    const artist = artists.find(a => a.id === selectedArtist);
    if (!artist) return;

    setLoading(true);
    const slug = artist.slug;

    try {
      // 1) تفاصيل الفنان
      const artistRes = await fetch(`/api/artists/${slug}`);
      const artistData = await artistRes.json();

      // 2) مناطق التسعير
      const regionsRes = await fetch(`/api/artists/${slug}/pricing-regions`);
      const regionsData = await regionsRes.json();

      // 3) الحجوزات
      const bookingsRes = await fetch(`/api/artists/${slug}/bookings`);
      const bookingsData = await bookingsRes.json();

      setResults({
        artist: artistData,
        regions: Array.isArray(regionsData) ? regionsData : (regionsData?.data || []),
        bookings: Array.isArray(bookingsData) ? bookingsData : (bookingsData?.data || []),
        slug: slug,
      });
    } catch (err: any) {
      setResults({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className="p-6 space-y-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-black text-gray-900 dark:text-white">
        🔍 اختبار APIs الفنانين
      </h1>

      {/* اختيار الفنان */}
      <div className="bg-white dark:bg-[#111] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
        <label className="block text-sm font-bold mb-2">اختر فناناً:</label>
        <select
          value={selectedArtist}
          onChange={(e) => setSelectedArtist(e.target.value)}
          className="w-full p-3 border rounded-xl dark:bg-[#1a1a1a] dark:text-white dark:border-gray-700"
        >
          <option value="">— اختر —</option>
          {artists.map(a => (
            <option key={a.id} value={a.id}>
              {a.name} — slug: {a.slug || "❌ لا يوجد"}
            </option>
          ))}
        </select>

        <button
          onClick={testAPIs}
          disabled={!selectedArtist || loading}
          className="mt-4 bg-[#D4AF37] text-[#111] font-black px-6 py-3 rounded-xl disabled:opacity-50"
        >
          {loading ? "جاري الاختبار..." : "اختبر APIs"}
        </button>
      </div>

      {/* النتائج */}
      {results.slug && (
        <div className="space-y-4">
          {/* معلومات الفنان */}
          <div className="bg-white dark:bg-[#111] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <h2 className="font-black text-lg mb-4">1️⃣ تفاصيل الفنان</h2>
            {results.artist?.error ? (
              <p className="text-red-500">❌ {results.artist.error}</p>
            ) : (
              <div className="space-y-2 text-sm">
                <p><strong>ID:</strong> {results.artist?.id}</p>
                <p><strong>Slug:</strong> {results.artist?.slug}</p>
                <p><strong>basePrice:</strong> {results.artist?.basePrice || "غير محدد"}</p>
                <p><strong>minPrice:</strong> {results.artist?.minPrice || "غير محدد"}</p>
              </div>
            )}
          </div>

          {/* مناطق التسعير */}
          <div className="bg-white dark:bg-[#111] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <h2 className="font-black text-lg mb-4">
              2️⃣ مناطق التسعير ({results.regions?.length || 0})
            </h2>
            {results.regions?.length === 0 ? (
              <div className="text-red-500">
                ❌ لا توجد مناطق تسعير!
                <p className="text-sm mt-2">
                  👈 اذهب إلى <code>/admin/pricing</code> وأضف مناطق لهذا الفنان
                </p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 text-right">المنطقة</th>
                    <th className="py-2 text-center">السعر الأساسي</th>
                    <th className="py-2 text-center">رسوم السفر</th>
                    <th className="py-2 text-center">الإجمالي</th>
                  </tr>
                </thead>
                <tbody>
                  {results.regions.map((r: any) => (
                    <tr key={r.id} className="border-b">
                      <td className="py-2">{r.regionName}</td>
                      <td className="py-2 text-center">{Number(r.basePrice).toLocaleString()} ج.م</td>
                      <td className="py-2 text-center">{Number(r.travelFee || 0).toLocaleString()} ج.م</td>
                      <td className="py-2 text-center font-black text-[#D4AF37]">
                        {(Number(r.basePrice) + Number(r.travelFee || 0)).toLocaleString()} ج.م
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* الحجوزات */}
          <div className="bg-white dark:bg-[#111] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <h2 className="font-black text-lg mb-4">
              3️⃣ الحجوزات ({results.bookings?.length || 0})
            </h2>
            {results.bookings?.length === 0 ? (
              <p className="text-gray-500">لا توجد حجوزات نشطة</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 text-right">التاريخ</th>
                    <th className="py-2 text-center">العميل</th>
                    <th className="py-2 text-center">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {results.bookings.map((b: any) => (
                    <tr key={b.id} className="border-b">
                      <td className="py-2">
                        {new Date(b.date || b.eventDate).toLocaleDateString("ar-EG")}
                      </td>
                      <td className="py-2 text-center">{b.clientName}</td>
                      <td className="py-2 text-center">
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}