"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Save, Loader2, Banknote, Printer } from "lucide-react"

export default function PricingClient({ artistId, artistSlug, artistName, pricings, regions }: { artistId: string; artistSlug: string; artistName: string; pricings: any[]; regions: any[] }) {
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
      if (res.ok) { setMsg("تم الإضافة بنجاح ✅"); setForm({ name: "", price: "", description: "", duration: "" }); setShow(false); router.refresh() }
      else { const d = await res.json(); setMsg("❌ " + (d.error || "فشل")) }
    } catch { setMsg("❌ خطأ في الاتصال") } finally { setSaving(false) }
  }

  return (
    <div dir="rtl" className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4 no-print">
        <div>
          <div className="badge-gold mb-3">التسعير</div>
          <h1 className="text-4xl font-black text-gray-900">تسعير {artistName}</h1>
          <p className="text-gray-500 mt-1">{pricings.length} باقة • {regions.length} منطقة</p>
        </div>
        <button onClick={()=>window.print()} className="btn-gold"><Printer size={16}/> طباعة</button>
      </div>

      <div className="print-area space-y-6">
        <div className="card-pro p-6">
          <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2"><Banknote size={20} className="text-[#b8941f]"/> الباقات</h2>
          {pricings.length===0 ? <p className="text-gray-400 text-center py-8">لا باقات مسجلة</p> : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">{pricings.map((p:any)=>(
              <div key={p.id} className="bg-gray-50 rounded-xl p-5 border border-gray-200 hover:border-[#D4AF37] transition">
                <h3 className="font-black text-gray-900 text-lg">{p.name}</h3>
                <p className="text-2xl font-black text-[#b8941f] mt-2">{Number(p.price).toLocaleString()} <span className="text-sm text-gray-400">ج.م</span></p>
                {p.description && <p className="text-xs text-gray-500 mt-2">{p.description}</p>}
                {p.duration && <p className="text-xs text-gray-400 mt-1">⏱ {p.duration} دقيقة</p>}
              </div>
            ))}</div>
          )}
        </div>

        {regions.length > 0 && (
          <div className="card-pro p-6">
            <h2 className="text-xl font-black text-gray-900 mb-4">📍 مناطق التسعير</h2>
            <table className="table-pro w-full"><thead><tr>
              <th>المنطقة</th><th>السعر</th><th>السفر</th><th>الإجمالي</th>
            </tr></thead><tbody>{regions.map((r:any)=>(
              <tr key={r.id}>
                <td className="font-bold">{r.regionName}</td>
                <td className="text-center">{Number(r.basePrice).toLocaleString()} ج.م</td>
                <td className="text-center">{Number(r.travelFee||0).toLocaleString()} ج.م</td>
                <td className="text-center font-black text-[#b8941f]">{(Number(r.basePrice)+Number(r.travelFee||0)).toLocaleString()} ج.م</td>
              </tr>
            ))}</tbody></table>
          </div>
        )}
      </div>

      <div className="no-print card-pro overflow-hidden">
        <button onClick={()=>setShow(!show)} className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition">
          <span className="flex items-center gap-2 font-black text-gray-900"><Plus size={20} className="text-[#b8941f]"/> إضافة باقة جديدة</span>
          <span className="text-[#b8941f] text-2xl">{show ? "−" : "+"}</span>
        </button>
        {show && (
          <form onSubmit={handleSubmit} className="p-5 pt-0 space-y-4 border-t border-gray-100">
            {msg && <p className="text-sm font-bold text-center">{msg}</p>}
            <div className="grid md:grid-cols-2 gap-4">
              <div><label className="block text-xs font-bold text-gray-500 mb-1">اسم الباقة *</label><input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] outline-none" placeholder="حفلة زفاف"/></div>
              <div><label className="block text-xs font-bold text-gray-500 mb-1">السعر (ج.م) *</label><input required type="number" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] outline-none" placeholder="5000"/></div>
              <div><label className="block text-xs font-bold text-gray-500 mb-1">المدة (دقيقة)</label><input type="number" value={form.duration} onChange={e=>setForm({...form,duration:e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] outline-none" placeholder="120"/></div>
              <div><label className="block text-xs font-bold text-gray-500 mb-1">الوصف</label><input value={form.description} onChange={e=>setForm({...form,description:e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] outline-none" placeholder="وصف مختصر"/></div>
            </div>
            <button type="submit" disabled={saving} className="w-full py-3 btn-gold disabled:opacity-50 flex items-center justify-center gap-2">{saving?<Loader2 size={18} className="animate-spin"/>:<Save size={18}/>} {saving?"جاري الحفظ...":"حفظ الباقة"}</button>
          </form>
        )}
      </div>
    </div>
  )
}