import { Suspense } from "react"
import PrintReportContent from "./PrintReportContent"

export const dynamic = "force-dynamic"

export default function PrintReportPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-black border-t-[#D4AF37] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 font-bold text-lg">جاري إعداد التقرير المالي...</p>
        </div>
      </div>
    }>
      <PrintReportContent />
    </Suspense>
  )
}