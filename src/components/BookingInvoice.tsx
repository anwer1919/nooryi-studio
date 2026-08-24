import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer"

// تسجيل الخطوط من المجلد المحلي (public/fonts)
Font.register({
  family: "Cairo",
  fonts: [
    {
      src: "/fonts/Cairo-Regular.ttf",
      fontWeight: "normal",
    },
    {
      src: "/fonts/Cairo-Bold.ttf",
      fontWeight: "bold",
    },
  ],
})
// ... باقي الكود كما هو (Styles, Interface, Component) ...

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: "#ffffff",
    fontFamily: "Cairo",
    direction: "rtl",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
    borderBottom: 2,
    borderBottomColor: "#D4AF37",
    paddingBottom: 20,
  },
  logoSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoIcon: {
    width: 40,
    height: 40,
    backgroundColor: "#D4AF37",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#D4AF37",
  },
  invoiceTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    textAlign: "left",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#D4AF37",
    marginBottom: 10,
    borderBottom: 1,
    borderBottomColor: "#ddd",
    paddingBottom: 5,
  },
  row: {
    flexDirection: "row",
    marginBottom: 8,
    justifyContent: "space-between",
  },
  label: {
    fontSize: 11,
    color: "#666",
    fontWeight: "bold",
  },
  value: {
    fontSize: 11,
    color: "#333",
    textAlign: "left",
  },
  totalSection: {
    marginTop: 30,
    borderTop: 2,
    borderTopColor: "#D4AF37",
    paddingTop: 20,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  totalLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "bold",
  },
  totalValue: {
    fontSize: 12,
    color: "#333",
    fontWeight: "bold",
  },
  grandTotal: {
    fontSize: 16,
    color: "#D4AF37",
    fontWeight: "bold",
  },
  footer: {
    position: "absolute",
    bottom: 40,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 9,
    color: "#999",
    borderTop: 1,
    borderTopColor: "#ddd",
    paddingTop: 10,
  },
  statusBadge: {
    backgroundColor: "#10b981",
    color: "#ffffff",
    padding: "4 12",
    borderRadius: 4,
    fontSize: 10,
    fontWeight: "bold",
    alignSelf: "flex-end",
    marginTop: 10,
  },
})

interface InvoiceData {
  bookingId: string
  date: string
  artistName: string
  clientName: string
  clientPhone: string
  clientEmail?: string
  venueName: string
  venueAddress?: string
  timeSlot: string
  grossAmount: number
  depositAmount: number
  remainingAmount: number
  status: string
  createdAt: string
}

export default function BookingInvoice({ data }: { data: InvoiceData }) {
  const timeSlotLabels: Record<string, string> = {
    MORNING: "صباحاً (9ص - 12ظ)",
    AFTERNOON: "ظهراً (12ظ - 5م)",
    EVENING: "مساءً (5م - 11م)",
  }

  const statusLabels: Record<string, string> = {
    PENDING_APPROVAL: "بانتظار الموافقة",
    APPROVED: "مؤكد",
    REJECTED: "مرفوض",
    COMPLETED: "مكتمل",
    CANCELLED: "ملغي",
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoSection}>
            <View style={styles.logoIcon}>
              <Text style={{ color: "#000", fontSize: 20, fontWeight: "bold" }}>N</Text>
            </View>
            <View>
              <Text style={styles.logoText}>Nooryi Studio</Text>
              <Text style={{ fontSize: 9, color: "#666" }}>منصة حجز الفنانين</Text>
            </View>
          </View>
          <View>
            <Text style={styles.invoiceTitle}>فاتورة حجز</Text>
            <Text style={{ fontSize: 10, color: "#666", marginTop: 5, textAlign: "left" }}>
              رقم: {data.bookingId.slice(0, 8).toUpperCase()}
            </Text>
          </View>
        </View>

        {/* معلومات العميل */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>معلومات العميل</Text>
          <View style={styles.row}>
            <Text style={styles.label}>الاسم:</Text>
            <Text style={styles.value}>{data.clientName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>رقم الهاتف:</Text>
            <Text style={styles.value}>{data.clientPhone}</Text>
          </View>
          {data.clientEmail && (
            <View style={styles.row}>
              <Text style={styles.label}>البريد الإلكتروني:</Text>
              <Text style={styles.value}>{data.clientEmail}</Text>
            </View>
          )}
        </View>

        {/* تفاصيل الحجز */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>تفاصيل الحجز</Text>
          <View style={styles.row}>
            <Text style={styles.label}>الفنان:</Text>
            <Text style={styles.value}>{data.artistName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>التاريخ:</Text>
            <Text style={styles.value}>{data.date}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>الفترة:</Text>
            <Text style={styles.value}>{timeSlotLabels[data.timeSlot] || data.timeSlot}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>المكان:</Text>
            <Text style={styles.value}>{data.venueName}</Text>
          </View>
          {data.venueAddress && (
            <View style={styles.row}>
              <Text style={styles.label}>العنوان:</Text>
              <Text style={styles.value}>{data.venueAddress}</Text>
            </View>
          )}
          <View style={styles.row}>
            <Text style={styles.label}>تاريخ إصدار الفاتورة:</Text>
            <Text style={styles.value}>{data.createdAt}</Text>
          </View>
        </View>

        {/* التفاصيل المالية */}
        <View style={styles.totalSection}>
          <Text style={styles.sectionTitle}>التفاصيل المالية</Text>
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>إجمالي قيمة الحجز:</Text>
            <Text style={styles.totalValue}>{data.grossAmount.toLocaleString()} ج.م</Text>
          </View>
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>العربون المدفوع:</Text>
            <Text style={{ ...styles.totalValue, color: "#10b981" }}>
              {data.depositAmount.toLocaleString()} ج.م
            </Text>
          </View>
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>المبلغ المتبقي:</Text>
            <Text style={{ ...styles.totalValue, color: "#ef4444" }}>
              {data.remainingAmount.toLocaleString()} ج.م
            </Text>
          </View>

          <View style={{ ...styles.totalRow, marginTop: 15, paddingTop: 15, borderTop: 1, borderTopColor: "#ddd" }}>
            <Text style={styles.grandTotal}>الإجمالي النهائي:</Text>
            <Text style={styles.grandTotal}>{data.grossAmount.toLocaleString()} ج.م</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            Nooryi Studio - منصة حجز الفنانين | info@nooryi.com | +249 998 989 999
          </Text>
          <Text style={{ marginTop: 5 }}>
            هذه الفاتورة تم إنشاؤها تلقائياً وهي صالحة كإيصال رسمي للحجز
          </Text>
        </View>
      </Page>
    </Document>
  )
}