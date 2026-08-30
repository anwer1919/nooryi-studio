import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export default async function ArtistDetailsPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  const { slug } = await params

  let artist: any = null
  let error: string | null = null

  try {
    // جلب الفنان بدون علاقات معقدة أولاً
    artist = await prisma.artist.findUnique({
      where: { slug },
    })
  } catch (err: any) {
    error = err.message
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold text-purple-700 mb-6">
          صفحة تشخيص الفنان
        </h1>

        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="font-bold text-blue-900">✅ الجلسة:</p>
            <p className="text-blue-700">
              المستخدم: {session.user.name || session.user.email}
            </p>
            <p className="text-blue-700">
              الدور: {session.user.role}
            </p>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="font-bold text-purple-900">🔍 Slug الفنان:</p>
            <p className="text-purple-700 font-mono">{slug}</p>
          </div>

          {error && (
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="font-bold text-red-900">❌ خطأ في قاعدة البيانات:</p>
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {artist ? (
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="font-bold text-green-900">✅ تم العثور على الفنان:</p>
              <pre className="text-green-700 text-sm mt-2 overflow-auto">
                {JSON.stringify(artist, null, 2)}
              </pre>
            </div>
          ) : (
            !error && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="font-bold text-yellow-900">⚠️ الفنان غير موجود</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}