"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Save, Loader2, Banknote } from "lucide-react"

export default function PricingClient({ artistId, artistSlug, pricings, regions }: { artistId: string; artistSlug: string; pricings: any[]; regions: any[] }) {
  const router = useRouter()
  const [show, setShow] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: "", price: "", description: "", duration: "" })
  const [msg, setMsg] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setMsg("")
    try {
      const res = await fetch("/api/admin/artists/" + artistSlug + "/pricing", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artistId, name: form.name, price: parseFloat(form.price), description: form.description || null, duration: form.duration ? parseInt(form.duration) : null }),
      })
      if (res.ok) { setMsg("✅ تم إضافة الباقة"); setForm({ name: "", price: "", description: "", duration: "" }); setShow(false); router.refresh() }
      else { const d = await res.json(); setMsg("❌ " + (d.error || "فشل")) }
    } catch { setMsg("❌ خطأ") } finally { setSaving(false) }
  }

  return (
    <div className="print-area space-y-6">
      {/* الباقات */}
      <div className="bg-[#111] rounded-2xl p-6 border border-[#D4AF37]/20">
        <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2"><Banknote size={20} className="text-[#D4AF37]" /> الباقات</h2>
        {pricings.length === 0 ? <p className="text-gray-500 text-center py-8">لا توجد باقات</p> : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pricings.map((p: any) => (
              <div key={p.id} className="bg-[#1a1a1a] rounded-xl p-5 border border-[#D4AF37]/10">
                <h3 className="font-black text-white text-lg">{p.name}</h3>
                <p className="text-2xl font-black text-[#D4AF37] mt-2">{Number(p.price).toLocaleString()} <span className="text-sm text-gray-400">ج.م</span></p>
                {p.description && <p className="text-xs text-gray-400 mt-2">{p.description}</p>}
                {p.duration && <p className="text-xs text-gray-500 mt-1">⏱ {p.duration} دقيقة</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* المناطق */}
      {regions.length > 0 && (
        <div className="bg-[#111] rounded-2xl p-6 border border-[#D4AF37]/20">
          <h2 className="text-xl font-black text-white mb-4">📍 مناطق التسعير</h2>
          <table className="w-full"><thead><tr className="border-b border-[#D4AF37]/20">
            <th className="text-right py-3 px-4 text-xs font-bold text-[#D4AF37]">المنطقة</th>
            <th className="text-center py-3 px-4 text-xs font-bold text-[#D4AF37]">السعر</th>
            <th className="text-center py-3 px-4 text-xs font-bold text-[#D4AF37]">السفر</th>
            <th className="text-center py-3 px-4 text-xs font-bold text-[#D4AF37]">الإجمالي</th>
          </tr></thead><tbody>
            {regions.map((r: any) => (
              <tr key={r.id} className="border-b border-[#D4AF37]/5"><td className="py-3 px-4 font-bold text-white">{r.regionName}</td>
                <td className="py-3 px-4 text-center text-gray-300">{Number(r.basePrice).toLocaleString()}</td>
                <td className="py-3 px-4 text-center text-gray-400">{Number(r.travelFee||0).toLocaleString()}</td>
                <td className="py-3 px-4 text-center font-black text-[#D4AF37]">{(Number(r.basePrice)+Number(r.travelFee||0)).toLocaleString()}</td>
              </tr>
            ))}
          </tbody></table>
        </div>
      )}

      {/* إضافة باقة */}
      <div className="no-print bg-[#111] rounded-2xl border border-[#D4AF37]/20 overflow-hidden">
        <button onClick={() => setShow(!show)} className="w-full flex items-center justify-between p-5 hover:bg-[#1a1a1a] transition">
          <span className="flex items-center gap-2 font-black text-white"><Plus size={20} className="text-[#D4AF37]" /> إضافة باقة</span>
          <span className="text-[#D4AF37] text-2xl">{show ? "−" : "+"}</span>
        </button>
        {show && (
          <form onSubmit={handleSubmit} className="p-5 pt-0 space-y-4 border-t border-[#D4AF37]/10">
            {msg && <p className="text-sm font-bold text-center">{msg}</p>}
            <div className="grid md:grid-cols-2 gap-4">
              <div><label className="block text-xs font-bold text-gray-400 mb-1">اسم الباقة *</label><input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#D4AF37]/20 rounded-xl text-white focus:ring-2 focus:ring-[#D4AF37]" placeholder="حفلة زفاف" /></div>
              <div><label className="block text-xs font-bold text-gray-400 mb-1">السعر *</label><input required type="number" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#D4AF37]/20 rounded-xl text-white focus:ring-2 focus:ring-[#D4AF37]" placeholder="5000" /></div>
              <div><label className="block text-xs font-bold text-gray-400 mb-1">المدة (دقيقة)</label><input type="number" value={form.duration} onChange={e=>setForm({...form,duration:e.target.value})} className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#D4AF37]/20 rounded-xl text-white focus:ring-2 focus:ring-[#D4AF37]" placeholder="120" /></div>
              <div><label className="block text-xs font-bold text-gray-400 mb-1">الوصف</label><input value={form.description} onChange={e=>setForm({...form,description:e.target.value})} className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#D4AF37]/20 rounded-xl text-white focus:ring-2 focus:ring-[#D4AF37]" placeholder="وصف مختصر" /></div>
            </div>
            <button type="submit" disabled={saving} className="w-full py-3 bg-gradient-to-r from-[#D4AF37] to-[#b8941f] text-[#111] font-black rounded-xl disabled:opacity-50 flex items-center justify-center gap-2">{saving ? <Loader2 size={18} className="animate-spin"/> : <Save size={18}/>} {saving ? "جاري الحفظ..." : "حفظ"}</button>
          </form>
        )}
      </div>
    </div>
  )
}