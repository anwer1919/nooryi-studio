import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PrintLayout from "@/components/PrintLayout";
export const dynamic = "force-dynamic";
export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id) notFound();
  let b: any = null;
  try {
    b = await prisma.booking.findUnique({
      where: { id },
      include: { artist: { select: { name: true, category: true } } }
    });
  } catch {}
  if (!b) {
    try { b = await prisma.booking.findFirst({ where: { slug: id }, include: { artist: { select: { name: true, category: true } } } }); } catch {}
  }
  if (!b) notFound();
  const gross = Number(b.grossAmount || 0);
  const deposit = Number(b.depositAmount || 0);
  const remaining = Number(b.remainingAmount || 0);
  const dateStr = b.date ? new Date(b.date).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" }) : "—";
  const sm: Record<string,string> = { PENDING_APPROVAL:"معلق", PENDING:"معلق", CONFIRMED:"مؤكد", COMPLETED:"مكتمل", CANCELLED:"ملغي", REJECTED:"مرفوض" };
  // جلب بيانات المكان
  let venue: any = null;
  try { venue = await prisma.venue.findUnique({ where: { id: b.venueId } }); } catch {}
  return (
    <PrintLayout title="فاتورة حجز" docNumber={`INV-${b.id.slice(0,8).toUpperCase()}`} verificationCode={b.id}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:24 }}>
        <div className="dash-card"><h3 style={{ color:"#D4AF37", marginBottom:10, fontSize:"11pt", fontWeight:800, borderBottom:"1px solid #D4AF37", paddingBottom:6 }}>بيانات العميل</h3>
          <table className="print-info-table"><tr><td>الاسم</td><td>{b.clientName||"—"}</td></tr><tr><td>الهاتف</td><td dir="ltr">{b.clientPhone||"—"}</td></tr><tr><td>البريد</td><td>{b.clientEmail||"—"}</td></tr></table></div>
        <div className="dash-card"><h3 style={{ color:"#D4AF37", marginBottom:10, fontSize:"11pt", fontWeight:800, borderBottom:"1px solid #D4AF37", paddingBottom:6 }}>بيانات الحجز</h3>
          <table className="print-info-table"><tr><td>الفنان</td><td>{b.artist?.name||"—"}</td></tr><tr><td>التصنيف</td><td>{b.artist?.category||"—"}</td></tr><tr><td>المكان</td><td>{venue?.name||"—"}</td></tr><tr><td>العنوان</td><td>{venue?.address||venue?.city||"—"}</td></tr></table></div>
      </div>
      <table className="print-table"><thead><tr><th style={{width:"50%"}}>البند</th><th style={{textAlign:"left"}}>المبلغ (ج.م)</th></tr></thead>
        <tbody><tr><td>المبلغ الإجمالي</td><td style={{textAlign:"left",fontWeight:700}}>{gross.toLocaleString()}</td></tr><tr><td>العربون المدفوع</td><td style={{textAlign:"left",color:"#16a34a"}}>{deposit.toLocaleString()}</td></tr><tr><td>المبلغ المتبقي</td><td style={{textAlign:"left",color:remaining>0?"#dc2626":"#16a34a",fontWeight:800,fontSize:"12pt"}}>{remaining.toLocaleString()}</td></tr></tbody></table>
      <div className="dash-card" style={{marginTop:20}}><h3 style={{color:"#D4AF37",marginBottom:10,fontSize:"11pt",fontWeight:800,borderBottom:"1px solid #D4AF37",paddingBottom:6}}>تفاصيل الحجز</h3>
        <table className="print-info-table"><tr><td>تاريخ الفعالية</td><td>{dateStr}</td></tr><tr><td>وقت الحجز</td><td>{b.timeSlot||"—"}</td></tr><tr><td>الحالة</td><td><span className={`status-badge status-${(b.status||"").toLowerCase()}`}>{sm[b.status]||b.status||"—"}</span></td></tr>{b.adminNotes&&<tr><td>ملاحظات</td><td>{b.adminNotes}</td></tr>}</table></div>
    </PrintLayout>
  );
}
