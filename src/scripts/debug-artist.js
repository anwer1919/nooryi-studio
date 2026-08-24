const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

async function main() {
  console.log("🔍 Checking all artists:\n")
  
  const artists = await prisma.artist.findMany({
    select: { name: true, slug: true, status: true },
    orderBy: { createdAt: "desc" }
  })

  if (artists.length === 0) {
    console.log("❌ No artists found!")
    return
  }

  console.log(`✅ Found ${artists.length} artist(s):\n`)
  
  artists.forEach((artist, i) => {
    const slugEncoded = encodeURIComponent(artist.slug)
    const needsEncoding = artist.slug !== slugEncoded
    
    console.log(`${i + 1}. ${artist.name}`)
    console.log(`   Slug: "${artist.slug}"`)
    console.log(`   Status: ${artist.status}`)
    console.log(`   URL: /artists/${needsEncoding ? slugEncoded : artist.slug}`)
    if (needsEncoding) {
      console.log(`   ⚠️  Needs encoding!`)
    }
    console.log("")
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())