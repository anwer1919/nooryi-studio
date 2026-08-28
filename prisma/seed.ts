import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 جاري إعادة بناء قاعدة البيانات من الصفر...')

  // 1. مسح جميع البيانات القديمة لضمان نظافة القاعدة
  await prisma.payment.deleteMany()
  await prisma.review.deleteMany()
  await prisma.availability.deleteMany()
  await prisma.pricing.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.artist.deleteMany()
  await prisma.venue.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.user.deleteMany() // مسح المستخدمين القدامى

  // 2. ✨ إنشاء حساب الأدمن (هذا هو السبب في عدم قدرتك على الدخول سابقاً) ✨
  const hashedPassword = await bcrypt.hash("123456", 10)
  await prisma.user.create({
    data: {
      name: "المدير العام",
      email: "admin@nooryi.com",
      password: hashedPassword,
      role: "SUPER_ADMIN",
    },
  })
  console.log('✅ تم إنشاء حساب الأدمن بنجاح')

  // 3. إنشاء الأماكن
  const venue1 = await prisma.venue.create({
    data: { name: 'قاعة الرياض للمؤتمرات', address: 'طريق الملك فهد، الرياض', city: 'الرياض' },
  })
  const venue2 = await prisma.venue.create({
    data: { name: 'فندق الفورسيزونز', address: 'برج المملكة، الرياض', city: 'الرياض' },
  })

  // 4. إنشاء الفنانين
  const artist1 = await prisma.artist.create({
    data: {
      name: 'فرقة الطرب الأصيل', slug: 'tarab-aseel', category: 'موسيقى شرقية',
      bio: 'فرقة متخصصة في إحياء الليالي الشرقية.', status: 'ACTIVE', commissionRate: 15,
      profileImage: 'https://images.unsplash.com/photo-1514117445516-2ecfc9c4ec90?w=400',
      coverImage: 'https://images.unsplash.com/photo-1514117445516-2ecfc9c4ec90?w=800',
    },
  })
  const artist2 = await prisma.artist.create({
    data: {
      name: 'DJ أحمد', slug: 'dj-ahmed', category: 'موسيقى إلكترونية',
      bio: 'دي جي محترف لإحياء الحفلات.', status: 'ACTIVE', commissionRate: 20,
      profileImage: 'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=400',
      coverImage: 'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=800',
    },
  })

  // 5. إنشاء العملاء
  const customer1 = await prisma.customer.create({
    data: { fullName: 'خالد العتيبي', phone: '0501234567', email: 'khaled@example.com' },
  })

  // 6. إنشاء الحجوزات
  await prisma.booking.create({
    data: {
      artistId: artist1.id, customerId: customer1.id, venueId: venue1.id,
      clientName: customer1.fullName, clientPhone: customer1.phone, clientEmail: customer1.email,
      date: new Date('2024-12-15T20:00:00Z'), timeSlot: 'EVENING', status: 'APPROVED',
      grossAmount: 5000, depositAmount: 1000, remainingAmount: 4000,
    },
  })
  
  await prisma.booking.create({
    data: {
      artistId: artist2.id, customerId: customer1.id, venueId: venue2.id,
      clientName: customer1.fullName, clientPhone: customer1.phone, clientEmail: customer1.email,
      date: new Date('2024-12-20T22:00:00Z'), timeSlot: 'NIGHT', status: 'PENDING_APPROVAL',
      grossAmount: 3000, depositAmount: 600, remainingAmount: 2400,
    },
  })

  // 7. إنشاء التقييمات
  await prisma.review.createMany({
    data: [
      { artistId: artist1.id, rating: 5, comment: 'أداء رائع جداً واحترافية عالية!' },
      { artistId: artist2.id, rating: 4, comment: 'تجربة مميزة وأنصح بهم.' },
    ]
  })

  // 8. إنشاء المدفوعات
  await prisma.payment.create({
    data: { bookingId: (await prisma.booking.findFirst())!.id, amount: 1000, status: 'COMPLETED', method: 'CREDIT_CARD', notes: 'دفع العربون' }
  })

  console.log('🎉 تم تعبئة قاعدة البيانات بنجاح وشامل!')
  console.log('👤 تم إنشاء حساب أدمن: admin@nooryi.com / 123456')
}

main()
  .catch((e) => {
    console.error('❌ حدث خطأ:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })