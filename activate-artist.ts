import { prisma } from "./src/lib/prisma"

async function main() {
  const result = await prisma.artist.updateMany({
    where: { slug: "Mahmmod" },
    data: { status: "ACTIVE" }
  })
  console.log(`✅ تم تحديث ${result.count} فنان إلى ACTIVE`)
  
  const all = await prisma.artist.findMany({
    select: { name: true, slug: true, status: true }
  })
  console.log("\nالوضع الجديد:")
  all.forEach(a => console.log(`  ${a.name} (${a.slug}) - ${a.status}`))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())