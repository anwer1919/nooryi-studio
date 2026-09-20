import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const { artistId, regionName, basePrice, travelFee } = body;
    if (!artistId || !regionName || basePrice === undefined) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    const region = await prisma.pricingRegion.create({
      data: { artistId, regionName, basePrice: Number(basePrice), travelFee: travelFee ? Number(travelFee) : 0 }
    });
    return NextResponse.json(region);
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    await prisma.pricingRegion.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
