import { prisma } from "@/lib/prisma"
import { CheckCircle2, XCircle, DollarSign, TrendingUp, Clock } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"

export const dynamic = "force-dynamic"

const LuxuryStamp = () => (
  <div className="absolute bottom-32 left-20 w-40 h-40 pointer-events-none">
    <div className="relative w-full h-full border-[3px] border-black rounded-full flex items-center justify-center opacity-60 rotate-[-15deg]">
      <div className="absolute inset-2 border-2 border-[#D4AF37] rounded-full"></div>
      <div className="flex flex-col items-center justify-center gap-1 z-10">
        <span className="text-black font-black text-2xl tracking-wider">NOORYI</span>
        <div className="w-24 h-0.5 bg-[#D4AF37]"></div>
        <span className="text-black font-bold text-xs uppercase tracking-widest">STUDIO</span>
        <span className="text-[#D4AF37] font-bold text-[10px] mt-1">✓ معتمد</span>
      </div>
    </div>
  </div>
)

export default async function VerifyInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; type?: string }>
}) {
  const params = await searchParams
  const invoiceId = params.id
  const invoiceType = params.type || "payment"

  if (!invoiceId) {
    return (
      <div dir="rtl" className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-12 rounded-3xl shadow-2xl text-center max-w-md border-t-4 border-red-500">
          <XCircle className="w-24 h-24 text-red-500 mx-auto mb-6" />
          <h1 className="text-3xl font-black text-gray-900 mb-4">رابط غير صالح</h1>
          <p className="text-gray-600 text-lg mb-8">هذا الرابط لا يحتوي على المعرف المطلوب.</p>
        </div>
      </div>
    )
  }

  const verificationDate = new Date().toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit", timeZone: "UTC" })

  // ====== محاولة 1: البحث في التقارير ======
  if (invoiceType === "report") {
    let report: any = null
    try {
      report = await prisma.generatedReport.findUnique({ where: { reportNumber: invoiceId } })
    } catch (e) {
      console.error("Report lookup error:", e)
    }

    if (!report) {
      return (
        <div dir="rtl" className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
          <div className="bg-white p-12 rounded-3xl shadow-2xl text-center max-w-md border-t-4 border-red-500">
            <XCircle className="w-24 h-24 text-red-500 mx-auto mb-6" />
            <h1 className="text-3xl font-black text-gray-900 mb-4">التقرير غير موجود</h1>
            <p className="text-gray-600 text-lg">الرقم: <span className="font-mono font-bold">{invoiceId}</span></p>
          </div>
        </div>
      )
    }

    // قراءة البيانات من JSON المخزن
    const reportData = (report.data as any) || {}
    const reportStats = reportData.stats || {}
    const reportBookings = reportData.bookings || []

    // استخدام القيم من الحقول المنفصلة أو من stats
    const totalAmount = Number(report.totalAmount) || Number(reportStats.totalRevenue) || 0
    const platformFee = Number(report.platformFee) || Number(reportStats.platformFee) || 0
    const netAmount = Number(report.netAmount) || Number(reportStats.netRevenue) || 0
    const bookingsCount = Number(report.bookingsCount) || Number(reportStats.totalBookings) || reportBookings.length

    return (
      <div dir="rtl" className="min-h-screen bg-gray-100 p-4 md:p-8">
        <div className="max-w-[210mm] mx-auto mb-6">
          <div className="bg-gradient-to-l from-green-500 to-green-600 text-white p-6 rounded-2xl shadow-xl flex items-center gap-4">
            <CheckCircle2 className="w-16 h-16 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-black mb-1">✓ تم التحقق من صحة التقرير</h2>
              <p className="text-green-50">هذا التقرير رسمي ومعتمد من نظام Nooryi Studio</p>
            </div>
          </div>
        </div>

        <div className="max-w-[210mm] mx-auto bg-white shadow-2xl p-12 md:p-16 relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
            <span className="text-[150px] font-black text-[#D4AF37] rotate-[-30deg] tracking-tighter">NOORYI</span>
          </div>
          <LuxuryStamp />

          {/* الترويسة */}
          <div className="mb-12 pb-8 border-b-4 border-black relative">
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#D4AF37]"></div>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-6xl font-black text-black mb-2 tracking-tight">Nooryi</h1>
                <div className="w-32 h-1 bg-[#D4AF37] mb-3"></div>
                <p className="text-sm text-gray-600 font-bold uppercase tracking-[0.3em]">STUDIO FOR ARTISTS & EVENTS</p>
              </div>
              <div className="bg-black px-8 py-4 rounded-lg shadow-2xl">
                <h2 className="text-2xl font-black text-[#D4AF37] uppercase tracking-[0.2em]">تقرير مالي</h2>
              </div>
            </div>
          </div>

          {/* معلومات التقرير */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border-2 border-black">
              <h3 className="text-xs font-black text-[#D4AF37] uppercase tracking-[0.3em] mb-3">موجه إلى:</h3>
              <p className="text-xl font-bold text-black">{report.generatedFor}</p>
              <p className="text-sm text-gray-600 mt-1">Nooryi Studio</p>
            </div>
            <div className="md:text-left">
              <div className="inline-grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                <span className="text-gray-500">رقم التقرير:</span>
                <span className="font-bold text-black font-mono">{report.reportNumber}</span>
                <span className="text-gray-500">تاريخ الإنشاء:</span>
                <span className="font-bold text-black">{new Date(report.createdAt).toLocaleDateString("ar-EG")}</span>
                <span className="text-gray-500">تاريخ التحقق:</span>
                <span className="font-bold text-black text-xs">{verificationDate}</span>
                <span className="text-gray-500">عدد الحجوزات:</span>
                <span className="font-bold text-black">{bookingsCount}</span>
              </div>
            </div>
          </div>

          {/* الملخص التنفيذي */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
            <div className="bg-black p-5 rounded-xl text-center">
              <DollarSign className="w-8 h-8 text-[#D4AF37] mx-auto mb-2" />
              <p className="text-xs text-gray-400 mb-1">إجمالي الإيرادات</p>
              <p className="text-xl font-black text-[#D4AF37]">{totalAmount.toLocaleString()}</p>
              <p className="text-xs text-gray-400">ج.م</p>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border-2 border-black text-center">
              <Clock className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <p className="text-xs text-gray-500 mb-1">رسوم المنصة (5%)</p>
              <p className="text-xl font-black text-black">{platformFee.toLocaleString()}</p>
              <p className="text-xs text-gray-500">ج.م</p>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border-2 border-black text-center">
              <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-xs text-gray-500 mb-1">صافي الإيرادات</p>
              <p className="text-xl font-black text-black">{netAmount.toLocaleString()}</p>
              <p className="text-xs text-gray-500">ج.م</p>
            </div>
          </div>

          {/* إحصائيات الحالة */}
          {reportStats.byStatus && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              <div className="bg-gradient-to-br from-green-50 to-white p-4 rounded-xl border-2 border-green-500 text-center">
                <p className="text-xs text-gray-500 mb-1">مكتملة</p>
                <p className="text-2xl font-black text-green-600">{reportStats.byStatus.completed || 0}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-white p-4 rounded-xl border-2 border-blue-500 text-center">
                <p className="text-xs text-gray-500 mb-1">موافق عليها</p>
                <p className="text-2xl font-black text-blue-600">{reportStats.byStatus.approved || 0}</p>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-white p-4 rounded-xl border-2 border-yellow-500 text-center">
                <p className="text-xs text-gray-500 mb-1">قيد المراجعة</p>
                <p className="text-2xl font-black text-yellow-600">{reportStats.byStatus.pending || 0}</p>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-white p-4 rounded-xl border-2 border-red-500 text-center">
                <p className="text-xs text-gray-500 mb-1">ملغية</p>
                <p className="text-2xl font-black text-red-600">{reportStats.byStatus.cancelled || 0}</p>
              </div>
            </div>
          )}

          {/* إحصائيات الدفع */}
          {reportStats.byPayment && (
            <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border-2 border-black mb-12">
              <h4 className="font-black text-black mb-4 text-sm uppercase tracking-wider">تحليل حالة الدفع</h4>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-3xl font-black text-green-600">{reportStats.byPayment.paid || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">مدفوع بالكامل</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-black text-blue-600">{reportStats.byPayment.partial || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">مدفوع جزئياً</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-black text-red-600">{reportStats.byPayment.unpaid || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">غير مدفوع</p>
                </div>
              </div>
              {reportStats.totalDeposits !== undefined && (
                <div className="pt-4 border-t border-gray-200 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-gray-700">إجمالي العربون المدفوع:</span>
                    <span className="font-black text-green-600">{Number(reportStats.totalDeposits).toLocaleString()} ج.م</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-gray-700">إجمالي المبالغ المتبقية:</span>
                    <span className="font-black text-red-600">{Number(reportStats.totalRemaining).toLocaleString()} ج.م</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* جدول الحجوزات */}
          {reportBookings.length > 0 && (
            <div className="mb-12">
              <h3 className="text-lg font-black text-black mb-4 pb-2 border-b-2 border-[#D4AF37]">تفاصيل الحجوزات</h3>
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-black text-white">
                    <th className="py-3 px-2 text-right font-bold w-10">#</th>
                    <th className="py-3 px-2 text-right font-bold">الفنان</th>
                    <th className="py-3 px-2 text-right font-bold">العميل</th>
                    <th className="py-3 px-2 text-right font-bold">التاريخ</th>
                    <th className="py-3 px-2 text-right font-bold">الحالة</th>
                    <th className="py-3 px-2 text-left font-bold text-[#D4AF37]">المبلغ</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {reportBookings.map((b: any, i: number) => {
                    const sLabels: any = {
                      COMPLETED: { t: "مكتمل", c: "bg-green-100 text-green-700" },
                      APPROVED: { t: "موافق", c: "bg-blue-100 text-blue-700" },
                      PENDING_APPROVAL: { t: "مراجعة", c: "bg-yellow-100 text-yellow-700" },
                      CANCELLED: { t: "ملغي", c: "bg-red-100 text-red-700" },
                    }
                    const sl = sLabels[b.status] || sLabels.PENDING_APPROVAL
                    return (
                      <tr key={i} className={`border-b border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                        <td className="py-3 px-2 text-gray-500 font-mono font-bold">{i + 1}</td>
                        <td className="py-3 px-2 font-bold text-black text-xs">{b.artistName || "-"}</td>
                        <td className="py-3 px-2 text-xs">{b.clientName || "-"}</td>
                        <td className="py-3 px-2 whitespace-nowrap text-xs">{new Date(b.date).toLocaleDateString("ar-EG")}</td>
                        <td className="py-3 px-2"><span className={`px-2 py-1 rounded text-[10px] font-bold ${sl.c}`}>{sl.t}</span></td>
                        <td className="py-3 px-2 text-left font-bold text-black">{Number(b.grossAmount || 0).toLocaleString()}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* الإجماليات */}
          <div className="flex justify-end mb-16">
            <div className="w-full md:w-[400px] rounded-2xl border-2 border-black overflow-hidden shadow-xl">
              <div className="flex justify-between py-4 px-6 border-b border-gray-200">
                <span className="text-gray-600 font-bold">الإجمالي:</span>
                <span className="font-bold text-black text-lg">{totalAmount.toLocaleString()} ج.م</span>
              </div>
              <div className="flex justify-between py-4 px-6 border-b border-gray-200 bg-gray-50">
                <span className="text-gray-600 font-bold">رسوم المنصة (5%):</span>
                <span className="font-bold text-red-600 text-lg">{platformFee.toLocaleString()} ج.م</span>
              </div>
              <div className="flex justify-between py-6 px-6 bg-black text-white">
                <span className="font-bold text-xl text-[#D4AF37]">الصافي:</span>
                <span className="font-black text-3xl text-[#D4AF37]">{netAmount.toLocaleString()} ج.م</span>
              </div>
            </div>
          </div>

          <div className="border-t-4 border-black pt-8 text-center">
            <p className="text-sm text-gray-600 font-semibold">✓ تم التحقق من صحة هذا التقرير عبر نظام Nooryi Studio</p>
            <p className="text-xs text-gray-500 mt-2">تاريخ التحقق: {verificationDate}</p>
          </div>
        </div>
      </div>
    )
  }

  // ====== محاولة 2: البحث في الحجوزات (فاتورة دفع) ======
  let booking: any = null
  try {
    booking = await prisma.booking.findUnique({
      where: { id: invoiceId },
      include: {
        artist: { select: { name: true, category: true, profileImage: true } },
        venue: { select: { name: true, address: true } },
        customer: { select: { fullName: true, email: true, phone: true } },
      },
    })
  } catch (e) {
    console.error("Booking lookup error:", e)
  }

  if (!booking) {
    return (
      <div dir="rtl" className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-12 rounded-3xl shadow-2xl text-center max-w-md border-t-4 border-red-500">
          <XCircle className="w-24 h-24 text-red-500 mx-auto mb-6" />
          <h1 className="text-3xl font-black text-gray-900 mb-4">الفاتورة غير موجودة</h1>
          <p className="text-gray-600 text-lg">المعرف: <span className="font-mono font-bold">{invoiceId}</span></p>
        </div>
      </div>
    )
  }

  const grossAmount = Number(booking.grossAmount || 0)
  const depositAmount = Number(booking.depositAmount || 0)
  const remainingAmount = Number(booking.remainingAmount || 0)
  const taxAmount = Math.round(grossAmount * 0.14)
  const clientName = booking.customer?.fullName || booking.clientName || "عميل"
  const clientEmail = booking.customer?.email || booking.clientEmail || null
  const clientPhone = booking.customer?.phone || booking.clientPhone || null
  const invoiceDate = new Date(booking.createdAt).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" })
  const eventDate = new Date(booking.date).toLocaleDateString("ar-EG", { weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "UTC" })
  const timeSlotLabels: any = { MORNING: "صباحاً", AFTERNOON: "ظهراً", EVENING: "مساءً", NIGHT: "ليلاً" }
  const timeSlotLabel = timeSlotLabels[booking.timeSlot] || ""

  return (
    <div dir="rtl" className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-[210mm] mx-auto mb-6">
        <div className="bg-gradient-to-l from-green-500 to-green-600 text-white p-6 rounded-2xl shadow-xl flex items-center gap-4">
          <CheckCircle2 className="w-16 h-16 flex-shrink-0" />
          <div>
            <h2 className="text-2xl font-black mb-1">✓ تم التحقق من صحة الفاتورة</h2>
            <p className="text-green-50">هذه الفاتورة رسمية ومعتمدة من نظام Nooryi Studio</p>
          </div>
        </div>
      </div>

      <div className="max-w-[210mm] mx-auto bg-white shadow-2xl p-12 md:p-16 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
          <span className="text-[150px] font-black text-[#D4AF37] rotate-[-30deg] tracking-tighter">NOORYI</span>
        </div>
        <LuxuryStamp />

        {/* الترويسة */}
        <div className="mb-12 pb-8 border-b-4 border-black relative">
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#D4AF37]"></div>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-6xl font-black text-black mb-2 tracking-tight">Nooryi</h1>
              <div className="w-32 h-1 bg-[#D4AF37] mb-3"></div>
              <p className="text-sm text-gray-600 font-bold uppercase tracking-[0.3em]">STUDIO FOR ARTISTS & EVENTS</p>
            </div>
            <div className="bg-black px-8 py-4 rounded-lg shadow-2xl">
              <h2 className="text-2xl font-black text-[#D4AF37] uppercase tracking-[0.2em]">فاتورة دفع</h2>
            </div>
          </div>
        </div>

        {/* معلومات الفاتورة */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border-2 border-black">
            <h3 className="text-xs font-black text-[#D4AF37] uppercase tracking-[0.3em] mb-3">فاتورة إلى:</h3>
            <p className="text-xl font-bold text-black mb-1">{clientName}</p>
            {clientEmail && <p className="text-sm text-gray-600 mb-1">{clientEmail}</p>}
            {clientPhone && <p className="text-sm text-gray-600" dir="ltr">{clientPhone}</p>}
          </div>
          <div className="md:text-left">
            <div className="inline-grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
              <span className="text-gray-500">تاريخ الإصدار:</span>
              <span className="font-bold text-black">{invoiceDate}</span>
              <span className="text-gray-500">تاريخ الحجز:</span>
              <span className="font-bold text-black">{eventDate}</span>
              <span className="text-gray-500">وقت الفعالية:</span>
              <span className="font-bold text-black">{timeSlotLabel}</span>
              <span className="text-gray-500">تاريخ التحقق:</span>
              <span className="font-bold text-black text-xs">{verificationDate}</span>
            </div>
          </div>
        </div>

        {/* تفاصيل الحجز */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="flex items-center gap-4 bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border-2 border-black">
            {booking.artist?.profileImage ? (
              <img src={booking.artist.profileImage} alt={booking.artist.name} className="w-16 h-16 rounded-xl object-cover border-2 border-[#D4AF37]" />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-black flex items-center justify-center text-[#D4AF37] font-bold text-xl">
                {booking.artist?.name?.charAt(0) || "ف"}
              </div>
            )}
            <div>
              <p className="text-xs text-[#D4AF37] font-semibold uppercase">الفنان</p>
              <p className="text-lg font-bold text-black">{booking.artist?.name || "غير محدد"}</p>
              <p className="text-sm text-gray-600">{booking.artist?.category || ""}</p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border-2 border-black">
            <p className="text-xs text-[#D4AF37] font-semibold uppercase mb-1">مكان الفعالية</p>
            <p className="text-lg font-bold text-black">{booking.venue?.name || "غير محدد"}</p>
            {booking.venue?.address && <p className="text-sm text-gray-600 mt-1">{booking.venue.address}</p>}
          </div>
        </div>

        {/* جدول البنود */}
        <table className="w-full text-sm border-collapse mb-12">
          <thead>
            <tr className="bg-black text-white">
              <th className="py-4 px-3 text-right font-bold w-12">#</th>
              <th className="py-4 px-3 text-right font-bold">الخدمة</th>
              <th className="py-4 px-3 text-right font-bold">التفاصيل</th>
              <th className="py-4 px-3 text-left font-bold text-[#D4AF37]">المبلغ (ج.م)</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            <tr className="border-b border-gray-100">
              <td className="py-4 px-3 text-gray-500 font-mono font-bold">1</td>
              <td className="py-4 px-3">
                <div className="font-bold text-black">حجز فني خاص</div>
                <div className="text-xs text-gray-500 mt-1">
                  {booking.artist?.name || "غير محدد"} • {booking.artist?.category || ""}
                </div>
              </td>
              <td className="py-4 px-3">
                <div className="text-sm">{eventDate}</div>
                <div className="text-xs text-gray-500 mt-1">{timeSlotLabel} • {booking.venue?.name || ""}</div>
              </td>
              <td className="py-4 px-3 text-left font-bold text-black text-base">
                {grossAmount.toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>

        {/* الإجماليات */}
        <div className="flex justify-end mb-16">
          <div className="w-full md:w-[400px] rounded-2xl border-2 border-black overflow-hidden shadow-xl">
            <div className="flex justify-between py-4 px-6 border-b border-gray-200">
              <span className="text-gray-600 font-bold">المجموع الفرعي:</span>
              <span className="font-bold text-black text-lg">{grossAmount.toLocaleString()} ج.م</span>
            </div>
            <div className="flex justify-between py-4 px-6 border-b border-gray-200 bg-gray-50">
              <span className="text-gray-600 font-bold">ضريبة القيمة المضافة (14%):</span>
              <span className="font-bold text-gray-700 text-lg">{taxAmount.toLocaleString()} ج.م</span>
            </div>
            <div className="flex justify-between py-4 px-6 border-b border-gray-200">
              <span className="text-gray-600 font-bold">العربون المدفوع:</span>
              <span className="font-bold text-green-600 text-lg">{depositAmount.toLocaleString()} ج.م</span>
            </div>
            <div className="flex justify-between py-6 px-6 bg-black text-white shadow-inner">
              <span className="font-bold text-xl text-[#D4AF37]">المبلغ المتبقي:</span>
              <span className="font-black text-3xl text-[#D4AF37]">{remainingAmount.toLocaleString()} ج.م</span>
            </div>
          </div>
        </div>

        {/* التذييل */}
        <div className="border-t-4 border-black pt-8 mt-auto relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#D4AF37]"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h4 className="font-black text-black mb-3 text-sm uppercase tracking-[0.2em]">الشروط والأحكام:</h4>
              <ul className="text-xs text-gray-600 space-y-2 leading-relaxed">
                <li className="flex gap-2">
                  <span className="text-[#D4AF37] font-bold">•</span>
                  <span>هذه الفاتورة صادرة آلياً من نظام Nooryi Studio وتعتبر وثيقة دفع معتمدة.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#D4AF37] font-bold">•</span>
                  <span>جميع المبالغ بالجنيه المصري (EGP) وشاملة الضرائب والرسوم.</span>
                </li>
              </ul>
            </div>
            <div className="md:text-left flex flex-col items-end justify-end">
              <div className="text-center">
                <div className="w-48 h-20 border-b-2 border-black mb-3 mx-auto"></div>
                <p className="text-sm font-black text-black">توقيع المدير المالي</p>
                <p className="text-xs text-gray-500 mt-1">Nooryi Studio Finance Dept.</p>
              </div>
            </div>
          </div>

          {/* QR Code سفلي */}
          <div className="flex justify-center pt-6 border-t border-gray-200">
            <div className="text-center">
              <div className="bg-white p-3 rounded-xl border-2 border-black inline-block shadow-lg">
                <QRCodeSVG
                  value={`https://nooryi-studio.vercel.app/invoice/verify?id=${invoiceId}&type=payment`}
                  size={80}
                  level="H"
                  includeMargin={false}
                  bgColor="#FFFFFF"
                  fgColor="#000000"
                />
              </div>
              <p className="text-[10px] text-gray-500 mt-2 font-bold">امسح للتحقق من صحة الفاتورة</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}