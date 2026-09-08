"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Save, Loader2 } from "lucide-react"

export default function PricingForm({ artistId, artistSlug }: { artistId: string; artistSlug: string }) {
  const router = useRouter()
  const [show, setShow] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: "", price: "", description: "", duration: "" })
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage("")
    try {
      const res = await fetch(`/api/admin/artists/${artistSlug}/pricing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artistId,
          name: form.name,
          price: parseFloat(form.price),
          description: form.description || null,
          duration: form.duration ? parseInt(form.duration) : null,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setMessage("✅ تم إضافة الباقة بنجاح")
        setForm({ name: "", price: "", description: "", duration: "" })
        setShow(false)
        router.refresh()
      } else {
        setMessage("❌ " + (data.error || "فشل الإضافة"))
      }
    } catch {
      setMessage("❌ حدث خطأ")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-[#111] rounded-2xl border border-[#D4AF37]/20 overflow-hidden">
      <button onClick={() => setShow(!show)} className="w-full flex items-center justify-between p-5 hover:bg-[#1a1a1a] transition">
        <span className="flex items-center gap-2 font-black text-white">
          <Plus size={20} className="text-[#D4AF37]" /> إضافة باقة جديدة
        </span>
        <span className="text-[#D4AF37] text-2xl">{show ? "−" : "+"}</span>
      </button>

      {show && (
        <form onSubmit={handleSubmit} className="p-5 pt-0 space-y-4 border-t border-[#D4AF37]/10">
          {message && <p className="text-sm font-bold text-center">{message}</p>}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">اسم الباقة *</label>
              <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="مثال: حفلة زفاف" className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#D4AF37]/20 rounded-xl text-white focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">السعر (ج.م) *</label>
              <input required type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="5000" className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#D4AF37]/20 rounded-xl text-white focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">المدة (دقيقة)</label>
              <input type="number" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} placeholder="120" className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#D4AF37]/20 rounded-xl text-white focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">الوصف</label>
              <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="وصف مختصر للباقة" className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#D4AF37]/20 rounded-xl text-white focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent" />
            </div>
          </div>
          <button type="submit" disabled={saving} className="w-full py-3 bg-gradient-to-r from-[#D4AF37] to-[#b8941f] text-[#111] font-black rounded-xl hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2">
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {saving ? "جاري الحفظ..." : "حفظ الباقة"}
          </button>
        </form>
      )}
    </div>
  )
}