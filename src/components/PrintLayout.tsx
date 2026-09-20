import { prisma } from "@/lib/prisma";
interface PrintLayoutProps { title: string; docNumber?: string; children: React.ReactNode; verificationCode?: string }
export default async function PrintLayout({ title, docNumber, children, verificationCode }: PrintLayoutProps) {
  let s: any = null;
  try { s = await prisma.siteSetting.findFirst(); } catch {}
  const name = s?.siteName || "Nooryi Studio";
  const tagline = s?.tagline || "منصة حجز الفنانين الأولى";
  const email = s?.email || ""; const phone = s?.phone || ""; const address = s?.address || "";
  const bankName = s?.bankName || ""; const bankAccount = s?.bankAccount || "";
  const iban = s?.iban || ""; const paymentNote = s?.paymentNote || ""; const whatsapp = s?.whatsapp || "";
  const dateStr = new Date().toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" });
  return (
    <div className="print-layout" dir="rtl">
      <div className="print-header">
        <div>
          <div className="logo-text"><span style={{ color: "#000" }}>{name.split(" ")[0]}</span><span style={{ color: "#D4AF37" }}>{name.split(" ").slice(1).join(" ")}</span></div>
          <div style={{ fontSize: "9pt", color: "#333", marginTop: 6 }}><div>{tagline}</div>{address && <div style={{ marginTop: 2 }}>{address}</div>}{phone && <div dir="ltr" style={{ marginTop: 2 }}>{phone}</div>}{email && <div style={{ marginTop: 2 }}>{email}</div>}</div>
        </div>
        <div className="doc-info">
          <div style={{ fontWeight: 800, fontSize: "14pt", marginBottom: 6, color: "#000" }}>{title}</div>
          {docNumber && <div style={{ color: "#D4AF37", fontWeight: 700 }}>رقم المستند: {docNumber}</div>}
          <div style={{ color: "#555", marginTop: 4 }}>تاريخ الإصدار: {dateStr}</div>
        </div>
      </div>
      <div className="print-content">{children}</div>
      {(bankName || bankAccount || iban) && (<div className="print-payment-section"><h3 className="print-section-title">معلومات الدفع والتحويل</h3><table className="print-info-table">{bankName && <tr><td>البنك</td><td>{bankName}</td></tr>}{bankAccount && <tr><td>رقم الحساب</td><td dir="ltr">{bankAccount}</td></tr>}{iban && <tr><td>IBAN</td><td dir="ltr">{iban}</td></tr>}</table>{paymentNote && <p className="print-note">{paymentNote}</p>}</div>)}
      {(verificationCode || docNumber) && (<><div className="print-qr-section"><img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(verificationCode || docNumber || name)}`} alt="QR" /><div className="qr-info"><div className="qr-title">✓ رمز التحقق الرقمي</div><div className="qr-code-text">{verificationCode || docNumber || "N/A"}</div><div style={{ fontSize: "8pt", color: "#777", marginTop: 4 }}>امسح الرمز للتحقق</div></div></div><div className="print-footer-stamp"><div className="print-footer-info"><div>صادر إلكترونياً من <strong>{name}</strong></div><div>صالح بدون توقيع يدوي</div>{email && <div style={{ marginTop: 4 }}>للاستفسار: {email}</div>}{whatsapp && <div dir="ltr">واتساب: {whatsapp}</div>}</div><div className="stamp-box"><span className="stamp-icon">✓</span><span className="stamp-text">موثق</span><span className="stamp-text">{name.split(" ")[0]}</span></div></div></>)}
    </div>
  );
}
