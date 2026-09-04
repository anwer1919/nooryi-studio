"use client";

import { useState, useEffect } from "react";

export default function DebugPage() {
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rawResponse, setRawResponse] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log("🔍 Fetching /api/admin/artists...");
        const res = await fetch("/api/admin/artists");
        const text = await res.text();
        setRawResponse(text);
        
        console.log("📦 Raw response:", text);
        
        let data;
        try {
          data = JSON.parse(text);
        } catch {
          setError("فشل تحليل JSON");
          setLoading(false);
          return;
        }
        
        // معالجة جميع الأشكال المحتملة
        let list: any[] = [];
        if (Array.isArray(data)) {
          list = data;
        } else if (data.data && Array.isArray(data.data)) {
          list = data.data;
        } else if (data.artists && Array.isArray(data.artists)) {
          list = data.artists;
        }
        
        console.log("✅ Artists:", list);
        setArtists(list);
      } catch (err: any) {
        console.error("❌ Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  return (
    <div dir="rtl" className="p-6 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-black text-gray-900 dark:text-white">
        🔍 صفحة اختبار API الفنانين
      </h1>
      
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
        <p className="text-sm text-yellow-800 dark:text-yellow-300">
          💡 هذه الصفحة تساعد في تشخيص مشكلة عدم ظهور الفنانين.
          افتح Console (F12) لرؤية الرسائل التفصيلية.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <p className="font-bold text-red-700 dark:text-red-300 mb-2">❌ خطأ:</p>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="bg-white dark:bg-[#111] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="bg-gray-50 dark:bg-[#1a1a1a] px-4 py-3 border-b border-gray-200 dark:border-gray-800">
          <h2 className="font-bold text-gray-900 dark:text-white">الاستجابة الخام (Raw Response)</h2>
        </div>
        <div className="p-4">
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs max-h-64">
            {rawResponse || "جاري التحميل..."}
          </pre>
        </div>
      </div>

      <div className="bg-white dark:bg-[#111] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="bg-gray-50 dark:bg-[#1a1a1a] px-4 py-3 border-b border-gray-200 dark:border-gray-800">
          <h2 className="font-bold text-gray-900 dark:text-white">
            نتيجة التحليل: {loading ? "..." : `${artists.length} فنان`}
          </h2>
        </div>
        <div className="p-4">
          {loading ? (
            <p className="text-gray-500">جاري التحميل...</p>
          ) : artists.length === 0 ? (
            <p className="text-red-500 font-bold">❌ لا يوجد فنانين!</p>
          ) : (
            <div className="space-y-2">
              {artists.map((artist: any, i: number) => (
                <div key={artist.id || i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#1a1a1a] rounded-lg">
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">{artist.name}</p>
                    <p className="text-xs text-gray-500">slug: {artist.slug}</p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-bold">
                    ID: {artist.id?.slice(0, 8)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          <strong>📋 الخطوات التالية:</strong>
        </p>
        <ol className="list-decimal list-inside text-sm text-blue-700 dark:text-blue-400 mt-2 space-y-1">
          <li>إذا ظهر "0 فنان" → أضف فنانين من <code>/admin/artists/new</code></li>
          <li>إذا ظهر "خطأ" → انسخ رسالة الخطأ وأرسلها</li>
          <li>إذا ظهر 5 فنانين → المشكلة في صفحات التسعير/التقويم</li>
        </ol>
      </div>
    </div>
  );
}