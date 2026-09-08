import { getManagerArtist } from "@/lib/managerAuth"
import { prisma } from "@/lib/prisma"
import { Calendar, Printer } from "lucide-react"
import ManagerCalendar from "./ManagerCalendar"

export const dynamic = "force-dynamic"

export default async function ArtistCalendarPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { artist } = await getManagerArtist(slug)

  // جلب الحجوزات المحجوزة
  const bookings = await prisma.booking.findMany({
    where: {
      artistId: artist.id,
      status: { in: ["CONFIRMED", "APPROVED", "COMPLETED", "ACCEPTED", "PENDING_APPROVAL"] },
    },
    select: { id: true, date: true, clientName: true, status: true, timeSlot: true },
    orderBy: { date: "asc" },
  })

  // جلب أيام التوفر
  const availability = await prisma.availability.findMany({
    where: { artistId: artist.id },
  }).catch(() => [])

  const bookedDates = bookings.map((b: any) => ({
    date: b.date ? new Date(b.date).toISOString().split("T")[0] : "",
    client: b.clientName,
    status: b.status,
    timeSlot: b.timeSlot,
  })).filter((b: any) => b.date)

  return (
    <div dir="rtl" className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4 no-print">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-2">
            <Calendar size={28} className="text-[#D4AF37]" /> تقويم {artist.name}
          </h1>
          <p className="text-gray-400 text-sm mt-1">{bookedDates.length} يوم محجوز</p>
        </div>
        <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] text-[#D4AF37] rounded-xl font-bold text-sm hover:bg-[#222] transition border border-[#D4AF37]/20">
          <Printer size={16} /> طباعة التقويم
        </button>
      </div>

      <ManagerCalendar artistName={artist.name} bookedDates={bookedDates} availability={availability} />

      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; background: white !important; color: black !important; padding: 20px; }
          .no-print { display: none !important; }
          @page { size: A4 landscape; margin: 8mm; }
        }
      `}</style>
    </div>
  )
}