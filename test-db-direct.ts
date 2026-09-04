import { PrismaClient } from "@prisma/client"

// استخدام رابط مباشر بدلاً من pooler
const directUrl = process.env.DATABASE_URL?.replace("-pooler", "") || process.env.DATABASE_URL

console.log("الرابط المستخدم:", directUrl?.substring(0, 50) + "...")

const prisma = new PrismaClient({
  datasources: {
    db: { url: directUrl }
  }
})

async function main() {
  try {
    const count = await prisma.artist.count({
      where: { status: "ACTIVE" }
    })
    console.log(`✅ قاعدة البيانات تعمل - عدد الفنانين النشطين: ${count}`)
  } catch (error: any) {
    console.error("❌ خطأ:", error.message)
  }
}

main().finally(() => prisma.$disconnect())