import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PrintLayout from "@/components/PrintLayout";
export const dynamic = "force-dynamic";
export default async function ArtistPricingPrintPage({ params }: { params: Promise<{ slug?: string }> }) {
  const { slug } = await params; if (!slug) notFound();
  let artist: any = null;
  try { artist = await prisma.artist.findFirst({ where: { OR: [{ id: slug }, { slug: slug }] }, include: { pricing: true } }); } catch {}
  if (!artist) notFound();
  const prices = Array.isArray(artist.pricing) ? artist.pricing : artist.pricing ? [artist.pricing] : [];
  return (
    <PrintLayout title={`تسعيرة ${artist.name || "الفنان"}`} docNumber={`PRC-${(artist.id||"").slice(0,8).toUpperCase()}`} verificationCode={artist.id}>
      <div className="dash-card"><h3 style={{ color: "#D4AF37", marginBottom: 10, fontSize: "12pt", fontWeight: 800, borderBottom: "1px solid #D4AF37", paddingBottom: 6 }}>بيانات الفنان</h3>
        <table className="print-info-table"><tr><td>الاسم</td><td>{artist.name || "—"}</td></tr><tr><td>التصنيف</td><td>{artist.category || "—"}</td></tr>{artist.phone && <tr><td>الهاتف</td><td dir="ltr">{artist.phone}</td></tr>}</table></div>
      {prices.length > 0 ? (<table className="print-table" style={{ marginTop: 20 }}><thead><tr><th>البند</th><th>السعر</th><th>المدة</th><th>ملاحظات</th></tr></thead>
        <tbody>{prices.map((p: any, i: number) => (<tr key={i}><td>{p.title || p.name || p.serviceName || "—"}</td><td style={{ fontWeight: 700 }}>{Number(p.price || p.amount || 0).toLocaleString()}</td><td>{p.duration || p.unit || p.period || "—"}</td><td>{p.notes || p.description || "—"}</td></tr>))}</tbody></table>)
      : (<div className="dash-card" style={{ marginTop: 20, textAlign: "center", color: "#777" }}>لا توجد أسعار مسجلة</div>)}
    </PrintLayout>
  );
}
