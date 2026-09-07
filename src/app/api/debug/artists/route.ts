import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const total = await prisma.artist.count()
    const active = await prisma.artist.count({ where: { status: "ACTIVE" } })
    const sample = await prisma.artist.findFirst({ select: { id: true, name: true, slug: true, status: true } })
    return NextResponse.json({ ok: true, total, active, sample })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}