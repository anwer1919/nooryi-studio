"use client";

import { useState, useEffect } from "react";

export default function DebugAPIsPage() {
  const [artists, setArtists] = useState<any[]>([]);
  const [selectedArtist, setSelectedArtist] = useState("");
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [artistsLoading, setArtistsLoading] = useState(true);
  const [artistsError, setArtistsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArtists = async () => {
      setArtistsLoading(true);
      setArtistsError(null);
      
      try {
        console.log("🔍 Fetching artists...");
        
        // محاولة 1: API عام
        let res = await fetch("/api/artists");
        let text = await res.text();
        console.log("📦 /api/artists response:", text);
        
        let list: any[] = [];
        try {
          const data = JSON.parse(text);
          if (Array.isArray(data)) {
            list = data;
          } else if (data.data && Array.isArray(data.data)) {
            list = data.data;
          }
        } catch {
          console.error("❌ Failed to parse /api/artists");
        }
        
        // إذا فشل، محاولة 2: API أدمن
        if (list.length === 0) {
          console.log("🔍 Trying /api/admin/artists...");
          res = await fetch("/api/admin/artists");
          text = await res.text();
          console.log("📦 /api/admin/artists response:", text);
          
          try {
            const data = JSON.parse(text);
            if (Array.isArray(data)) {
              list = data;
            } else if (data.data && Array.isArray(data.data)) {
              list = data.data;
            }
          } catch {
            console.error("❌ Failed to parse /api/admin/artists");
          }
        }
        
        console.log(`✅ Found ${list.length} artists`);
        
        if (list.length === 0) {
          setArtistsError("لم يتم العثور على أي فنان — راجع Console (F12)");
        }
        
        setArtists(list);
      } catch (err: any) {
        console.error("❌ Error:", err);
        setArtistsError(err.message);
      } finally {
        setArtistsLoading(false);
      }
    };
    
    fetchArtists();
  }, []);

  const testAPIs = async () => {
    if (!selectedArtist) return;
    const artist = artists.find(a => a.id === selectedArtist);
    if (!artist || !artist.slug) {
      alert("الفنان ليس له slug!");
      return;
    }

    setLoading(true);
    const slug = artist.slug;

    try {
      const [artistRes, regionsRes, bookingsRes] = await Promise.all([
        fetch(`/api/artists/${slug}`),
        fetch(`/api/artists/${slug}/pricing-regions`),
        fetch(`/api/artists/${slug}/bookings`),
      ]);

      const [artistData, regionsData, bookingsData] = await Promise.all([
        artistRes.json().catch(() => ({})),
        regionsRes.json().catch(() => []),
        bookingsRes.json().catch(() => []),
      ]);

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

      <div className="bg-white dark:bg-[#111] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
        <label className="block text-sm font-bold mb-2">
          اختر فناناً: ({artists.length} متاح)
        </label>
        
        {artistsLoading ? (
          <p className="text-gray-500">جاري تحميل الفنانين...</p>
        ) : artistsError ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <p className="text-red-700 dark:text-red-300 font-bold">❌ {artistsError}</p>
          </div>
        ) : (
          <>
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
          </>
        )}
      </div>

      {results.slug && (
        <div className="space-y-4">
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