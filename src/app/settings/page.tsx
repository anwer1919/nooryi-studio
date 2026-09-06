import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import SettingsForm from "./SettingsForm"

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, phone: true }
  })

  return (
    <div className="min-h-screen bg-[#faf8f0] py-12 px-4" dir="rtl">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-[#e8e4d9]">
        <div className="bg-gradient-to-r from-[#111] to-[#232323] p-8 text-white">
          <h1 className="text-2xl font-black mb-2">إعدادات الحساب</h1>
          <p className="text-gray-400 text-sm">قم بتحديث معلوماتك الشخصية وبيانات الاتصال</p>
        </div>
        <div className="p-8">
          <SettingsForm user={user} />
        </div>
      </div>
    </div>
  )
}