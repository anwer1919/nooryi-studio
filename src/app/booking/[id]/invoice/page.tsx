"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer"
import { Download, FileText, Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import BookingInvoice from "@/components/BookingInvoice"
import FluidBackground from "@/components/FluidBackground"

interface BookingData {
  id: string
  date: string
  timeSlot: string
  grossAmount: number | null
  depositAmount: number | null
  remainingAmount: number | null
  clientName: string | null
  clientPhone: string | null
  clientEmail: string | null
  createdAt: string
  artist: { name: string }
  venue: { name: string; address: string }
}

export default function InvoicePage() {
  const params = useParams()
  const bookingId = params.id as string
  
  const [booking, setBooking] = useState<BookingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch(`/api/bookings/${bookingId}`)
      .then(res => {
        if (!res.ok) throw new Error("Booking not found")
        return res.json()
      })
      .then(data => {
        setBooking(data)
        setLoading(false)
      })
      .catch(err => {
        setError("فشل تحميل بيانات الحجز")
        setLoading(false)
      })
  }, [bookingId])

  if (loading) {
    return (
      <div className="relative min-h-screen bg-[#1a0a04]">
        <FluidBackground scrimStrength="strong" />
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <Loader2 className="animate-spin text-yellow-500" size={40} />
        </div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="relative min-h-screen bg-[#1a0a04]">
        <FluidBackground scrimStrength="strong" />
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center text-white">
          <p className="text-xl text-red-400 mb-4">{error || "الحجز غير موجود"}</p>
          <Link href="/my-bookings" className="text-yellow-500 hover:text-yellow-400 flex items-center gap-2">
            <ArrowLeft size={20} /> العودة للحجوزات
          </Link>
        </div>
      </div>
    )
  }

  const invoiceData = {
    bookingId: booking.id,
    date: new Date(booking.date).toLocaleDateString("ar-EG", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    artistName: booking.artist.name,
    clientName: booking.clientName || "غير محدد",
    clientPhone: booking.clientPhone || "غير محدد",
    clientEmail: booking.clientEmail || undefined,
    venueName: booking.venue.name,
    venueAddress: booking.venue.address || undefined,
    timeSlot: booking.timeSlot,
    grossAmount: booking.grossAmount || 0,
    depositAmount: booking.depositAmount || 0,
    remainingAmount: booking.remainingAmount || 0,
    status: "APPROVED",
    createdAt: new Date(booking.createdAt).toLocaleDateString("ar-EG"),
  }

  return (
    <div className="relative min-h-screen bg-[#1a0a04]">
      <FluidBackground scrimStrength="strong" />

      <div className="relative z-10 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Link
              href="/my-bookings"
              className="flex items-center gap-2 text-white/60 hover:text-white transition"
            >
              <ArrowLeft size={20} />
              العودة للحجوزات
            </Link>
            <h1 className="text-2xl font-bold text-white">فاتورة الحجز</h1>
          </div>

          {/* Actions */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                  <FileText size={24} className="text-yellow-500" />
                </div>
                <div>
                  <p className="text-white font-bold">فاتورة رقم</p>
                  <p className="text-white/60 text-sm font-mono">
                    {booking.id.slice(0, 8).toUpperCase()}
                  </p>
                </div>
              </div>
              
              <PDFDownloadLink
                document={<BookingInvoice data={invoiceData} />}
                fileName={`فاتورة-حجز-${booking.id.slice(0, 8)}.pdf`}
                className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-black font-bold py-3 px-6 rounded-lg transition"
              >
                {({ loading }) =>
                  loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      جاري التحميل...
                    </>
                  ) : (
                    <>
                      <Download size={18} />
                      تحميل PDF
                    </>
                  )
                }
              </PDFDownloadLink>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
            <PDFViewer width="100%" height="800">
              <BookingInvoice data={invoiceData} />
            </PDFViewer>
          </div>
        </div>
      </div>
    </div>
  )
}