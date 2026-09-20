import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PrintLayout from "@/components/PrintLayout";
export const dynamic = "force-dynamic";
export default async function InvoicePrintPage({ params, searchParams }: { params: Promise<{ slug?: string; id?: string }>; searchParams: Promise<{ id?: string }> }) {
  const p = await params;
  const sp = await searchParams;
  const id = p.slug || p.id || sp.id;
  if (!id) notFound();
  let booking: any = null;
  try { booking = await prisma.booking.findFirst({ where: { OR: [{ id }, { slug: id }] }, include: { artist: { select: { name: true, category: true } }, venue: { select: { name: true, address: true, city: true } } } }); } catch {}
  if (!booking) notFound();
  const gross = Number(booking.grossAmount || booking.totalPrice || 0);
  const deposit = Number(booking.depositAmount || booking.deposit || 0);
  const remaining = Number(booking.remainingAmount || booking.remaining || gross - deposit);
  const dateStr = booking.date ? new Date(booking.date).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" }) : "—";
  const statusMap: Record<string, string> = { PENDING: "معلق", CONFIRMED: "مؤكد", COMPLETED: "مكتمل", CANCELLED: "ملغي", REJECTED: "مرفوض" };
  return (
    <PrintLayout title="فاتورة حجز" docNumber={`INV-${(booking.id||"").slice(0,8).toUpperCase()}`} verificationCode={booking.id}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        <div className="dash-card">
          <h3 style={{ color: "#D4AF37", marginBottom: 10, fontSize: "11pt", fontWeight: 800, borderBottom: "1px solid #D4AF37", paddingBottom: 6 }}>بيانات العميل</h3>
          <table className="print-info-table">
            <tr><td>الاسم</td><td>{booking.clientName || "—"}</td></tr>
            <tr><td>الهاتف</td><td dir="ltr">{booking.clientPhone || "—"}</td></tr>
            <tr><td>البريد</td><td>{booking.clientEmail || "—"}</td></tr>
          </table>
        </div>
        <div className="dash-card">
          <h3 style={{ color: "#D4AF37", marginBottom: 10, fontSize: "11pt", fontWeight: 800, borderBottom: "1px solid #D4AF37", paddingBottom: 6 }}>بيانات الحجز</h3>
          <table className="print-info-table">
            <tr><td>الفنان</td><td>{booking.artist?.name || "—"}</td></tr>
            <tr><td>التصنيف</td><td>{booking.artist?.category || "—"}</td></tr>
            <tr><td>المكان</td><td>{booking.venue?.name || booking.location || "—"}</td></tr>
            <tr><td>العنوان</td><td>{booking.venue?.address || booking.venue?.city || "—"}</td></tr>
          </table>
        </div>
      </div>
      <table className="print-table">
        <thead><tr><th style={{ width: "50%" }}>البند</th><th style={{ textAlign: "left" }}>المبلغ (ج.م)</th></tr></thead>
        <tbody>
          <tr><td>المبلغ الإجمالي</td><td style={{ textAlign: "left", fontWeight: 700 }}>{gross.toLocaleString()}</td></tr>
          <tr><td>العربون المدفوع</td><td style={{ textAlign: "left", color: "#16a34a" }}>{deposit.toLocaleString()}</td></tr>
          <tr><td>المبلغ المتبقي</td><td style={{ textAlign: "left", color: remaining > 0 ? "#dc2626" : "#16a34a", fontWeight: 800, fontSize: "12pt" }}>{remaining.toLocaleString()}</td></tr>
        </tbody>
      </table>
      <div className="dash-card" style={{ marginTop: 20 }}>
        <h3 style={{ color: "#D4AF37", marginBottom: 10, fontSize: "11pt", fontWeight: 800, borderBottom: "1px solid #D4AF37", paddingBottom: 6 }}>تفاصيل الحجز</h3>
        <table className="print-info-table">
          <tr><td>تاريخ الفعالية</td><td>{dateStr}</td></tr>
          <tr><td>وقت الحجز</td><td>{booking.timeSlot || booking.time || "—"}</td></tr>
          <tr><td>الحالة</td><td><span className={`status-badge status-${(booking.status||"").toLowerCase()}`}>{statusMap[booking.status] || booking.status || "—"}</span></td></tr>
          {booking.notes && <tr><td>ملاحظات</td><td>{booking.notes}</td></tr>}
        </table>
      </div>
    </PrintLayout>
  );
}
