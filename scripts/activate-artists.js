const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const updated = await prisma.artist.updateMany({
    where: { status: { not: "ACTIVE" } },
    data: { status: "ACTIVE" }
  })
  console.log(`✅ Activated ${updated.count} artists`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())