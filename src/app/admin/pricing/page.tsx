import { prisma } from "@/lib/prisma";
import PrintLayout from "@/components/PrintLayout";
export const dynamic = "force-dynamic";
export default async function AllPricingPage() {
  let artists: any[] = [];
  try {
    artists = await prisma.artist.findMany({
      include: { pricing: true, pricingRegions: true, pricingRules: true },
      orderBy: { name: "asc" }
    });
  } catch {}
  return (
    <PrintLayout title="قائمة التسعير الشاملة" docNumber="PRC-ALL" verificationCode="ALL-PRICING">
      {artists.length === 0 ? (<div className="dash-card" style={{textAlign:"center",color:"#777"}}>لا يوجد فنانون</div>) :
        artists.map((a:any) => {
          const prices = a.pricing || [];
          const regions = a.pricingRegions || [];
          return (
            <div key={a.id} className="dash-card" style={{ marginBottom:20, pageBreakInside:"avoid" }}>
              <h3 style={{color:"#D4AF37",marginBottom:10,fontSize:"12pt",fontWeight:800,borderBottom:"1px solid #D4AF37",paddingBottom:6}}>{a.name} — {a.category||""}</h3>
              {prices.length > 0 ? (
                <table className="print-table"><thead><tr><th>الخدمة</th><th>السعر</th><th>المدة</th><th>المحافظة</th></tr></thead>
                <tbody>{prices.map((p:any)=>(<tr key={p.id}><td>{p.name}</td><td style={{fontWeight:700}}>{Number(p.price).toLocaleString()}</td><td>{p.duration||"—"}</td><td>{p.governorate||"—"}</td></tr>))}</tbody></table>
              ) : null}
              {regions.length > 0 ? (
                <table className="print-table" style={{marginTop:8}}><thead><tr><th>المنطقة</th><th>السعر</th><th>رسوم السفر</th></tr></thead>
                <tbody>{regions.map((r:any)=>(<tr key={r.id}><td>{r.regionName}</td><td>{Number(r.basePrice).toLocaleString()}</td><td>{Number(r.travelFee).toLocaleString()}</td></tr>))}</tbody></table>
              ) : null}
              {prices.length === 0 && regions.length === 0 && (<p style={{color:"#999",fontSize:"9pt"}}>لا توجد أسعار</p>)}
            </div>
          );
        })}
    </PrintLayout>
  );
}
