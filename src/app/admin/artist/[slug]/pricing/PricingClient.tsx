"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Save, Loader2, MapPin, Printer, Edit3, Trash2, X, Check, AlertCircle } from "lucide-react"

export default function PricingClient({artistId,artistSlug,artistName,regions}:{artistId:string;artistSlug:string;artistName:string;regions:any[]}){
  const router=useRouter()
  const [saving,setSaving]=useState(false)
  const [error,setError]=useState("")
  const [success,setSuccess]=useState("")
  const [editingId,setEditingId]=useState<string|null>(null)
  const [form,setForm]=useState({regionName:"",basePrice:"",travelFee:"0"})

  const handleSubmit=async(e:React.FormEvent)=>{
    e.preventDefault();setSaving(true);setError("")
    try{
      const method=editingId?"PUT":"POST"
      const url=editingId?"/api/artists/"+artistSlug+"/pricing-regions/"+editingId:"/api/artists/"+artistSlug+"/pricing-regions"
      const res=await fetch(url,{method,headers:{"Content-Type":"application/json"},body:JSON.stringify({regionName:form.regionName,basePrice:parseFloat(form.basePrice),travelFee:parseFloat(form.travelFee)||0})})
      if(!res.ok){const d=await res.json();throw new Error(d.error||"فشل")}
      setSuccess(editingId?"تم التحديث ✅":"تم الإضافة ✅");setForm({regionName:"",basePrice:"",travelFee:"0"});setEditingId(null);router.refresh()
      setTimeout(()=>setSuccess(""),3000)
    }catch(err:any){setError(err.message)}finally{setSaving(false)}
  }
  const handleEdit=(r:any)=>{setEditingId(r.id);setForm({regionName:r.regionName,basePrice:String(r.basePrice),travelFee:String(r.travelFee||0)})}
  const handleDelete=async(id:string)=>{if(!confirm("حذف؟"))return;try{await fetch("/api/artists/"+artistSlug+"/pricing-regions/"+id,{method:"DELETE"});router.refresh();setSuccess("تم الحذف ✅");setTimeout(()=>setSuccess(""),3000)}catch(err:any){setError(err.message)}}

  const avg=regions.length>0?Math.round(regions.reduce((s,r)=>s+Number(r.basePrice),0)/regions.length):0

  const handlePrint=()=>{
    const el=document.getElementById("prc-print")
    if(!el)return
    const win=window.open("","_blank","width=800,height=1100")
    if(!win){alert("اسمح بالنوافذ المنبثقة");return}
    win.document.write('<!DOCTYPE html><html dir="rtl"><head><meta charset="UTF-8"><title>أسعار '+artistName+'</title><link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap" rel="stylesheet"><style>*{margin:0;padding:0;box-sizing:border-box;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}body{font-family:Cairo,sans-serif;background:#fff;color:#000;padding:10mm;direction:rtl}@page{margin:10mm;size:A4}.hdr{margin-bottom:30px;padding-bottom:20px;border-bottom:3px solid #D4AF37}.hdr h1{font-size:36px;font-weight:900}.gold{color:#D4AF37}table{width:100%;border-collapse:collapse;margin-top:20px}th{background:#0a0a0a;color:#D4AF37;padding:12px;font-weight:700;font-size:13px}td{padding:12px;border-bottom:1px solid #ddd;font-size:13px}.bold{font-weight:700}.gold-bg{background:#D4AF37;color:#000;font-weight:900;padding:4px 12px;border-radius:6px;display:inline-block}.foot{margin-top:30px;padding-top:15px;border-top:2px solid #D4AF37;text-align:center;font-size:10px;color:#888}</style></head><body>'+el.innerHTML+'</body></html>')
    win.document.close()
    setTimeout(()=>win.print(),600)
  }

  return(
    <div dir="rtl" className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div><div className="badge-gold mb-3">التسعير</div><h1 className="text-3xl font-black text-white flex items-center gap-2"><MapPin size={28} className="text-[#D4AF37]"/> تسعير {artistName}</h1><p className="text-gray-400 text-sm mt-1">{regions.length} منطقة • متوسط: {avg.toLocaleString()} ج.م</p></div>
        <button onClick={handlePrint} disabled={regions.length===0} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#b8941f] text-[#0a0a0a] rounded-xl font-black text-sm hover:shadow-lg transition disabled:opacity-50"><Printer size={16}/> طباعة</button>
      </div>

      {error&&<div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 font-bold flex items-center gap-2"><AlertCircle size={20}/>{error}</div>}
      {success&&<div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-green-400 font-bold flex items-center gap-2"><Check size={20}/>{success}</div>}

      <div className="bg-[#111] rounded-2xl border border-[#D4AF37]/20 overflow-hidden">
        <div className="p-5 border-b border-[#D4AF37]/20"><h2 className="text-xl font-black text-white">مناطق التسعير</h2></div>
        {regions.length===0?<p className="text-gray-500 text-center py-10">لا توجد مناطق مسجلة</p>:(
          <div className="overflow-x-auto"><table className="w-full min-w-[600px]">
            <thead><tr className="border-b border-[#D4AF37]/20 bg-[#0a0a0a]">
              <th className="text-right py-3 px-4 text-xs font-bold text-[#D4AF37] uppercase">المنطقة</th>
              <th className="text-center py-3 px-4 text-xs font-bold text-[#D4AF37] uppercase">السعر الأساسي</th>
              <th className="text-center py-3 px-4 text-xs font-bold text-[#D4AF37] uppercase">رسوم السفر</th>
              <th className="text-center py-3 px-4 text-xs font-bold text-[#D4AF37] uppercase">الإجمالي</th>
              <th className="text-center py-3 px-4 text-xs font-bold text-[#D4AF37] uppercase">إجراءات</th>
            </tr></thead>
            <tbody>{regions.map(r=>(<tr key={r.id} className="border-b border-[#D4AF37]/5 hover:bg-[#1a1a1a]">
              <td className="py-3 px-4 font-bold text-white">{r.regionName}</td>
              <td className="py-3 px-4 text-center text-gray-300">{Number(r.basePrice).toLocaleString()} ج.م</td>
              <td className="py-3 px-4 text-center text-gray-400">{Number(r.travelFee||0).toLocaleString()} ج.م</td>
              <td className="py-3 px-4 text-center font-black text-[#D4AF37]">{(Number(r.basePrice)+Number(r.travelFee||0)).toLocaleString()} ج.م</td>
              <td className="py-3 px-4 text-center"><div className="flex items-center justify-center gap-2"><button onClick={()=>handleEdit(r)} className="p-2 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg text-blue-400 transition"><Edit3 size={14}/></button><button onClick={()=>handleDelete(r.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-400 transition"><Trash2 size={14}/></button></div></td>
            </tr>))}</tbody>
          </table></div>
        )}
      </div>

      <div className="bg-[#111] rounded-2xl border border-[#D4AF37]/20 p-5">
        <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2"><Plus size={18} className="text-[#D4AF37]"/>{editingId?"تعديل المنطقة":"إضافة منطقة جديدة"}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div><label className="block text-xs font-bold text-gray-400 mb-1">اسم المنطقة *</label><input type="text" value={form.regionName} onChange={e=>setForm({...form,regionName:e.target.value})} placeholder="القاهرة" className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#D4AF37]/20 rounded-xl text-white outline-none focus:ring-2 focus:ring-[#D4AF37]" required/></div>
            <div><label className="block text-xs font-bold text-gray-400 mb-1">السعر (ج.م) *</label><input type="number" value={form.basePrice} onChange={e=>setForm({...form,basePrice:e.target.value})} placeholder="5000" className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#D4AF37]/20 rounded-xl text-white outline-none focus:ring-2 focus:ring-[#D4AF37]" required/></div>
            <div><label className="block text-xs font-bold text-gray-400 mb-1">رسوم السفر</label><input type="number" value={form.travelFee} onChange={e=>setForm({...form,travelFee:e.target.value})} placeholder="0" className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#D4AF37]/20 rounded-xl text-white outline-none focus:ring-2 focus:ring-[#D4AF37]"/></div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="flex-1 py-3 bg-gradient-to-r from-[#D4AF37] to-[#b8941f] text-[#0a0a0a] font-black rounded-xl disabled:opacity-50 flex items-center justify-center gap-2">{saving?<><Loader2 size={18} className="animate-spin"/> جاري...</>:<><Save size={18}/> {editingId?"تحديث":"إضافة"}</>}</button>
            {editingId&&<button type="button" onClick={()=>{setEditingId(null);setForm({regionName:"",basePrice:"",travelFee:"0"})}} className="px-6 py-3 bg-[#1a1a1a] border border-[#D4AF37]/20 rounded-xl font-bold text-gray-400 hover:text-white transition"><X size={18}/></button>}
          </div>
        </form>
      </div>

      {/* منطقة الطباعة المخفية */}
      <div id="prc-print" className="hidden">
        <div className="hdr"><h1>Nooryi <span className="gold">Studio</span></h1><p style={{color:"#666",marginTop:"8px"}}>تقرير أسعار المناطق — <strong>{artistName}</strong> — {new Date().toLocaleDateString("ar-EG",{year:"numeric",month:"long",day:"numeric"})}</p></div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"16px",marginBottom:"20px"}}>
          <div style={{background:"#0a0a0a",padding:"20px",borderRadius:"12px",textAlign:"center"}}><p style={{color:"#888",fontSize:"12px"}}>عدد المناطق</p><p style={{color:"#D4AF37",fontSize:"28px",fontWeight:900}}>{regions.length}</p></div>
          <div style={{border:"2px solid #000",padding:"20px",borderRadius:"12px",textAlign:"center"}}><p style={{color:"#888",fontSize:"12px"}}>متوسط السعر</p><p style={{fontSize:"24px",fontWeight:900}}>{avg.toLocaleString()} ج.م</p></div>
          <div style={{border:"2px solid #000",padding:"20px",borderRadius:"12px",textAlign:"center"}}><p style={{color:"#888",fontSize:"12px"}}>العملة</p><p style={{fontSize:"24px",fontWeight:900}}>EGP</p></div>
        </div>
        <table><thead><tr><th style={{textAlign:"right"}}>#</th><th style={{textAlign:"right"}}>المنطقة</th><th style={{textAlign:"center"}}>السعر الأساسي</th><th style={{textAlign:"center"}}>رسوم السفر</th><th style={{textAlign:"center"}}>الإجمالي</th></tr></thead><tbody>
          {regions.map((r,i)=><tr key={r.id}><td style={{color:"#888",fontFamily:"monospace"}}>{String(i+1).padStart(2,"0")}</td><td className="bold">{r.regionName}</td><td style={{textAlign:"center"}}>{Number(r.basePrice).toLocaleString()} ج.م</td><td style={{textAlign:"center"}}>{Number(r.travelFee||0)>0?"+"+Number(r.travelFee).toLocaleString()+" ج.م":"—"}</td><td style={{textAlign:"center"}}><span className="gold-bg">{(Number(r.basePrice)+Number(r.travelFee||0)).toLocaleString()} ج.م</span></td></tr>)}
        </tbody><tfoot><tr style={{background:"#0a0a0a",color:"#D4AF37",fontWeight:900}}><td colSpan={2} style={{textAlign:"right",padding:"12px"}}>المجموع</td><td style={{textAlign:"center",padding:"12px"}}>{regions.reduce((s,r)=>s+Number(r.basePrice),0).toLocaleString()} ج.م</td><td style={{textAlign:"center",padding:"12px"}}>{regions.reduce((s,r)=>s+Number(r.travelFee||0),0).toLocaleString()} ج.م</td><td style={{textAlign:"center",padding:"12px"}}>{regions.reduce((s,r)=>s+Number(r.basePrice)+Number(r.travelFee||0),0).toLocaleString()} ج.م</td></tr></tfoot></table>
        <div className="foot">Nooryi Studio — تقرير أسعار صادر تلقائياً — جميع الحقوق محفوظة</div>
      </div>
    </div>
  )
}