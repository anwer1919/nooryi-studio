"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { MapPin, Plus, Trash2, Save, Loader2 } from "lucide-react"
import Link from "next/link"

interface PricingRule {
  id: string
  governorate: string | null
  area: string | null
  price: number
}

export default function PricingPage() {
  const params = useParams()
  const slug = params.slug as string
  
  const [rules, setRules] = useState<PricingRule[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newRule, setNewRule] = useState({
    governorate: "",
    area: "",
    price: "",
  })

  useEffect(() => {
    fetch(`/api/admin/artists/${slug}/pricing`)
      .then(res => res.json())
      .then(data => {
        setRules(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setRules([])
        setLoading(false)
      })
  }, [slug])

  const addRule = async () => {
    if (!newRule.governorate || !newRule.price) {
      alert("الرجاء إدخال المحافظة والسعر")
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/admin/artists/${slug}/pricing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          governorate: newRule.governorate,
          area: newRule.area || null,
          price: parseFloat(newRule.price),
        }),
      })

      if (res.ok) {
        const rule = await res.json()
        setRules([...rules, rule])
        setNewRule({ governorate: "", area: "", price: "" })
      }
    } catch (err) {
      alert("فشل إضافة القاعدة")
    } finally {
      setSaving(false)
    }
  }

  const deleteRule = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه القاعدة؟")) return

    try {
      await fetch(`/api/admin/artists/${slug}/pricing/${id}`, { method: "DELETE" })
      setRules(rules.filter(r => r.id !== id))
    } catch (err) {
      alert("فشل الحذف")
    }
  }

  const governorates = [
    "القاهرة", "الجيزة", "الإسكندرية", "الدقهلية", "الشرقية",
    "الغربية", "المنوفية", "البحيرة", "كفر الشيخ", "دمياط",
    "بورسعيد", "الإسماعيلية", "السويس", "شمال سيناء", "جنوب سيناء",
    "الفيوم", "بني سويف", "المنيا", "أسيوط", "سوهاج",
    "قنا", "الأقصر", "أسوان", "البحر الأحمر", "مطروح",
    "الوادي الجديد"
  ]

  if (loading) {
    return <div className="text-center py-20 text-neutral-500">جاري التحميل...</div>
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">إدارة التسعير</h1>
          <p className="text-neutral-400 mt-1">تحديد أسعار الفنان حسب المنطقة</p>
        </div>
        <Link href={`/admin/artists/${slug}/availability`} className="text-yellow-500 hover:text-yellow-400">
          ← العودة للمواعيد
        </Link>
      </div>

      {/* إضافة قاعدة جديدة */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">إضافة سعر لمنطقة جديدة</h2>
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-neutral-300 mb-2">المحافظة *</label>
            <select
              value={newRule.governorate}
              onChange={(e) => setNewRule({...newRule, governorate: e.target.value})}
              className="w-full p-3 bg-black border border-neutral-700 rounded-lg text-white focus:border-yellow-500 outline-none"
            >
              <option value="">اختر المحافظة</option>
              {governorates.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-neutral-300 mb-2">المنطقة (اختياري)</label>
            <input
              type="text"
              value={newRule.area}
              onChange={(e) => setNewRule({...newRule, area: e.target.value})}
              className="w-full p-3 bg-black border border-neutral-700 rounded-lg text-white focus:border-yellow-500 outline-none"
              placeholder="مثال: الزمالك"
            />
          </div>
          <div>
            <label className="block text-sm text-neutral-300 mb-2">السعر (ج.م) *</label>
            <input
              type="number"
              min="5000"
              value={newRule.price}
              onChange={(e) => setNewRule({...newRule, price: e.target.value})}
              className="w-full p-3 bg-black border border-neutral-700 rounded-lg text-white focus:border-yellow-500 outline-none"
              placeholder="10000"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={addRule}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-black font-bold py-3 rounded-lg transition disabled:opacity-50"
            >
              {saving ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />}
              إضافة
            </button>
          </div>
        </div>
      </div>

      {/* قائمة القواعد */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-neutral-800">
          <h2 className="text-lg font-bold text-white">قواعد التسعير الحالية</h2>
        </div>

        {rules.length === 0 ? (
          <div className="p-12 text-center text-neutral-500">
            <MapPin className="mx-auto mb-3 opacity-50" size={48} />
            <p>لا توجد قواعد تسعير بعد</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-800">
            {rules.map(rule => (
              <div key={rule.id} className="p-4 flex items-center justify-between hover:bg-neutral-800/30 transition">
                <div className="flex items-center gap-3">
                  <MapPin size={20} className="text-yellow-500" />
                  <div>
                    <p className="font-bold text-white">
                      {rule.governorate || "جميع المحافظات"}
                      {rule.area && ` - ${rule.area}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-yellow-500 font-bold text-lg">
                    {rule.price.toLocaleString()} ج.م
                  </span>
                  <button
                    onClick={() => deleteRule(rule.id)}
                    className="text-red-400 hover:text-red-300 transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}