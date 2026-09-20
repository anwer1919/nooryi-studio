"use client";
import { useState } from "react";
import Link from "next/link";
import { Plus, Trash2, Printer, ArrowRight, DollarSign, MapPin, Settings2, X, Check } from "lucide-react";
import PrintLayout from "@/components/PrintLayout";

export default function PricingManager({ artist }: { artist: any }) {
  const [prices, setPrices] = useState(artist.pricing || []);
  const [regions, setRegions] = useState(artist.pricingRegions || []);
  const [rules] = useState(artist.pricingRules || []);
  const [showAddPrice, setShowAddPrice] = useState(false);
  const [showAddRegion, setShowAddRegion] = useState(false);
  const [loading, setLoading] = useState(false);
  const [printMode, setPrintMode] = useState(false);

  // نماذج الإدخال
  const [newPrice, setNewPrice] = useState({ name: "", price: "", duration: "", governorate: "", description: "" });
  const [newRegion, setNewRegion] = useState({ regionName: "", basePrice: "", travelFee: "" });

  // ═══ إضافة خدمة ═══
  const handleAddPrice = async () => {
    if (!newPrice.name || !newPrice.price) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artistId: artist.id, ...newPrice })
      });
      if (res.ok) {
        const created = await res.json();
        setPrices([...prices, created]);
        setNewPrice({ name: "", price: "", duration: "", governorate: "", description: "" });
        setShowAddPrice(false);
      }
    } catch {} finally { setLoading(false); }
  };

  // ═══ حذف خدمة ═══
  const handleDeletePrice = async (id: string) => {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    try {
      const res = await fetch(`/api/admin/pricing?id=${id}`, { method: "DELETE" });
      if (res.ok) setPrices(prices.filter((p: any) => p.id !== id));
    } catch {}
  };

  // ═══ إضافة منطقة ═══
  const handleAddRegion = async () => {
    if (!newRegion.regionName || !newRegion.basePrice) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/pricing-region", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artistId: artist.id, ...newRegion })
      });
      if (res.ok) {
        const created = await res.json();
        setRegions([...regions, created]);
        setNewRegion({ regionName: "", basePrice: "", travelFee: "" });
        setShowAddRegion(false);
      }
    } catch {} finally { setLoading(false); }
  };

  // ═══ حذف منطقة ═══
  const handleDeleteRegion = async (id: string) => {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    try {
      const res = await fetch(`/api/admin/pricing-region?id=${id}`, { method: "DELETE" });
      if (res.ok) setRegions(regions.filter((r: any) => r.id !== id));
    } catch {}
  };

  // ═══ وضع الطباعة ═══
  if (printMode) {
    return (
      <div>
        <button onClick={() => setPrintMode(false)} className="no-print mb-4 flex items-center gap-2 text-sm text-[var(--c-muted)] hover:text-[var(--c-orange)] transition">
          <ArrowRight size={16} /> العودة للتحرير
        </button>
        <PrintLayout title={`تسعيرة ${artist.name}`} docNumber={`PRC-${artist.id.slice(0,8).toUpperCase()}`} verificationCode={artist.id}>
          <div className="dash-card">
            <h3 style={{ color:"#D4AF37", marginBottom:10, fontSize:"12pt", fontWeight:800, borderBottom:"1px solid #D4AF37", paddingBottom:6 }}>بيانات الفنان</h3>
            <table className="print-info-table"><tr><td>الاسم</td><td>{artist.name}</td></tr><tr><td>التصنيف</td><td>{artist.category||"—"}</td></tr><tr><td>نسبة العمولة</td><td>{artist.commissionRate}%</td></tr></table>
          </div>
          {prices.length > 0 && (<><h3 style={{ color:"#000", marginTop:24, marginBottom:10, fontSize:"12pt", fontWeight:800 }}>الأسعار الأساسية</h3>
            <table className="print-table"><thead><tr><th>الخدمة</th><th>السعر</th><th>المدة</th><th>المحافظة</th><th>وصف</th></tr></thead>
            <tbody>{prices.map((p:any)=><tr key={p.id}><td>{p.name}</td><td style={{fontWeight:700}}>{Number(p.price).toLocaleString()}</td><td>{p.duration||"—"}</td><td>{p.governorate||"—"}</td><td>{p.description||"—"}</td></tr>)}</tbody></table></>)}
          {regions.length > 0 && (<><h3 style={{ color:"#000", marginTop:24, marginBottom:10, fontSize:"12pt", fontWeight:800 }}>أسعار المناطق والسفر</h3>
            <table className="print-table"><thead><tr><th>المنطقة</th><th>السعر الأساسي</th><th>رسوم السفر</th><th>الإجمالي</th></tr></thead>
            <tbody>{regions.map((r:any)=><tr key={r.id}><td>{r.regionName}</td><td>{Number(r.basePrice).toLocaleString()}</td><td>{Number(r.travelFee).toLocaleString()}</td><td style={{fontWeight:700,color:"#D4AF37"}}>{Number(r.basePrice+r.travelFee).toLocaleString()}</td></tr>)}</tbody></table></>)}
          {rules.length > 0 && (<><h3 style={{ color:"#000", marginTop:24, marginBottom:10, fontSize:"12pt", fontWeight:800 }}>قواعد التسعير الإضافية</h3>
            <table className="print-table"><thead><tr><th>القاعدة</th><th>السعر</th><th>المدة</th><th>المحافظة</th><th>وصف</th></tr></thead>
            <tbody>{rules.map((r:any)=><tr key={r.id}><td>{r.name}</td><td style={{fontWeight:700}}>{Number(r.price).toLocaleString()}</td><td>{r.duration||"—"}</td><td>{r.governorate||"—"}</td><td>{r.description||"—"}</td></tr>)}</tbody></table></>)}
          {prices.length===0 && regions.length===0 && rules.length===0 && (<div className="dash-card" style={{marginTop:20,textAlign:"center",color:"#777"}}>لا توجد أسعار مسجلة</div>)}
        </PrintLayout>
      </div>
    );
  }

  // ═══ وضع التحرير ═══
  return (
    <div dir="rtl" className="space-y-6 pb-24 md:pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="badge-gold mb-2">إدارة التسعير</div>
          <h1 className="text-display">{artist.name}</h1>
          <p className="text-[var(--c-muted)] mt-1">إدارة الأسعار والمناطق وقواعد التسعير</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <Link href={`/admin/artist/${artist.slug}`} className="btn-outline text-sm flex items-center gap-2"><ArrowRight size={16} /> عودة</Link>
          <button onClick={() => window.print()} className="btn-outline text-sm flex items-center gap-2"><Printer size={16} /> طباعة مباشرة</button>
          <button onClick={() => setPrintMode(true)} className="btn-primary text-sm flex items-center gap-2"><DollarSign size={16} /> معاينة الطباعة</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="dash-card text-center"><p className="card-title text-2xl text-[var(--c-orange)]">{prices.length}</p><p className="text-xs text-[var(--c-muted)]">خدمات أساسية</p></div>
        <div className="dash-card text-center"><p className="card-title text-2xl text-[var(--c-orange)]">{regions.length}</p><p className="text-xs text-[var(--c-muted)]">مناطق سفر</p></div>
        <div className="dash-card text-center"><p className="card-title text-2xl text-[var(--c-orange)]">{rules.length}</p><p className="text-xs text-[var(--c-muted)]">قواعد إضافية</p></div>
      </div>

      {/* ═══ الأسعار الأساسية ═══ */}
      <div className="dash-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="card-title flex items-center gap-2"><DollarSign size={18} className="text-[var(--c-orange)]" /> الأسعار الأساسية</h3>
          <button onClick={() => setShowAddPrice(!showAddPrice)} className="btn-primary text-xs flex items-center gap-1"><Plus size={14} /> إضافة خدمة</button>
        </div>

        {/* نموذج الإضافة */}
        {showAddPrice && (
          <div className="mb-4 p-4 rounded-xl bg-[var(--c-bg)] border border-[var(--c-orange)]/30 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input placeholder="اسم الخدمة *" value={newPrice.name} onChange={e => setNewPrice({...newPrice, name: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-fg)] text-sm" />
              <input placeholder="السعر *" type="number" value={newPrice.price} onChange={e => setNewPrice({...newPrice, price: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-fg)] text-sm" />
              <input placeholder="المدة (دقائق)" type="number" value={newPrice.duration} onChange={e => setNewPrice({...newPrice, duration: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-fg)] text-sm" />
              <input placeholder="المحافظة" value={newPrice.governorate} onChange={e => setNewPrice({...newPrice, governorate: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-fg)] text-sm" />
            </div>
            <input placeholder="وصف (اختياري)" value={newPrice.description} onChange={e => setNewPrice({...newPrice, description: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-fg)] text-sm" />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowAddPrice(false)} className="btn-outline text-xs px-4 py-2">إلغاء</button>
              <button onClick={handleAddPrice} disabled={loading || !newPrice.name || !newPrice.price} className="btn-primary text-xs px-4 py-2 flex items-center gap-1 disabled:opacity-50">{loading ? "جاري..." : <><Check size={14} /> حفظ</>}</button>
            </div>
          </div>
        )}

        {prices.length === 0 && !showAddPrice ? (
          <div className="text-center py-8 text-[var(--c-muted)] text-sm border-2 border-dashed border-[var(--c-border)] rounded-xl cursor-pointer hover:border-[var(--c-orange)] transition" onClick={() => setShowAddPrice(true)}>لا توجد خدمات. اضغط هنا للإضافة.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-[var(--c-border)]"><th className="text-right py-3 px-2 font-bold text-[var(--c-muted)]">الخدمة</th><th className="text-right py-3 px-2 font-bold text-[var(--c-muted)]">السعر</th><th className="text-right py-3 px-2 font-bold text-[var(--c-muted)]">المدة</th><th className="text-right py-3 px-2 font-bold text-[var(--c-muted)]">المحافظة</th><th className="text-left py-3 px-2 font-bold text-[var(--c-muted)]">إجراءات</th></tr></thead>
              <tbody>{prices.map((p:any) => (
                <tr key={p.id} className="border-b border-[var(--c-border)]/50 hover:bg-[var(--c-orange-dim)]/30 transition">
                  <td className="py-3 px-2 font-medium text-[var(--c-fg)]">{p.name}</td>
                  <td className="py-3 px-2 font-bold text-[var(--c-orange)]">{Number(p.price).toLocaleString()} ج.م</td>
                  <td className="py-3 px-2 text-[var(--c-muted)]">{p.duration ? `${p.duration} دقيقة` : "—"}</td>
                  <td className="py-3 px-2 text-[var(--c-muted)]">{p.governorate || "—"}</td>
                  <td className="py-3 px-2 text-left"><button onClick={() => handleDeletePrice(p.id)} className="text-red-400 hover:text-red-500 p-1"><Trash2 size={16} /></button></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </div>

      {/* ═══ مناطق السفر ═══ */}
      <div className="dash-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="card-title flex items-center gap-2"><MapPin size={18} className="text-[var(--c-orange)]" /> مناطق السفر</h3>
          <button onClick={() => setShowAddRegion(!showAddRegion)} className="btn-primary text-xs flex items-center gap-1"><Plus size={14} /> إضافة منطقة</button>
        </div>

        {showAddRegion && (
          <div className="mb-4 p-4 rounded-xl bg-[var(--c-bg)] border border-[var(--c-orange)]/30 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input placeholder="اسم المنطقة *" value={newRegion.regionName} onChange={e => setNewRegion({...newRegion, regionName: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-fg)] text-sm" />
              <input placeholder="السعر الأساسي *" type="number" value={newRegion.basePrice} onChange={e => setNewRegion({...newRegion, basePrice: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-fg)] text-sm" />
              <input placeholder="رسوم السفر" type="number" value={newRegion.travelFee} onChange={e => setNewRegion({...newRegion, travelFee: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-fg)] text-sm" />
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowAddRegion(false)} className="btn-outline text-xs px-4 py-2">إلغاء</button>
              <button onClick={handleAddRegion} disabled={loading || !newRegion.regionName || !newRegion.basePrice} className="btn-primary text-xs px-4 py-2 flex items-center gap-1 disabled:opacity-50">{loading ? "جاري..." : <><Check size={14} /> حفظ</>}</button>
            </div>
          </div>
        )}

        {regions.length === 0 && !showAddRegion ? (
          <div className="text-center py-8 text-[var(--c-muted)] text-sm border-2 border-dashed border-[var(--c-border)] rounded-xl cursor-pointer hover:border-[var(--c-orange)] transition" onClick={() => setShowAddRegion(true)}>لا توجد مناطق. اضغط هنا للإضافة.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {regions.map((r:any) => (
              <div key={r.id} className="p-4 rounded-xl bg-[var(--c-bg)] border border-[var(--c-border)] hover:border-[var(--c-orange)] transition group relative">
                <button onClick={() => handleDeleteRegion(r.id)} className="absolute top-2 left-2 text-red-400 opacity-0 group-hover:opacity-100 transition"><Trash2 size={14} /></button>
                <p className="font-bold text-[var(--c-fg)] mb-2">{r.regionName}</p>
                <div className="flex justify-between text-xs text-[var(--c-muted)]"><span>السعر: <strong className="text-[var(--c-fg)]">{Number(r.basePrice).toLocaleString()}</strong></span><span>السفر: <strong className="text-[var(--c-fg)]">{Number(r.travelFee).toLocaleString()}</strong></span></div>
                <div className="mt-2 pt-2 border-t border-[var(--c-border)] text-xs font-bold text-[var(--c-orange)]">الإجمالي: {Number(r.basePrice + r.travelFee).toLocaleString()} ج.م</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ═══ قواعد التسعير ═══ */}
      <div className="dash-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="card-title flex items-center gap-2"><Settings2 size={18} className="text-[var(--c-orange)]" /> قواعد التسعير الإضافية</h3>
        </div>
        {rules.length === 0 ? (
          <div className="text-center py-8 text-[var(--c-muted)] text-sm border-2 border-dashed border-[var(--c-border)] rounded-xl">لا توجد قواعد إضافية.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-[var(--c-border)]"><th className="text-right py-3 px-2 font-bold text-[var(--c-muted)]">القاعدة</th><th className="text-right py-3 px-2 font-bold text-[var(--c-muted)]">السعر</th><th className="text-right py-3 px-2 font-bold text-[var(--c-muted)]">المدة</th><th className="text-right py-3 px-2 font-bold text-[var(--c-muted)]">المحافظة</th></tr></thead>
              <tbody>{rules.map((r:any) => (
                <tr key={r.id} className="border-b border-[var(--c-border)]/50 hover:bg-[var(--c-orange-dim)]/30 transition">
                  <td className="py-3 px-2 font-medium text-[var(--c-fg)]">{r.name}</td>
                  <td className="py-3 px-2 font-bold text-[var(--c-orange)]">{Number(r.price).toLocaleString()} ج.م</td>
                  <td className="py-3 px-2 text-[var(--c-muted)]">{r.duration ? `${r.duration} دقيقة` : "—"}</td>
                  <td className="py-3 px-2 text-[var(--c-muted)]">{r.governorate || "—"}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
