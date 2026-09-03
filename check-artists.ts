import { prisma } from "./src/lib/prisma"

async function main() {
  const artists = await prisma.artist.findMany({
    select: { 
      id: true, 
      name: true, 
      slug: true, 
      status: true,
      createdAt: true 
    },
    orderBy: { createdAt: "desc" }
  })
  
  console.log("Total artists:", artists.length)
  artists.forEach(a => {
    console.log(`  ${a.name} | slug: ${a.slug} | status: ${a.status} | created: ${a.createdAt}`)
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())