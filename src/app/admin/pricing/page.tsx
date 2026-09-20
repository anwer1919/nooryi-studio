import { prisma } from "@/lib/prisma";
import PrintLayout from "@/components/PrintLayout";
export const dynamic = "force-dynamic";
export default async function AllPricingPage() {
  let artists: any[] = [];
  try { artists = await prisma.artist.findMany({ include: { pricing: true }, orderBy: { name: "asc" } }); } catch {}
  return (
    <PrintLayout title="قائمة التسعير الشاملة" docNumber="PRC-ALL" verificationCode="ALL-PRICING">
      {artists.length===0?(<div className="dash-card" style={{textAlign:"center",color:"#777"}}>لا يوجد فنانون</div>):
        artists.map((a:any)=>{const prices=Array.isArray(a.pricing)?a.pricing:a.pricing?[a.pricing]:[];
          return(<div key={a.id} className="dash-card" style={{marginBottom:20,pageBreakInside:"avoid"}}>
            <h3 style={{color:"#D4AF37",marginBottom:10,fontSize:"12pt",fontWeight:800,borderBottom:"1px solid #D4AF37",paddingBottom:6}}>{a.name} — {a.category||""}</h3>
            {prices.length>0?(<table className="print-table"><thead><tr><th>البند</th><th>السعر</th><th>المدة</th><th>ملاحظات</th></tr></thead>
              <tbody>{prices.map((p:any,i:number)=>(<tr key={i}><td>{p.title||p.name||"—"}</td><td style={{fontWeight:700}}>{Number(p.price||0).toLocaleString()}</td><td>{p.duration||p.unit||"—"}</td><td>{p.notes||"—"}</td></tr>))}</tbody></table>)
            :(<p style={{color:"#999",fontSize:"9pt"}}>لا توجد أسعار</p>)}
          </div>);})}
    </PrintLayout>
  );
}
