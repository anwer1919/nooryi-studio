import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting database seeding...")

  // ============================================
  // 1. إنشاء السوبر أدمن
  // ============================================
  const superAdminPassword = await bcrypt.hash("admin123", 10)
  const superAdmin = await prisma.user.upsert({
    where: { email: "superadmin@nooryi.com" },
    update: {},
    create: {
      name: "السوبر أدمن",
      email: "superadmin@nooryi.com",
      password: superAdminPassword,
      role: "SUPER_ADMIN",
    },
  })
  console.log("✅ Super Admin created:", superAdmin.email)
  console.log("   🔑 Password: admin123")

  // ============================================
  // 2. إنشاء فنان تجريبي (أحمد)
  // ============================================
  const artist = await prisma.artist.upsert({
    where: { slug: "ahmed" },
    update: {},
    create: {
      name: "أحمد",
      slug: "ahmed",
      category: "Singer",
      bio: "فنان محترف متخصص في إحياء حفلات الزفاف والمناسبات الخاصة. خبرة أكثر من 10 سنوات في مجال الغناء العربي والأجانب.",
      accentColor: "#D4AF37",
      status: "ACTIVE",
    },
  })
  console.log("✅ Artist created:", artist.name)

  // ============================================
  // 3. إنشاء أدمن للفنان (Artist Admin)
  // ============================================
  const artistAdminPassword = await bcrypt.hash("artist123", 10)
  const artistAdmin = await prisma.user.upsert({
    where: { email: "artist@nooryi.com" },
    update: {},
    create: {
      name: "أدمن أحمد",
      email: "artist@nooryi.com",
      password: artistAdminPassword,
      role: "ARTIST_ADMIN",
      artistId: artist.id,
    },
  })
  console.log("✅ Artist Admin created:", artistAdmin.email)
  console.log("   🔑 Password: artist123")

  // ربط الأدمن بالفنان
  await prisma.artist.update({
    where: { id: artist.id },
    data: { adminUserId: artistAdmin.id },
  })

  // ============================================
  // 4. إضافة أسعار للفنان في عدة محافظات
  // ============================================
  const prices = [
    { governorate: "القاهرة", basePrice: 10000, transportationFee: 500 },
    { governorate: "الجيزة", basePrice: 10000, transportationFee: 800 },
    { governorate: "الإسكندرية", basePrice: 12000, transportationFee: 2000 },
    { governorate: "الدقهلية", basePrice: 11000, transportationFee: 1500 },
    { governorate: "الشرقية", basePrice: 11000, transportationFee: 1500 },
    { governorate: "القليوبية", basePrice: 10000, transportationFee: 700 },
    { governorate: "المنوفية", basePrice: 10500, transportationFee: 1000 },
    { governorate: "الغربية", basePrice: 11000, transportationFee: 1200 },
    { governorate: "كفر الشيخ", basePrice: 11500, transportationFee: 1500 },
    { governorate: "البحيرة", basePrice: 11500, transportationFee: 1800 },
    { governorate: "المنيا", basePrice: 12000, transportationFee: 2500 },
    { governorate: "بني سويف", basePrice: 11500, transportationFee: 2000 },
    { governorate: "الفيوم", basePrice: 11500, transportationFee: 2000 },
    { governorate: "أسيوط", basePrice: 13000, transportationFee: 3000 },
    { governorate: "سوهاج", basePrice: 13500, transportationFee: 3500 },
    { governorate: "قنا", basePrice: 14000, transportationFee: 4000 },
    { governorate: "الأقصر", basePrice: 15000, transportationFee: 4500 },
    { governorate: "أسوان", basePrice: 16000, transportationFee: 5000 },
  ]

  for (const price of prices) {
    await prisma.pricing.upsert({
      where: {
        artistId_governorate: {
          artistId: artist.id,
          governorate: price.governorate,
        },
      },
      update: {},
      create: {
        artistId: artist.id,
        governorate: price.governorate,
        basePrice: price.basePrice,
        transportationFee: price.transportationFee,
      },
    })
  }
  console.log(`✅ Added ${prices.length} pricing entries for ${artist.name}`)

  // ============================================
  // 5. إنشاء مواعيد متاحة للفنان (90 يوم)
  // ============================================
  const timeSlots: ("MORNING" | "AFTERNOON" | "EVENING")[] = ["MORNING", "AFTERNOON", "EVENING"]
  let slotsCreated = 0

  for (let i = 1; i <= 90; i++) {
    const date = new Date()
    date.setDate(date.getDate() + i)
    date.setHours(0, 0, 0, 0)

    for (const timeSlot of timeSlots) {
      await prisma.availability.upsert({
        where: {
          artistId_date_timeSlot: {
            artistId: artist.id,
            date,
            timeSlot,
          },
        },
        update: {},
        create: {
          artistId: artist.id,
          date,
          timeSlot,
          status: "AVAILABLE",
        },
      })
      slotsCreated++
    }
  }
  console.log(`✅ Created ${slotsCreated} availability slots for ${artist.name}`)

  // ============================================
  // 6. إنشاء عميل تجريبي (اختياري)
  // ============================================
  const clientPassword = await bcrypt.hash("client123", 10)
  const client = await prisma.user.upsert({
    where: { email: "client@nooryi.com" },
    update: {},
    create: {
      name: "عميل تجريبي",
      email: "client@nooryi.com",
      password: clientPassword,
      role: "CLIENT",
    },
  })

  await prisma.customer.upsert({
    where: { userId: client.id },
    update: {},
    create: {
      userId: client.id,
      fullName: "عميل تجريبي",
      phone: "01012345678",
    },
  })
  console.log("✅ Test Client created:", client.email)
  console.log("   🔑 Password: client123")

  console.log("\n🎉 Database seeding completed successfully!")
  console.log("\n📋 Login Credentials:")
  console.log("   👑 Super Admin: superadmin@nooryi.com / admin123")
  console.log("   🎤 Artist Admin: artist@nooryi.com / artist123")
  console.log("   👤 Client: client@nooryi.com / client123")
  console.log("\n🎨 Test Artist: Ahmed (slug: ahmed)")
  console.log("💰 Prices added for 18 governorates")
  console.log("📅 90 days of availability created")
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })