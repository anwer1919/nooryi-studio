import { prisma } from "./src/lib/prisma"

// دالة توليد slug لاتيني
function generateLatinSlug(name: string): string {
  const arabicToLatin: Record<string, string> = {
    "ا": "a", "أ": "a", "إ": "i", "آ": "a", "ب": "b", "ت": "t", "ث": "th",
    "ج": "j", "ح": "h", "خ": "kh", "د": "d", "ذ": "dh", "ر": "r", "ز": "z",
    "س": "s", "ش": "sh", "ص": "s", "ض": "d", "ط": "t", "ظ": "z",
    "ع": "a", "غ": "gh", "ف": "f", "ق": "q", "ك": "k", "ل": "l", "م": "m",
    "ن": "n", "ه": "h", "و": "w", "ي": "y", "ى": "a", "ة": "a", "ئ": "e", "ء": "e",
    " ": "-", "-": "-", "_": "-"
  };
  
  let latin = "";
  for (const char of name) {
    if (arabicToLatin[char]) {
      latin += arabicToLatin[char];
    } else if (/[a-zA-Z0-9]/.test(char)) {
      latin += char;
    } else if (char === " " || char === "-" || char === "_") {
      latin += "-";
    }
  }
  
  const cleaned = latin
    .toLowerCase()
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  
  return cleaned || "artist-" + Date.now().toString(36);
}

async function main() {
  console.log("=== تحديث slugs الفنانين الحاليين ===\n")
  
  const artists = await prisma.artist.findMany({
    select: { id: true, name: true, slug: true }
  })
  
  for (const artist of artists) {
    // التحقق إذا كان الـ slug يحتوي على حروف عربية
    const hasArabic = /[\u0600-\u06FF]/.test(artist.slug)
    
    if (hasArabic) {
      const newSlug = generateLatinSlug(artist.name)
      console.log(`تحديث: ${artist.name}`)
      console.log(`  من: ${artist.slug}`)
      console.log(`  إلى: ${newSlug}\n`)
      
      await prisma.artist.update({
        where: { id: artist.id },
        data: { slug: newSlug }
      })
    } else {
      console.log(`✓ ${artist.name} - slug سليم: ${artist.slug}\n`)
    }
  }
  
  console.log("✅ تم التحديث بنجاح!")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())