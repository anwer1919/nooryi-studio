import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PrintLayout from "@/components/PrintLayout";

export const dynamic = "force-dynamic";

export default async function InvoicePrintPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  if (!id) notFound();

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      artist: { select: { name: true, category: true } },
      venue: { select: { name: true, address: true, city: true } },
    },
  });

  if (!booking) notFound();

  const gross = Number(booking.grossAmount || 0);
  const deposit = Number(booking.depositAmount || 0);
  const remaining = Number(booking.remainingAmount || 0);
  const dateStr = booking.date ? new Date(booking.date).toLocaleDateString("ar-EG") : "—";

  return (
    <PrintLayout
      title="فاتورة حجز"
      docNumber={`INV-${booking.id.slice(0, 8).toUpperCase()}`}
      verificationCode={booking.id}
    >
      {/* بيانات العميل والفنان */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <div>
          <h3 style={{ color: "#F5A623", marginBottom: 8, fontSize: "11pt" }}>بيانات العميل</h3>
          <p><strong>الاسم:</strong> {booking.clientName || "—"}</p>
          <p><strong>الهاتف:</strong> <span dir="ltr">{booking.clientPhone || "—"}</span></p>
          <p><strong>البريد:</strong> {booking.clientEmail || "—"}</p>
        </div>
        <div>
          <h3 style={{ color: "#F5A623", marginBottom: 8, fontSize: "11pt" }}>بيانات الفنان</h3>
          <p><strong>الفنان:</strong> {booking.artist?.name || "—"}</p>
          <p><strong>التصنيف:</strong> {booking.artist?.category || "—"}</p>
          <p><strong>المكان:</strong> {booking.venue?.name || "—"}</p>
          <p><strong>العنوان:</strong> {booking.venue?.address || "—"}</p>
        </div>
      </div>

      {/* جدول المبالغ */}
      <table>
        <thead>
          <tr>
            <th>البند</th>
            <th style={{ textAlign: "left" }}>المبلغ (ج.م)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>المبلغ الإجمالي</td>
            <td style={{ textAlign: "left" }}>{gross.toLocaleString()}</td>
          </tr>
          <tr>
            <td>العربون المدفوع</td>
            <td style={{ textAlign: "left" }}>{deposit.toLocaleString()}</td>
          </tr>
          <tr>
            <td>المبلغ المتبقي</td>
            <td style={{ textAlign: "left", color: remaining > 0 ? "#dc2626" : "#16a34a", fontWeight: 700 }}>
              {remaining.toLocaleString()}
            </td>
          </tr>
        </tbody>
      </table>

      {/* تفاصيل إضافية */}
      <div style={{ marginTop: 16, padding: 12, border: "1px solid #e0e0e0", borderRadius: 8 }}>
        <p><strong>تاريخ الفعالية:</strong> {dateStr}</p>
        <p><strong>وقت الحجز:</strong> {booking.timeSlot || "—"}</p>
        <p><strong>الحالة:</strong> {booking.status}</p>
      </div>
    </PrintLayout>
  );
}
