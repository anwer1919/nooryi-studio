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
  // جلب إعدادات المنصة من جدول SiteSetting
  let settings: any = null;
  try {
    settings = await prisma.siteSetting.findFirst({
      orderBy: { updatedAt: "desc" },
    });
  } catch {}

  const platformName = settings?.siteName || settings?.platformName || settings?.name || "Nooryi Studio";
  const platformEmail = settings?.email || settings?.contactEmail || "";
  const platformPhone = settings?.phone || settings?.contactPhone || "";
  const platformAddress = settings?.address || "";
  const logoUrl = settings?.logoUrl || settings?.logo || "";
  const taxId = settings?.taxId || settings?.vatNumber || "";
  const dateStr = new Date().toLocaleDateString("ar-EG", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="print-layout" dir="rtl">
      {/* ═══ الترويسة ═══ */}
      <div className="print-header">
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {logoUrl && (
            <img src={logoUrl} alt="Logo" style={{ width: 60, height: 60, borderRadius: 8 }} />
          )}
          <div>
            <div className="logo-text">
              {platformName.split(" ")[0]}
              <span className="logo-accent">{platformName.split(" ").slice(1).join(" ")}</span>
            </div>
            <div style={{ fontSize: "9pt", color: "#555", marginTop: 4 }}>
              {platformAddress && <div>{platformAddress}</div>}
              {platformPhone && <div dir="ltr">{platformPhone}</div>}
              {platformEmail && <div>{platformEmail}</div>}
              {taxId && <div>الرقم الضريبي: {taxId}</div>}
            </div>
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

      {/* ═══ QR Code + الختم ═══ */}
      {(verificationCode || docNumber) && (
        <>
          <div className="print-qr-section">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(verificationCode || docNumber || platformName)}`}
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
              <div>هذا المستند صادر إلكترونياً من {platformName}</div>
              <div>وهو صالح بدون توقيع يدوي أو ختم مادي</div>
              {platformEmail && <div style={{ marginTop: 4 }}>للاستفسار: {platformEmail}</div>}
            </div>
            <div className="stamp-box">
              <span className="stamp-icon">✓</span>
              <span className="stamp-text">موثق</span>
              <span className="stamp-text">{platformName.split(" ")[0]}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
