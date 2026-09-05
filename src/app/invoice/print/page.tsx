import { prisma } from "@/lib/prisma"
import PrintButtons from "@/components/PrintButtons"

export const dynamic = "force-dynamic"

const STUDIO = {
  name: "Nooryi Studio",
  nameAr: "استوديو نوري",
  tagline: "منصة حجز الفنانين والفعاليات",
  phone: "+20 100 000 0000",
  email: "info@noorystudio.com",
  address: "القاهرة، جمهورية مصر العربية",
  website: "https://nooryi-studio.vercel.app",
  licenseNumber: "NS-2026-001",
  taxNumber: "123-456-789",
}

export default async function UniversalPrintPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>
}) {
  const { id } = await searchParams

  if (!id) {
    return <div dir="rtl" className="min-h-screen flex items-center justify-center"><p className="text-xl font-bold text-gray-500">معرف الحجز غير موجود</p></div>
  }

  let booking
  try {
    booking = await prisma.booking.findUnique({
      where: { id },
      include: { artist: true, venue: true, payments: { orderBy: { createdAt: "desc" } } },
    })
  } catch (e) {
    console.error("Print error:", e)
  }

  if (!booking) {
    return <div dir="rtl" className="min-h-screen flex items-center justify-center"><p className="text-xl font-bold text-gray-500">الحجز غير موجود</p></div>
  }

  const totalPaid = booking.payments.filter((p: any) => ["COMPLETED", "SUCCESS"].includes(p.status)).reduce((s: number, p: any) => s + Number(p.amount || 0), 0)
  const grossAmount = Number(booking.grossAmount || 0)
  const travelFee = Number(booking.travelFee || 0)
  const basePrice = grossAmount - travelFee
  const remaining = Math.max(0, grossAmount - totalPaid)
  const invoiceNumber = "INV-" + booking.id.slice(0, 8).toUpperCase()
  const issueDate = new Date(booking.createdAt).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })
  const eventDate = new Date(booking.date).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric", weekday: "long" })
  const verifyUrl = STUDIO.website + "/verify/invoice/" + booking.id
  const statusLabel = remaining === 0 ? "مدفوعة بالكامل" : totalPaid > 0 ? "مدفوعة جزئياً" : "بانتظار الدفع"

  return (
    <div dir="rtl" className="print-area bg-white text-black">
      <style>{`
        @media print { @page { size: A4; margin: 0; } body * { visibility: hidden; } .print-area, .print-area * { visibility: visible; } .print-area { position: absolute; left: 0; top: 0; width: 210mm; min-height: 297mm; background: white !important; } .no-print { display: none !important; } * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } }
      `}</style>

      <PrintButtons />

      <div className="h-3 bg-gradient-to-r from-[#D4AF37] via-[#f4e5b8] to-[#D4AF37]"></div>

      <div className="px-12 pt-8 pb-5 bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] text-white">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#b8941f] flex items-center justify-center"><span className="text-[#111] text-3xl font-black">N</span></div>
            <div>
              <h1 className="text-3xl font-black">{STUDIO.nameAr}</h1>
              <p className="text-[#D4AF37] font-bold mt-0.5">{STUDIO.name}</p>
              <p className="text-xs text-gray-400 mt-1">{STUDIO.tagline}</p>
            </div>
          </div>
          <div className="text-left">
            <div className="inline-block px-4 py-2 bg-[#D4AF37]/20 border border-[#D4AF37] rounded-lg">
              <p className="text-xs text-[#D4AF37] font-bold">فاتورة رسمية</p>
              <p className="text-xs text-gray-300 mt-1 font-mono" dir="ltr">{invoiceNumber}</p>
            </div>
            <p className="text-xs text-gray-400 mt-2">تاريخ الإصدار: {issueDate}</p>
            <p className="text-xs text-gray-400 mt-1">الحالة: <span className="text-[#D4AF37] font-bold">{statusLabel}</span></p>
          </div>
        </div>
        <div className="mt-5 h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"></div>
      </div>

      <div className="px-12 py-5 bg-[#faf8f0] border-b-4 border-[#D4AF37]">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">فاتورة إلى</p>
            <p className="text-lg font-black text-gray-900">{booking.clientName}</p>
            <p className="text-sm text-gray-600 mt-1" dir="ltr">{booking.clientPhone}</p>
            {booking.clientEmail && <p className="text-sm text-gray-600">{booking.clientEmail}</p>}
          </div>
          <div className="text-left">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">الفنان</p>
            <div className="flex items-center gap-3 justify-end">
              <div className="text-right">
                <p className="text-lg font-black text-gray-900">{booking.artist?.name}</p>
                <p className="text-sm text-gray-600">{booking.artist?.category || "فنان"}</p>
              </div>
              {booking.artist?.profileImage ? (
                <img src={booking.artist.profileImage} alt="" className="w-14 h-14 rounded-2xl object-cover" />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#b8941f] flex items-center justify-center"><span className="text-[#111] text-2xl font-black">{booking.artist?.name?.charAt(0) || "ف"}</span></div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-12 py-5">
        <h3 className="text-base font-black text-gray-900 mb-3 flex items-center gap-2"><div className="w-1 h-5 bg-[#D4AF37] rounded"></div>تفاصيل الحجز</h3>
        <table className="w-full border-collapse text-sm">
          <thead><tr className="bg-[#0a0a0a] text-white"><th className="px-3 py-2.5 text-right text-xs font-bold">التاريخ</th><th className="px-3 py-2.5 text-center text-xs font-bold">الفترة</th><th className="px-3 py-2.5 text-right text-xs font-bold">المكان</th><th className="px-3 py-2.5 text-right text-xs font-bold">المنطقة</th></tr></thead>
          <tbody><tr className="border-b border-gray-200 bg-white"><td className="px-3 py-3 font-bold">{eventDate}</td><td className="px-3 py-3 text-center">{booking.timeSlot}</td><td className="px-3 py-3">{booking.venue?.name || "سيتم تحديده"}</td><td className="px-3 py-3">{booking.region || "—"}</td></tr></tbody>
        </table>
      </div>

      <div className="px-12 py-5">
        <h3 className="text-base font-black text-gray-900 mb-3 flex items-center gap-2"><div className="w-1 h-5 bg-[#D4AF37] rounded"></div>التفاصيل المالية</h3>
        <table className="w-full border-collapse">
          <thead><tr className="bg-[#0a0a0a] text-white"><th className="px-4 py-3 text-right text-xs font-bold">#</th><th className="px-4 py-3 text-right text-xs font-bold">البيان</th><th className="px-4 py-3 text-center text-xs font-bold">المبلغ</th></tr></thead>
          <tbody>
            <tr className="border-b border-gray-200 bg-white"><td className="px-4 py-3 text-gray-500 font-mono text-xs">01</td><td className="px-4 py-3 font-bold">أجر الفنان الأساسي</td><td className="px-4 py-3 text-center font-bold">{basePrice.toLocaleString()} ج.م</td></tr>
            {travelFee > 0 && <tr className="border-b border-gray-200 bg-gray-50"><td className="px-4 py-3 text-gray-500 font-mono text-xs">02</td><td className="px-4 py-3 font-bold">رسوم السفر</td><td className="px-4 py-3 text-center font-bold">+ {travelFee.toLocaleString()} ج.م</td></tr>}
            <tr className="bg-[#1a1a1a] text-white font-black"><td colSpan={2} className="px-4 py-3 text-right">الإجمالي المستحق</td><td className="px-4 py-3 text-center text-[#D4AF37] text-lg">{grossAmount.toLocaleString()} ج.م</td></tr>
            <tr className="border-b border-gray-200 bg-green-50"><td colSpan={2} className="px-4 py-3 font-bold text-green-800">✓ المدفوع</td><td className="px-4 py-3 text-center font-black text-green-700">{totalPaid.toLocaleString()} ج.م</td></tr>
            {remaining > 0 && <tr className="bg-white"><td colSpan={2} className="px-4 py-3 font-bold text-gray-700">المتبقي</td><td className="px-4 py-3 text-center font-black text-red-600">{remaining.toLocaleString()} ج.م</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="px-12 py-4 bg-[#faf8f0] border-t border-b border-gray-200">
        <h4 className="text-sm font-black text-gray-900 mb-2">الشروط والأحكام</h4>
        <ol className="list-decimal list-inside space-y-1 text-[11px] text-gray-700 leading-relaxed">
          <li>هذه الفاتورة صادرة رسمياً من {STUDIO.nameAr} ومرخصة برقم {STUDIO.licenseNumber}.</li>
          <li>يُعتبر الحجز مؤكداً نهائياً بعد سداد العربون أو كامل المبلغ واستلام إشعار التأكيد.</li>
          <li>في حال إلغاء الحجز قبل 72 ساعة، يُخصم 25% من قيمة العربون كمصاريف إدارية.</li>
          <li>في حال إلغاء الحجز خلال أقل من 72 ساعة، لا يُسترد العربون.</li>
          <li>في حال اعتذار الفنان لظروف قهرية، يُرد كامل المبلغ أو يُعاد جدولة الحجز باتفاق الطرفين.</li>
          <li>يلتزم العميل بتوفير مكان مناسب وآمن للفنان ومعدات الصوت المتفق عليها.</li>
          <li>أي تعديلات يجب إبلاغ المنصة بها قبل 48 ساعة على الأقل.</li>
          <li>يمكن التحقق من صحة هذه الفاتورة بمسح رمز QR أدناه.</li>
        </ol>
      </div>

      <div className="px-12 py-6 bg-gradient-to-b from-white to-[#faf8f0]">
        <div className="grid grid-cols-3 gap-6 items-center">
          <div className="text-right">
            <p className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">تواصل معنا</p>
            <div className="space-y-1 text-[11px] text-gray-700">
              <p dir="ltr" className="text-right">{STUDIO.phone}</p>
              <p>{STUDIO.email}</p>
              <p>{STUDIO.address}</p>
              <p dir="ltr" className="text-right font-mono text-[#D4AF37]">{STUDIO.website.replace("https://", "")}</p>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center">
            <div className="relative">
              <div className="w-28 h-28 rounded-full border-4 border-[#D4AF37] flex items-center justify-center" style={{ transform: "rotate(-15deg)", boxShadow: "inset 0 0 0 2px #D4AF37, 0 0 0 2px #D4AF37" }}>
                <div className="text-center">
                  <p className="text-[7px] font-bold text-[#D4AF37] uppercase tracking-widest">{STUDIO.name}</p>
                  <p className="text-[10px] font-black text-[#D4AF37] my-1">✦ معتمد ✦</p>
                  <p className="text-[8px] font-black text-[#D4AF37]">APPROVED</p>
                  <p className="text-[7px] text-[#D4AF37] mt-1 font-mono" dir="ltr">{new Date().getFullYear()}</p>
                </div>
              </div>
              <div className="absolute inset-0 rounded-full border-2 border-[#D4AF37]" style={{ transform: "rotate(-15deg) scale(1.15)", opacity: 0.5 }}></div>
            </div>
            <p className="text-[9px] text-gray-500 mt-2 font-bold uppercase tracking-widest">ختم المنصة الرسمي</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-white p-2.5 rounded-xl border-2 border-[#D4AF37] shadow-lg">
              <div style="width:95px;height:95px;border:2px solid #D4AF37;border-radius:8px;display:flex;align-items:center;justify-content:center;background:white"><p style="font-size:8px;color:#666;text-align:center;word-break:break-all;padding:4px">امسح للتحقق<br/>{verifyUrl.replace("https://","")}</p></div>
            </div>
            <p className="text-[9px] text-gray-500 mt-2 font-bold uppercase tracking-wider">امسح للتحقق</p>
            <p className="text-[8px] text-gray-400 mt-1 font-mono" dir="ltr">{invoiceNumber}</p>
          </div>
        </div>
        <div className="mt-5 h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"></div>
        <p className="mt-3 text-[10px] text-gray-500 text-center">© {new Date().getFullYear()} {STUDIO.name} — جميع الحقوق محفوظة | ترخيص <span className="font-mono">{STUDIO.licenseNumber}</span></p>
      </div>

      <div className="h-3 bg-gradient-to-r from-[#D4AF37] via-[#f4e5b8] to-[#D4AF37]"></div>
    </div>
  )
}