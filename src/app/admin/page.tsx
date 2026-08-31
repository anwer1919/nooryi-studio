import Link from "next/link"

export const dynamic = "force-dynamic"

export default function AdminDashboardPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Link href="/admin/bookings" className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
        <h3 className="text-lg font-bold text-gray-900 mb-2">الحجوزات</h3>
        <p className="text-gray-600 text-sm">إدارة جميع الحجوزات</p>
      </Link>

      <Link href="/admin/artists" className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
        <h3 className="text-lg font-bold text-gray-900 mb-2">الفنانين</h3>
        <p className="text-gray-600 text-sm">إدارة الفنانين</p>
      </Link>

      <Link href="/admin/stats" className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
        <h3 className="text-lg font-bold text-gray-900 mb-2">التقارير</h3>
        <p className="text-gray-600 text-sm">التقارير المالية</p>
      </Link>
    </div>
  )
}