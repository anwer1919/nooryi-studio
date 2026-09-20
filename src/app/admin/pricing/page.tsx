import { prisma } from "@/lib/prisma";
import PrintLayout from "@/components/PrintLayout";
export const dynamic = "force-dynamic";
export default async function AllPricingPrintPage() {
  let artists: any[] = [];
  try { artists = await prisma.artist.findMany({ include: { pricing: true }, orderBy: { name: "asc" } }); } catch {}
  return (
    <PrintLayout title="قائمة التسعير الشاملة" docNumber="PRC-ALL" verificationCode="ALL-PRICING">
      {artists.length === 0 ? (
        <div className="dash-card" style={{ textAlign: "center", color: "#777" }}>لا يوجد فنانون مسجلون</div>
      ) : (
        artists.map((artist: any) => {
          const prices = Array.isArray(artist.pricing) ? artist.pricing : artist.pricing ? [artist.pricing] : [];
          return (
            <div key={artist.id} className="dash-card" style={{ marginBottom: 20, pageBreakInside: "avoid" }}>
              <h3 style={{ color: "#D4AF37", marginBottom: 10, fontSize: "12pt", fontWeight: 800, borderBottom: "1px solid #D4AF37", paddingBottom: 6 }}>
                {artist.name} — {artist.category || ""}
              </h3>
              {prices.length > 0 ? (
                <table className="print-table">
                  <thead><tr><th>البند</th><th>السعر</th><th>المدة</th><th>ملاحظات</th></tr></thead>
                  <tbody>
                    {prices.map((p: any, i: number) => (
                      <tr key={i}>
                        <td>{p.title || p.name || p.serviceName || "—"}</td>
                        <td style={{ fontWeight: 700 }}>{Number(p.price || p.amount || 0).toLocaleString()}</td>
                        <td>{p.duration || p.unit || p.period || "—"}</td>
                        <td>{p.notes || p.description || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={{ color: "#999", fontSize: "9pt" }}>لا توجد أسعار مسجلة</p>
              )}
            </div>
          );
        })
      )}
    </PrintLayout>
  );
}
