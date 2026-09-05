"use client";
export default function PrintButtons() {
  return (
    <div className="no-print fixed top-4 left-4 z-50 flex gap-2">
      <button onClick={() => window.print()} className="bg-gradient-to-r from-[#D4AF37] to-[#b8941f] text-[#111] font-black px-6 py-3 rounded-xl">🖨️ طباعة</button>
      <button onClick={() => window.history.back()} className="bg-gray-900 text-white font-bold px-6 py-3 rounded-xl">← رجوع</button>
    </div>
  );
}