import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PrintLayout from "@/components/PrintLayout";
export const dynamic = "force-dynamic";
export default async function ArtistPricingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!slug) notFound();
  let artist: any = null;
  try {
    artist = await prisma.artist.findFirst({
      where: { OR: [{ id: slug }, { slug }] },
      include: {
        pricing: { orderBy: { createdAt: "asc" } },
        pricingRegions: { orderBy: { regionName: "asc" } },
        pricingRules: { orderBy: { createdAt: "asc" } },
      }
    });
  } catch {}
  if (!artist) notFound();
  const prices = artist.pricing || [];
  const regions = artist.pricingRegions || [];
  const rules = artist.pricingRules || [];
  return (
    <PrintLayout title={`تسعيرة ${artist.name}`} docNumber={`PRC-${artist.id.slice(0,8).toUpperCase()}`} verificationCode={artist.id}>
      {/* بيانات الفنان */}
      <div className="dash-card">
        <h3 style={{ color:"#D4AF37", marginBottom:10, fontSize:"12pt", fontWeight:800, borderBottom:"1px solid #D4AF37", paddingBottom:6 }}>بيانات الفنان</h3>
        <table className="print-info-table">
          <tr><td>الاسم</td><td>{artist.name}</td></tr>
          <tr><td>التصنيف</td><td>{artist.category||"—"}</td></tr>
          <tr><td>نسبة العمولة</td><td>{artist.commissionRate}%</td></tr>
        </table>
      </div>

      {/* جدول الأسعار الأساسية */}
      {prices.length > 0 && (<>
        <h3 style={{ color:"#000", marginTop:24, marginBottom:10, fontSize:"12pt", fontWeight:800 }}>الأسعار الأساسية</h3>
        <table className="print-table">
          <thead><tr><th>الخدمة</th><th>السعر</th><th>المدة (دقيقة)</th><th>المحافظة</th><th>وصف</th></tr></thead>
          <tbody>{prices.map((p:any) => (
            <tr key={p.id}><td>{p.name}</td><td style={{fontWeight:700}}>{Number(p.price).toLocaleString()}</td><td>{p.duration||"—"}</td><td>{p.governorate||"—"}</td><td>{p.description||"—"}</td></tr>
          ))}</tbody>
        </table>
      </>)}

      {/* جدول المناطق */}
      {regions.length > 0 && (<>
        <h3 style={{ color:"#000", marginTop:24, marginBottom:10, fontSize:"12pt", fontWeight:800 }}>أسعار المناطق والسفر</h3>
        <table className="print-table">
          <thead><tr><th>المنطقة</th><th>السعر الأساسي</th><th>رسوم السفر</th><th>الإجمالي</th></tr></thead>
          <tbody>{regions.map((r:any) => (
            <tr key={r.id}><td>{r.regionName}</td><td>{Number(r.basePrice).toLocaleString()}</td><td>{Number(r.travelFee).toLocaleString()}</td><td style={{fontWeight:700,color:"#D4AF37"}}>{Number(r.basePrice + r.travelFee).toLocaleString()}</td></tr>
          ))}</tbody>
        </table>
      </>)}

      {/* جدول القواعد */}
      {rules.length > 0 && (<>
        <h3 style={{ color:"#000", marginTop:24, marginBottom:10, fontSize:"12pt", fontWeight:800 }}>قواعد التسعير الإضافية</h3>
        <table className="print-table">
          <thead><tr><th>القاعدة</th><th>السعر</th><th>المدة</th><th>المحافظة</th><th>وصف</th></tr></thead>
          <tbody>{rules.map((r:any) => (
            <tr key={r.id}><td>{r.name}</td><td style={{fontWeight:700}}>{Number(r.price).toLocaleString()}</td><td>{r.duration||"—"}</td><td>{r.governorate||"—"}</td><td>{r.description||"—"}</td></tr>
          ))}</tbody>
        </table>
      </>)}

      {prices.length === 0 && regions.length === 0 && rules.length === 0 && (
        <div className="dash-card" style={{ marginTop:20, textAlign:"center", color:"#777" }}>لا توجد أسعار مسجلة لهذا الفنان</div>
      )}
    </PrintLayout>
  );
}
