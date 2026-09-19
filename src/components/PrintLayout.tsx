import { prisma } from "@/lib/prisma";

interface PrintLayoutProps {
  title: string;
  docNumber?: string;
  children: React.ReactNode;
  verificationCode?: string;
}

export default async function PrintLayout({
  title,
  docNumber,
  children,
  verificationCode,
}: PrintLayoutProps) {
  let settings: any = null;
  try {
    settings = await prisma.siteSetting.findFirst();
  } catch {}

  const siteName = settings?.siteName || "Nooryi Studio";
  const tagline = settings?.tagline || "منصة حجز الفنانين الأولى";
  const email = settings?.email || "";
  const phone = settings?.phone || "";
  const address = settings?.address || "";
  const currency = settings?.currency || "EGP";
  const bankName = settings?.bankName || "";
  const bankAccount = settings?.bankAccount || "";
  const iban = settings?.iban || "";
  const paymentNote = settings?.paymentNote || "";
  const whatsapp = settings?.whatsapp || "";

  const dateStr = new Date().toLocaleDateString("ar-EG", {
    year: "numeric", month: "long", day: "numeric",
  });

  const currencyLabel = currency === "EGP" ? "ج.م" : currency;

  return (
    <div className="print-layout" dir="rtl">
      {/* ═══ الترويسة ═══ */}
      <div className="print-header">
        <div>
          <div className="logo-text">
            {siteName.split(" ")[0]}
            <span className="logo-accent">{siteName.split(" ").slice(1).join(" ")}</span>
          </div>
          <div style={{ fontSize: "9pt", color: "#555", marginTop: 4 }}>
            <div>{tagline}</div>
            {address && <div>{address}</div>}
            {phone && <div dir="ltr">{phone}</div>}
            {email && <div>{email}</div>}
          </div>
        </div>
        <div className="doc-info">
          <div style={{ fontWeight: 700, fontSize: "12pt", marginBottom: 4 }}>{title}</div>
          {docNumber && <div>رقم المستند: {docNumber}</div>}
          <div>تاريخ الإصدار: {dateStr}</div>
        </div>
      </div>

      {/* ═══ المحتوى ═══ */}
      <div className="print-content">{children}</div>

      {/* ═══ معلومات الدفع (إذا كانت متاحة) ═══ */}
      {(bankName || bankAccount || iban) && (
        <div style={{
          marginTop: 24, padding: 16,
          border: "1px solid #F5A623", borderRadius: 8,
          pageBreakInside: "avoid",
        }}>
          <h3 style={{ color: "#F5A623", marginBottom: 8, fontSize: "11pt" }}>
            معلومات الدفع والتحويل
          </h3>
          {bankName && <p><strong>البنك:</strong> {bankName}</p>}
          {bankAccount && <p><strong>رقم الحساب:</strong> <span dir="ltr">{bankAccount}</span></p>}
          {iban && <p><strong>IBAN:</strong> <span dir="ltr">{iban}</span></p>}
          {paymentNote && <p style={{ fontSize: "9pt", color: "#777", marginTop: 8 }}>{paymentNote}</p>}
        </div>
      )}

      {/* ═══ QR Code + الختم ═══ */}
      {(verificationCode || docNumber) && (
        <>
          <div className="print-qr-section">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(verificationCode || docNumber || siteName)}`}
              alt="QR Verification"
            />
            <div className="qr-info">
              <div className="qr-title">✓ رمز التحقق الرقمي</div>
              <div className="qr-code-text">{verificationCode || docNumber || "N/A"}</div>
              <div style={{ fontSize: "8pt", color: "#777", marginTop: 4 }}>
                امسح الرمز للتحقق من صحة هذا المستند
              </div>
            </div>
          </div>

          <div className="print-footer-stamp">
            <div className="print-footer-info">
              <div>هذا المستند صادر إلكترونياً من {siteName}</div>
              <div>وهو صالح بدون توقيع يدوي أو ختم مادي</div>
              {email && <div style={{ marginTop: 4 }}>للاستفسار: {email}</div>}
              {whatsapp && <div dir="ltr">واتساب: {whatsapp}</div>}
            </div>
            <div className="stamp-box">
              <span className="stamp-icon">✓</span>
              <span className="stamp-text">موثق</span>
              <span className="stamp-text">{siteName.split(" ")[0]}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
