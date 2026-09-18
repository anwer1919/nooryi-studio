import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  ArrowLeft, Calendar, MapPin, User, Music, DollarSign,
  CheckCircle2, XCircle, Clock, FileText, Phone, Mail, Printer
} from "lucide-react";
import BookingActions from "./BookingActions";

export const dynamic = "force-dynamic";

const safeFormatDate = (dateInput: any, includeTime = false) => {
  if (!dateInput) return "غير محدد";
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return "تاريخ غير صالح";
    return date.toLocaleDateString("ar-EG", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
      timeZone: "UTC",
      ...(includeTime ? { hour: "2-digit", minute: "2-digit", timeZone: "UTC" } : {}),
    });
  } catch {
    return "غير محدد";
  }
};

export default async function BookingDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userRole = session.user.role || "USER";
  const isAdmin = userRole === "SUPER_ADMIN" || userRole === "ADMIN";
  const isManager = userRole === "ARTIST_MANAGER";
  if (!isAdmin && !isManager) redirect("/");

  const { id } = await params;
  let booking: any = null;

  try {
    booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        artist: { select: { id: true, name: true, slug: true, category: true, profileImage: true } },
        venue: { select: { id: true, name: true, address: true, city: true } },
      },
    });
  } catch (error: any) {
    console.error("DB Error:", error.message);
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
        <div className="dash-card text-center max-w-md">
          <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
          <h2 className="card-title text-2xl mb-2">الحجز غير موجود</h2>
          <Link href="/admin/bookings" className="btn-primary inline-block mt-4">
            العودة للحجوزات
          </Link>
        </div>
      </div>
    );
  }

  // فحص صلاحية مدير الأعمال
  if (isManager && booking) {
    const mgrUser = await prisma.user.findUnique({
      where: { id: (session.user as any).id },
      select: { artistId: true },
    });
    if (mgrUser?.artistId && booking.artistId !== mgrUser.artistId) redirect("/admin");
  }

  const grossAmount = Number(booking.grossAmount || 0);
  const depositAmount = Number(booking.depositAmount || 0);
  const remainingAmount = Number(booking.remainingAmount || 0);

  const statusConfig: Record<string, { label: string; cls: string; icon: any }> = {
    PENDING_APPROVAL: { label: "قيد المراجعة", cls: "pending", icon: Clock },
    APPROVED: { label: "تمت الموافقة", cls: "confirmed", icon: CheckCircle2 },
    CONFIRMED: { label: "مؤكد", cls: "confirmed", icon: CheckCircle2 },
    COMPLETED: { label: "مكتمل", cls: "confirmed", icon: CheckCircle2 },
    CANCELLED: { label: "ملغى", cls: "cancelled", icon: XCircle },
    REJECTED: { label: "مرفوض", cls: "cancelled", icon: XCircle },
  };

  const status = statusConfig[booking.status] || statusConfig.PENDING_APPROVAL;
  const StatusIcon = status.icon;
  const clientName = booking.clientName || "غير محدد";
  const timeSlotLabels: Record<string, string> = {
    MORNING: "صباحاً", AFTERNOON: "ظهراً", EVENING: "مساءً", NIGHT: "ليلاً",
  };
  const timeSlotLabel = timeSlotLabels[booking.timeSlot] || booking.timeSlot || "غير محدد";

  return (
    <div className="min-h-screen bg-bg p-4 lg:p-8 pt-20 lg:pt-8 pb-24 md:pb-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin/bookings" className="inline-flex items-center gap-2 text-[var(--c-orange)] hover:text-[var(--c-fg)] font-bold mb-4 transition">
            <ArrowLeft size={20} /> العودة للحجوزات
          </Link>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-display mb-2">تفاصيل الحجز</h1>
              <p className="text-[var(--c-muted)]">
                رقم الحجز: <span className="font-mono font-bold text-[var(--c-orange)]">{booking.id.slice(0, 8).toUpperCase()}</span>
              </p>
            </div>
            <span className={`status-badge ${status.cls} text-base px-6 py-3`}>
              <StatusIcon size={20} /> {status.label}
            </span>
          </div>
        </div>

        {/* Invoice Button */}
        <div className="dash-card mb-6">
          <Link
            href={`/invoice/print?id=${booking.id}`}
            target="_blank"
            className="btn-primary inline-flex items-center gap-2"
          >
            <FileText size={20} /> عرض الفاتورة
          </Link>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Client */}
          <div className="dash-card">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[var(--c-border)]">
              <div className="w-12 h-12 rounded-xl bg-[var(--c-orange)] flex items-center justify-center">
                <User size={24} className="text-black" />
              </div>
              <h3 className="card-title text-lg">بيانات العميل</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-[var(--c-muted)] font-semibold mb-1">الاسم</p>
                <p className="font-bold text-[var(--c-fg)]">{clientName}</p>
              </div>
              {booking.clientEmail && (
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-[var(--c-orange)]" />
                  <p className="text-sm text-[var(--c-muted)]">{booking.clientEmail}</p>
                </div>
              )}
              {booking.clientPhone && (
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-[var(--c-orange)]" />
                  <p className="text-sm text-[var(--c-muted)]" dir="ltr">{booking.clientPhone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Artist */}
          <div className="dash-card">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[var(--c-border)]">
              <div className="w-12 h-12 rounded-xl bg-[var(--c-orange)] flex items-center justify-center">
                <Music size={24} className="text-black" />
              </div>
              <h3 className="card-title text-lg">الفنان</h3>
            </div>
            {booking.artist ? (
              <div className="flex items-center gap-4">
                {booking.artist.profileImage ? (
                  <img src={booking.artist.profileImage} alt={booking.artist.name} className="w-16 h-16 rounded-xl object-cover border border-[var(--c-border)]" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-[var(--c-orange)] flex items-center justify-center text-black font-bold text-2xl">
                    {booking.artist.name?.charAt(0) || "ف"}
                  </div>
                )}
                <div>
                  <span className="font-bold text-[var(--c-fg)] text-lg block">{booking.artist.name}</span>
                  <p className="text-sm text-[var(--c-orange)]">{booking.artist.category || "غير محدد"}</p>
                </div>
              </div>
            ) : (
              <p className="text-[var(--c-muted)] italic">لا توجد معلومات</p>
            )}
          </div>

          {/* Venue */}
          <div className="dash-card">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[var(--c-border)]">
              <div className="w-12 h-12 rounded-xl bg-[var(--c-orange)] flex items-center justify-center">
                <MapPin size={24} className="text-black" />
              </div>
              <h3 className="card-title text-lg">مكان الفعالية</h3>
            </div>
            {booking.venue ? (
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-[var(--c-muted)] font-semibold mb-1">اسم المكان</p>
                  <p className="font-bold text-[var(--c-fg)]">{booking.venue.name}</p>
                </div>
                {booking.venue.address && (
                  <div>
                    <p className="text-xs text-[var(--c-muted)] font-semibold mb-1">العنوان</p>
                    <p className="text-sm text-[var(--c-muted)]">{booking.venue.address}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-[var(--c-muted)] italic">لا توجد معلومات</p>
            )}
          </div>
        </div>

        {/* Details + Financial */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Booking Details */}
          <div className="dash-card">
            <h3 className="card-title text-xl mb-6 pb-4 border-b border-[var(--c-border)] flex items-center gap-2">
              <Calendar size={24} className="text-[var(--c-orange)]" /> تفاصيل الحجز
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-[var(--c-border)]">
                <span className="text-[var(--c-muted)] font-medium">تاريخ الفعالية:</span>
                <span className="font-bold text-[var(--c-fg)]">{safeFormatDate(booking.date)}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-[var(--c-border)]">
                <span className="text-[var(--c-muted)] font-medium">وقت الحجز:</span>
                <span className="font-bold text-[var(--c-fg)]">{timeSlotLabel}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-[var(--c-border)]">
                <span className="text-[var(--c-muted)] font-medium">تاريخ الإنشاء:</span>
                <span className="font-bold text-[var(--c-fg)] text-sm">{safeFormatDate(booking.createdAt, true)}</span>
              </div>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="dash-card">
            <h3 className="card-title text-xl mb-6 pb-4 border-b border-[var(--c-border)] flex items-center gap-2">
              <DollarSign size={24} className="text-[var(--c-orange)]" /> الملخص المالي
            </h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center pb-3 border-b border-[var(--c-border)]">
                <span className="text-[var(--c-muted)] font-medium">المبلغ الإجمالي:</span>
                <span className="font-bold text-[var(--c-fg)] text-lg">{grossAmount.toLocaleString("en-US")} ج.م</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-[var(--c-border)]">
                <span className="text-[var(--c-muted)] font-medium">العربون المدفوع:</span>
                <span className="font-bold text-green-500 text-lg">{depositAmount.toLocaleString("en-US")} ج.م</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-[var(--c-border)]">
                <span className="text-[var(--c-muted)] font-medium">المبلغ المتبقي:</span>
                <span className={`font-bold text-lg ${remainingAmount > 0 ? "text-red-500" : "text-green-500"}`}>
                  {remainingAmount.toLocaleString("en-US")} ج.م
                </span>
              </div>
            </div>
            <div className="bg-[var(--c-orange)] p-6 rounded-xl">
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg text-black">الإجمالي النهائي:</span>
                <span className="font-black text-3xl text-black">{grossAmount.toLocaleString("en-US")} ج.م</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6">
          <BookingActions
            bookingId={booking.id}
            status={booking.status}
            artistName={booking.artist?.name || "غير محدد"}
            clientName={clientName}
            clientPhone={booking.clientPhone || ""}
            clientEmail={booking.clientEmail || ""}
            depositAmount={depositAmount}
            totalAmount={grossAmount}
            date={booking.date ? new Date(booking.date).toLocaleDateString("ar-EG") : ""}
            timeSlot={timeSlotLabel}
            venue={booking.venue?.name || "غير محدد"}
          />
        </div>
      </div>
    </div>
  );
}
