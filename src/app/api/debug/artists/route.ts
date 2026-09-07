import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const result: any = { ok: true }
  try {
    result.total = await prisma.artist.count()
    result.active = await prisma.artist.count({ where: { status: "ACTIVE" } })
  } catch (e: any) {
    result.countError = e.message
  }
  try {
    // هذا هو نفس نوع الاستعلام الذي تستخدمه الصفحة الرئيسية (SELECT *)
    const full = await prisma.artist.findFirst({ where: { status: "ACTIVE" } })
    result.fullQueryWorks = !!full
    result.firstArtist = full?.name || null
  } catch (e: any) {
    result.fullQueryWorks = false
    result.fullQueryError = e.message
  }
  return NextResponse.json(result)
}