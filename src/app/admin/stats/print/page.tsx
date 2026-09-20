import { prisma } from "@/lib/prisma";
import PrintLayout from "@/components/PrintLayout";
export const dynamic = "force-dynamic";
export default async function StatsPrintPage() {
  let totalBookings = 0, confirmed = 0, pending = 0, cancelled = 0, revenue = 0, deposits = 0, remaining = 0, totalArtists = 0;
  try {
    const bookings = await prisma.booking.findMany({ select: { status: true, grossAmount: true, depositAmount: true, remainingAmount: true, totalPrice: true, deposit: true, remaining: true } });
    totalBookings = bookings.length;
    confirmed = bookings.filter(b => b.status === "CONFIRMED" || b.status === "COMPLETED").length;
    pending = bookings.filter(b => b.status === "PENDING").length;
    cancelled = bookings.filter(b => b.status === "CANCELLED" || b.status === "REJECTED").length;
    bookings.forEach(b => { revenue += Number(b.grossAmount || b.totalPrice || 0); deposits += Number(b.depositAmount || b.deposit || 0); remaining += Number(b.remainingAmount || b.remaining || 0); });
    totalArtists = await prisma.artist.count();
  } catch {}
  return (
    <PrintLayout title="تقرير الإحصائيات" docNumber="RPT-STATS" verificationCode="STATS-REPORT">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
        <div className="dash-card" style={{ textAlign: "center" }}><div style={{ fontSize: "24pt", fontWeight: 800, color: "#000" }}>{totalBookings}</div><div style={{ color: "#D4AF37", fontWeight: 700, fontSize: "10pt" }}>إجمالي الحجوزات</div></div>
        <div className="dash-card" style={{ textAlign: "center" }}><div style={{ fontSize: "24pt", fontWeight: 800, color: "#16a34a" }}>{confirmed}</div><div style={{ color: "#D4AF37", fontWeight: 700, fontSize: "10pt" }}>مؤكدة</div></div>
        <div className="dash-card" style={{ textAlign: "center" }}><div style={{ fontSize: "24pt", fontWeight: 800, color: "#000" }}>{totalArtists}</div><div style={{ color: "#D4AF37", fontWeight: 700, fontSize: "10pt" }}>فنانين</div></div>
      </div>
      <table className="print-table">
        <thead><tr><th>البند</th><th style={{ textAlign: "left" }}>القيمة</th></tr></thead>
        <tbody>
          <tr><td>إجمالي الإيرادات</td><td style={{ textAlign: "left", fontWeight: 800, fontSize: "12pt" }}>{revenue.toLocaleString()} ج.م</td></tr>
          <tr><td>إجمالي العربونات</td><td style={{ textAlign: "left", color: "#16a34a" }}>{deposits.toLocaleString()} ج.م</td></tr>
          <tr><td>إجمالي المتبقي</td><td style={{ textAlign: "left", color: "#dc2626" }}>{remaining.toLocaleString()} ج.م</td></tr>
          <tr><td>حجوزات معلقة</td><td style={{ textAlign: "left" }}>{pending}</td></tr>
          <tr><td>ملغية / مرفوضة</td><td style={{ textAlign: "left" }}>{cancelled}</td></tr>
        </tbody>
      </table>
    </PrintLayout>
  );
}
