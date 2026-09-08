"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import QRCode from "react-qr-code"
import { DollarSign, Plus, Trash2, Edit3, Save, X, Loader2, Check, AlertCircle, MapPin, Printer, Shield, Award, Eye } from "lucide-react"

const STUDIO_INFO = { name: "Nooryi Studio", nameAr: "استوديو نوري", tagline: "منصة حجز الفنانين والفعاليات", phone: "+20 100 000 0000", email: "info@noorystudio.com", address: "القاهرة، جمهورية مصر العربية", website: "https://nooryi-studio.vercel.app", licenseNumber: "NS-2026-001" }

export default function ManagerPricingView({ artist, regions, pricings }: { artist: any; regions: any[]; pricings: any[] }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [editingId, setEditingId] = useState<string|null>(null)
  const [form, setForm] = useState({ regionName: "", basePrice: "", travelFee: "0" })
  const [showPrintPreview, setShowPrintPreview] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError("")
    try {
      const method = editingId ? "PUT" : "POST"
      const url = editingId ? `/api/artists/${artist.slug}/pricing-regions/${editingId}` : `/api/artists/${artist.slug}/pricing-regions`
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ regionName: form.regionName, basePrice: parseFloat(form.basePrice), travelFee: parseFloat(form.travelFee)||0 }) })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "فشل") }
      setSuccess(editingId ? "تم التحديث ✅" : "تم الإضافة ✅"); setForm({ regionName: "", basePrice: "", travelFee: "0" }); setEditingId(null); router.refresh()
      setTimeout(() => setSuccess(""), 3000)
    } catch (err: any) { setError(err.message) } finally { setSaving(false) }
  }

  const handleEdit = (r: any) => { setEditingId(r.id); setForm({ regionName: r.regionName, basePrice: String(r.basePrice), travelFee: String(r.travelFee||0) }) }
  const handleDelete = async (id: string) => { if(!confirm("حذف؟")) return; try { await fetch(`/api/artists/${artist.slug}/pricing-regions/${id}`, {method:"DELETE"}); router.refresh(); setSuccess("تم الحذف ✅"); setTimeout(()=>setSuccess(""),3000) } catch(err:any) { setError(err.message) } }
  const handlePrint = () => { setShowPrintPreview(true); setTimeout(() => { window.print(); setTimeout(() => setShowPrintPreview(false), 1000) }, 500) }

  const reportId = `PRC-${Date.now().toString(36).toUpperCase()}`
  const reportDate = new Date().toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })
  const verifyUrl = `${STUDIO_INFO.website}/verify/pricing/${artist.slug}?report=${reportId}`
  const totalRegions = regions.length
  const avgPrice = totalRegions > 0 ? Math.round(regions.reduce((s:number,r:any) => s + Number(r.basePrice), 0) / totalRegions) : 0

  return (
    <>
      <style>{`
        @media print { @page { size: A4; margin: 0; } body * { visibility: hidden; } .print-area, .print-area * { visibility: visible; } .print-area { position: absolute; left: 0; top: 0; width: 210mm; min-height: 297mm; background: white !important; color: black !important; padding: 0; margin: 0; } .no-print { display: none !important; } * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } }
      `}</style>

      <div dir="rtl" className="p-6 space-y-6 max-w-6xl mx-auto">
        <div className="no-print flex items-center justify-between">
          <div><div className="badge-gold mb-3">التسعير</div><h1 className="text-4xl font-black text-gray-900 dark:text-white">أسعار المناطق — {artist.name}</h1></div>
          <div className="flex gap-3">
            <button onClick={() => setShowPrintPreview(true)} disabled={regions.length===0} className="inline-flex items-center gap-2 px-5 py-3 bg-gray-900 text-white font-bold rounded-xl disabled:opacity-50"><Eye size={18}/> معاينة</button>
            <button onClick={handlePrint} disabled={regions.length===0} className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#D4AF37] to-[#b8941f] text-[#111] font-black rounded-xl disabled:opacity-50"><Printer size={18}/> طباعة</button>
          </div>
        </div>

        {error && <div className="no-print bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 font-bold flex items-center gap-2"><AlertCircle size={20}/>{error}</div>}
        {success && <div className="no-print bg-green-50 border border-green-200 rounded-xl p-4 text-green-700 font-bold flex items-center gap-2"><Check size={20}/>{success}</div>}

        {/* Regions Table */}
        <div className="no-print card-pro p-6">
          <h2 className="text-xl font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2"><MapPin size={20} className="text-[#D4AF37]"/> مناطق التسعير</h2>
          {regions.length===0 ? <p className="text-gray-500 text-center py-8">لا توجد مناطق</p> : (
            <table className="w-full"><thead className="bg-gray-50 dark:bg-[#1a1a1a]"><tr>
              <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">المنطقة</th>
              <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">السعر</th>
              <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">السفر</th>
              <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">الإجمالي</th>
              <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">إجراءات</th>
            </tr></thead><tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {regions.map(r=>(<tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-[#1a1a1a]">
                <td className="px-4 py-3 font-bold">{r.regionName}</td>
                <td className="px-4 py-3 text-center font-black">{Number(r.basePrice).toLocaleString()} ج.م</td>
                <td className="px-4 py-3 text-center">{Number(r.travelFee||0).toLocaleString()} ج.م</td>
                <td className="px-4 py-3 text-center font-black text-[#D4AF37]">{(Number(r.basePrice)+Number(r.travelFee||0)).toLocaleString()} ج.م</td>
                <td className="px-4 py-3"><div className="flex items-center justify-center gap-2"><button onClick={()=>handleEdit(r)} className="p-2 bg-blue-50 hover:bg-blue-100 rounded-lg"><Edit3 size={16} className="text-blue-600"/></button><button onClick={()=>handleDelete(r.id)} className="p-2 bg-red-50 hover:bg-red-100 rounded-lg"><Trash2 size={16} className="text-red-600"/></button></div></td>
              </tr>))}
            </tbody></table>
          )}
        </div>

        {/* Add/Edit Form */}
        <div className="no-print card-pro p-6">
          <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Plus size={18} className="text-[#D4AF37]"/>{editingId ? "تعديل المنطقة" : "إضافة منطقة جديدة"}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div><label className="block text-sm font-bold mb-2">اسم المنطقة *</label><input type="text" value={form.regionName} onChange={e=>setForm({...form,regionName:e.target.value})} placeholder="القاهرة" className="w-full px-4 py-3 border rounded-xl dark:bg-[#1a1a1a] dark:border-gray-700 dark:text-white" required/></div>
              <div><label className="block text-sm font-bold mb-2">السعر (ج.م) *</label><input type="number" value={form.basePrice} onChange={e=>setForm({...form,basePrice:e.target.value})} placeholder="5000" className="w-full px-4 py-3 border rounded-xl dark:bg-[#1a1a1a] dark:border-gray-700 dark:text-white" required/></div>
              <div><label className="block text-sm font-bold mb-2">رسوم السفر</label><input type="number" value={form.travelFee} onChange={e=>setForm({...form,travelFee:e.target.value})} placeholder="0" className="w-full px-4 py-3 border rounded-xl dark:bg-[#1a1a1a] dark:border-gray-700 dark:text-white"/></div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="flex-1 bg-gradient-to-r from-[#D4AF37] to-[#b8941f] text-[#111] font-black py-3 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2">{saving?<><Loader2 size={18} className="animate-spin"/> جاري...</>:<><Save size={18}/> {editingId?"تحديث":"إضافة"}</>}</button>
              {editingId && <button type="button" onClick={()=>{setEditingId(null);setForm({regionName:"",basePrice:"",travelFee:"0"})}} className="px-6 py-3 bg-gray-200 dark:bg-gray-700 rounded-xl font-bold"><X size={18}/></button>}
            </div>
          </form>
        </div>

        {/* PRINT AREA — A4 Portrait (نفس تصميم /admin/pricing) */}
        {regions.length > 0 && (
          <div className={`print-area ${showPrintPreview ? '' : 'hidden print:block'}`}>
            <div className="h-3 bg-gradient-to-r from-[#D4AF37] via-[#f4e5b8] to-[#D4AF37]"></div>
            <div className="px-12 pt-10 pb-6 bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] text-white">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-5"><div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#b8941f] flex items-center justify-center shadow-2xl"><span className="text-[#111] text-4xl font-black">N</span></div><div><h1 className="text-4xl font-black">{STUDIO_INFO.nameAr}</h1><p className="text-[#D4AF37] font-bold mt-1">{STUDIO_INFO.name}</p><p className="text-xs text-gray-400 mt-2">{STUDIO_INFO.tagline}</p></div></div>
                <div className="text-right"><div className="inline-block px-4 py-2 bg-[#D4AF37]/20 border border-[#D4AF37] rounded-lg"><p className="text-xs text-[#D4AF37] font-bold">تقرير أسعار</p><p className="text-xs text-gray-300 mt-1 font-mono" dir="ltr">{reportId}</p></div></div>
              </div>
              <div className="mt-8 h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"></div>
            </div>
            <div className="px-12 py-8 bg-[#faf8f0] border-b-4 border-[#D4AF37]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">{artist.profileImage ? <img src={artist.profileImage} alt="" className="w-16 h-16 rounded-2xl object-cover shadow-lg"/> : <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#b8941f] flex items-center justify-center shadow-lg"><span className="text-[#111] text-3xl font-black">{artist.name.charAt(0)}</span></div>}<div><p className="text-xs text-gray-500 font-bold uppercase">أسعار</p><h2 className="text-3xl font-black text-gray-900">{artist.name}</h2><p className="text-sm text-gray-600 mt-1">{artist.category||"فنان"}</p></div></div>
                <div className="text-left"><p className="text-xs text-gray-500">تاريخ الإصدار</p><p className="text-sm font-bold text-gray-900 mt-1">{reportDate}</p></div>
              </div>
            </div>
            <div className="px-12 py-8"><div className="grid grid-cols-3 gap-4">
              <div className="border-2 border-[#D4AF37] rounded-2xl p-5 bg-gradient-to-br from-[#D4AF37]/5 to-transparent"><p className="text-xs text-gray-600 font-bold uppercase mb-2">عدد المناطق</p><p className="text-4xl font-black text-gray-900">{totalRegions}</p></div>
              <div className="border-2 border-gray-200 rounded-2xl p-5 bg-white"><p className="text-xs text-gray-600 font-bold uppercase mb-2">متوسط السعر</p><p className="text-3xl font-black text-[#D4AF37]">{avgPrice.toLocaleString()}</p><p className="text-xs text-gray-500 mt-1">جنيه مصري</p></div>
              <div className="border-2 border-gray-200 rounded-2xl p-5 bg-white"><p className="text-xs text-gray-600 font-bold uppercase mb-2">العملة</p><p className="text-3xl font-black text-gray-900">EGP</p></div>
            </div></div>
            <div className="px-12 pb-8">
              <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2"><div className="w-1 h-6 bg-[#D4AF37] rounded"></div>تفاصيل الأسعار حسب المنطقة</h3>
              <table className="w-full border-collapse"><thead><tr className="bg-[#0a0a0a] text-white">
                <th className="px-4 py-4 text-right text-sm font-bold">#</th><th className="px-4 py-4 text-right text-sm font-bold">المنطقة</th><th className="px-4 py-4 text-center text-sm font-bold">السعر الأساسي</th><th className="px-4 py-4 text-center text-sm font-bold">رسوم السفر</th><th className="px-4 py-4 text-center text-sm font-bold">الإجمالي</th>
              </tr></thead><tbody>{regions.map((r:any,i:number)=>{const total=Number(r.basePrice)+Number(r.travelFee||0);return(<tr key={r.id} className={`border-b border-gray-200 ${i%2===0?'bg-white':'bg-gray-50'}`}><td className="px-4 py-4 text-sm text-gray-500 font-mono">{String(i+1).padStart(2,'0')}</td><td className="px-4 py-4"><div className="flex items-center gap-2"><MapPin size={16} className="text-[#D4AF37]"/><span className="font-black text-gray-900">{r.regionName}</span></div></td><td className="px-4 py-4 text-center font-bold">{Number(r.basePrice).toLocaleString()} ج.م</td><td className="px-4 py-4 text-center text-gray-700">{Number(r.travelFee||0)>0?`+${Number(r.travelFee).toLocaleString()} ج.م`:"—"}</td><td className="px-4 py-4 text-center"><span className="inline-block px-4 py-1 bg-[#D4AF37] text-[#111] font-black rounded-lg">{total.toLocaleString()} ج.م</span></td></tr>)})}</tbody>
              <tfoot><tr className="bg-[#1a1a1a] text-white font-black"><td colSpan={2} className="px-4 py-4 text-right">المجموع</td><td className="px-4 py-4 text-center">{regions.reduce((s:number,r:any)=>s+Number(r.basePrice),0).toLocaleString()} ج.م</td><td className="px-4 py-4 text-center">{regions.reduce((s:number,r:any)=>s+Number(r.travelFee||0),0).toLocaleString()} ج.م</td><td className="px-4 py-4 text-center text-[#D4AF37]">{regions.reduce((s:number,r:any)=>s+Number(r.basePrice)+Number(r.travelFee||0),0).toLocaleString()} ج.م</td></tr></tfoot></table>
            </div>
            <div className="px-12 py-6 bg-[#faf8f0] border-t border-b border-gray-200"><h4 className="text-sm font-black text-gray-900 mb-3 flex items-center gap-2"><Shield size={16} className="text-[#D4AF37]"/>الشروط والملاحظات</h4><ul className="space-y-1 text-xs text-gray-700"><li>• الأسعار قابلة للتغيير دون إشعار مسبق.</li><li>• رسوم السفر تُضاف تلقائياً حسب منطقة الفعالية.</li><li>• يمكن التحقق بمسح رمز QR أدناه.</li><li>• هذا التقرير صادر رسمياً من {STUDIO_INFO.nameAr}.</li></ul></div>
            <div className="px-12 py-10 bg-gradient-to-b from-white to-[#faf8f0]">
              <div className="grid grid-cols-3 gap-8 items-center">
                <div className="text-right"><p className="text-xs font-bold uppercase mb-2">تواصل معنا</p><div className="space-y-1 text-xs text-gray-700"><p>{STUDIO_INFO.phone}</p><p>{STUDIO_INFO.email}</p><p>{STUDIO_INFO.address}</p><p dir="ltr" className="font-mono text-[#D4AF37]">{STUDIO_INFO.website.replace("https://","")}</p></div></div>
                <div className="flex flex-col items-center justify-center"><div className="relative"><div className="w-32 h-32 rounded-full border-4 border-[#D4AF37] flex items-center justify-center" style={{transform:'rotate(-15deg)',boxShadow:'inset 0 0 0 2px #D4AF37, 0 0 0 2px #D4AF37'}}><div className="text-center"><p className="text-[8px] font-bold text-[#D4AF37] uppercase tracking-widest">{STUDIO_INFO.name}</p><p className="text-xs font-black text-[#D4AF37] my-1">✦ معتمد ✦</p><p className="text-[10px] font-black text-[#D4AF37]">APPROVED</p></div></div><div className="absolute inset-0 rounded-full border-2 border-[#D4AF37]" style={{transform:'rotate(-15deg) scale(1.15)',opacity:0.5}}></div></div><p className="text-[10px] text-gray-500 mt-3 font-bold uppercase">ختم المنصة الرسمي</p></div>
                <div className="flex flex-col items-center"><div className="bg-white p-3 rounded-xl border-2 border-[#D4AF37] shadow-lg"><QRCode value={verifyUrl} size={100} level="H" bgColor="#FFFFFF" fgColor="#0a0a0a"/></div><p className="text-[10px] text-gray-500 mt-2 font-bold uppercase text-center">امسح للتحقق</p></div>
              </div>
              <div className="mt-8 h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"></div>
              <p className="mt-4 text-[10px] text-gray-500 text-center">© {new Date().getFullYear()} {STUDIO_INFO.name} — جميع الحقوق محفوظة | ترخيص <span className="font-mono">{STUDIO_INFO.licenseNumber}</span></p>
            </div>
            <div className="h-3 bg-gradient-to-r from-[#D4AF37] via-[#f4e5b8] to-[#D4AF37]"></div>
          </div>
        )}
      </div>
    </>
  )
}