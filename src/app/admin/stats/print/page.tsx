import { prisma } from "@/lib/prisma";
import PrintLayout from "@/components/PrintLayout";
export const dynamic = "force-dynamic";
export default async function StatsPrintPage() {
  let tb = 0, cf = 0, pd = 0, cn = 0, rv = 0, dp = 0, rm = 0, ta = 0;
  try { const bs = await prisma.booking.findMany({ select: { status: true, grossAmount: true, depositAmount: true, remainingAmount: true, totalPrice: true, deposit: true, remaining: true } });
    tb = bs.length; cf = bs.filter(b => b.status === "CONFIRMED" || b.status === "COMPLETED").length;
    pd = bs.filter(b => b.status === "PENDING").length; cn = bs.filter(b => b.status === "CANCELLED" || b.status === "REJECTED").length;
    bs.forEach(b => { rv += Number(b.grossAmount || b.totalPrice || 0); dp += Number(b.depositAmount || b.deposit || 0); rm += Number(b.remainingAmount || b.remaining || 0); });
    ta = await prisma.artist.count(); } catch {}
  return (
    <PrintLayout title="تقرير الإحصائيات" docNumber="RPT-STATS" verificationCode="STATS-REPORT">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
        <div className="dash-card" style={{ textAlign: "center" }}><div style={{ fontSize: "24pt", fontWeight: 800, color: "#000" }}>{tb}</div><div style={{ color: "#D4AF37", fontWeight: 700, fontSize: "10pt" }}>إجمالي الحجوزات</div></div>
        <div className="dash-card" style={{ textAlign: "center" }}><div style={{ fontSize: "24pt", fontWeight: 800, color: "#16a34a" }}>{cf}</div><div style={{ color: "#D4AF37", fontWeight: 700, fontSize: "10pt" }}>مؤكدة</div></div>
        <div className="dash-card" style={{ textAlign: "center" }}><div style={{ fontSize: "24pt", fontWeight: 800, color: "#000" }}>{ta}</div><div style={{ color: "#D4AF37", fontWeight: 700, fontSize: "10pt" }}>فنانين</div></div>
      </div>
      <table className="print-table"><thead><tr><th>البند</th><th style={{ textAlign: "left" }}>القيمة</th></tr></thead>
        <tbody><tr><td>إجمالي الإيرادات</td><td style={{ textAlign: "left", fontWeight: 800, fontSize: "12pt" }}>{rv.toLocaleString()} ج.م</td></tr><tr><td>إجمالي العربونات</td><td style={{ textAlign: "left", color: "#16a34a" }}>{dp.toLocaleString()} ج.م</td></tr><tr><td>إجمالي المتبقي</td><td style={{ textAlign: "left", color: "#dc2626" }}>{rm.toLocaleString()} ج.م</td></tr><tr><td>حجوزات معلقة</td><td style={{ textAlign: "left" }}>{pd}</td></tr><tr><td>ملغية / مرفوضة</td><td style={{ textAlign: "left" }}>{cn}</td></tr></tbody></table>
    </PrintLayout>
  );
}
