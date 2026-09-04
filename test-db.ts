import { prisma } from "./src/lib/prisma"

async function main() {
  try {
    const count = await prisma.artist.count({
      where: { status: "ACTIVE" }
    })
    console.log(`✅ قاعدة البيانات تعمل - عدد الفنانين النشطين: ${count}`)
    
    const artists = await prisma.artist.findMany({
      where: { status: "ACTIVE" },
      select: { name: true, slug: true },
      take: 3
    })
    artists.forEach(a => console.log(`  - ${a.name} (${a.slug})`))
  } catch (error: any) {
    console.error("❌ خطأ في الاتصال:", error.message)
  }
}

main().finally(() => prisma.$disconnect())