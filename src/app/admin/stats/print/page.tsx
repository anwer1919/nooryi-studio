import { prisma } from "@/lib/prisma";
import PrintLayout from "@/components/PrintLayout";
export const dynamic = "force-dynamic";
export default async function StatsPrintPage() {
  let totalBookings = 0, confirmedBookings = 0, pendingBookings = 0, cancelledBookings = 0;
  let totalRevenue = 0, totalDeposits = 0, totalRemaining = 0;
  let totalArtists = 0;
  try {
    const bookings = await prisma.booking.findMany({ select: { status: true, grossAmount: true, depositAmount: true, remainingAmount: true, totalPrice: true, deposit: true, remaining: true } });
    totalBookings = bookings.length;
    confirmedBookings = bookings.filter(b => b.status === "CONFIRMED" || b.status === "COMPLETED").length;
    pendingBookings = bookings.filter(b => b.status === "PENDING").length;
    cancelledBookings = bookings.filter(b => b.status === "CANCELLED" || b.status === "REJECTED").length;
    bookings.forEach(b => {
      totalRevenue += Number(b.grossAmount || b.totalPrice || 0);
      totalDeposits += Number(b.depositAmount || b.deposit || 0);
      totalRemaining += Number(b.remainingAmount || b.remaining || 0);
    });
    totalArtists = await prisma.artist.count();
  } catch {}
  return (
    <PrintLayout title="تقرير الإحصائيات" docNumber="RPT-STATS" verificationCode="STATS-REPORT">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
        <div className="dash-card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "24pt", fontWeight: 800, color: "#000" }}>{totalBookings}</div>
          <div style={{ color: "#D4AF37", fontWeight: 700, fontSize: "10pt" }}>إجمالي الحجوزات</div>
        </div>
        <div className="dash-card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "24pt", fontWeight: 800, color: "#16a34a" }}>{confirmedBookings}</div>
          <div style={{ color: "#D4AF37", fontWeight: 700, fontSize: "10pt" }}>حجوزات مؤكدة</div>
        </div>
        <div className="dash-card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "24pt", fontWeight: 800, color: "#000" }}>{totalArtists}</div>
          <div style={{ color: "#D4AF37", fontWeight: 700, fontSize: "10pt" }}>عدد الفنانين</div>
        </div>
      </div>
      <table className="print-table">
        <thead><tr><th>البند</th><th style={{ textAlign: "left" }}>القيمة</th></tr></thead>
        <tbody>
          <tr><td>إجمالي الإيرادات</td><td style={{ textAlign: "left", fontWeight: 800, fontSize: "12pt" }}>{totalRevenue.toLocaleString()} ج.م</td></tr>
          <tr><td>إجمالي العربونات</td><td style={{ textAlign: "left", color: "#16a34a" }}>{totalDeposits.toLocaleString()} ج.م</td></tr>
          <tr><td>إجمالي المتبقي</td><td style={{ textAlign: "left", color: "#dc2626" }}>{totalRemaining.toLocaleString()} ج.م</td></tr>
          <tr><td>حجوزات معلقة</td><td style={{ textAlign: "left" }}>{pendingBookings}</td></tr>
          <tr><td>حجوزات ملغية / مرفوضة</td><td style={{ textAlign: "left" }}>{cancelledBookings}</td></tr>
        </tbody>
      </table>
    </PrintLayout>
  );
}
