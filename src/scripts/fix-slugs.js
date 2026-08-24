const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

function generateSlug(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^\w\u0600-\u06FF\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

async function main() {
  console.log("🔧 Fixing artist slugs...")

  const artists = await prisma.artist.findMany()

  for (const artist of artists) {
    const currentSlug = artist.slug
    
    // تحقق لو الـ slug فيه مسافات أو يحتاج تنظيف
    if (currentSlug.includes(" ") || currentSlug !== generateSlug(currentSlug)) {
      let newSlug = generateSlug(artist.name)
      
      // تأكد أن الـ slug الجديد فريد
      const existing = await prisma.artist.findUnique({ where: { slug: newSlug } })
      if (existing && existing.id !== artist.id) {
        newSlug = `${newSlug}-${artist.id.slice(0, 8)}`
      }
      
      await prisma.artist.update({
        where: { id: artist.id },
        data: { slug: newSlug }
      })
      
      console.log(`✅ Fixed: "${currentSlug}" → "${newSlug}"`)
    } else {
      console.log(`✓ OK: "${currentSlug}"`)
    }
  }

  console.log("\n🎉 All slugs fixed!")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())