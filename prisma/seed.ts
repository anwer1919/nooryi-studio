import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 جاري تعبئة قاعدة البيانات بالبيانات الشاملة...')

  // 1. تنظيف البيانات القديمة
  await prisma.payment.deleteMany()
  await prisma.review.deleteMany()
  await prisma.availability.deleteMany()
  await prisma.pricing.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.artist.deleteMany()
  await prisma.venue.deleteMany()
  await prisma.customer.deleteMany()

  // 2. إنشاء الأماكن (Venues)
  const venue1 = await prisma.venue.create({
    data: { name: 'قاعة الرياض للمؤتمرات', address: 'طريق الملك فهد، الرياض', city: 'الرياض' },
  })
  const venue2 = await prisma.venue.create({
    data: { name: 'فندق الفورسيزونز', address: 'برج المملكة، الرياض', city: 'الرياض' },
  })

  // 3. إنشاء الفنانين (Artists)
  const artist1 = await prisma.artist.create({
    data: {
      name: 'فرقة الطرب الأصيل',
      slug: 'tarab-aseel',
      category: 'موسيقى شرقية',
      bio: 'فرقة متخصصة في إحياء الليالي الشرقية بأفضل الآلات.',
      profileImage: 'https://images.unsplash.com/photo-1514117445516-2ecfc9c4ec90?w=400',
      coverImage: 'https://images.unsplash.com/photo-1514117445516-2ecfc9c4ec90?w=800',
      status: 'ACTIVE',
      commissionRate: 15,
    },
  })

  const artist2 = await prisma.artist.create({
    data: {
      name: 'DJ أحمد',
      slug: 'dj-ahmed',
      category: 'موسيقى إلكترونية',
      bio: 'دي جي محترف لإحياء الحفلات بأحدث المعدات.',
      profileImage: 'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=400',
      coverImage: 'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=800',
      status: 'ACTIVE',
      commissionRate: 20,
    },
  })

  const artist3 = await prisma.artist.create({
    data: {
      name: 'المطرب محمد',
      slug: 'mohammed-singer',
      category: 'غناء عربي',
      bio: 'صوت مميز وجمهور عريض، متخصص في الأغاني الخليجية.',
      profileImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400',
      coverImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800',
      status: 'ACTIVE',
      commissionRate: 15,
    },
  })

  // 4. إنشاء العملاء
  const customer1 = await prisma.customer.create({
    data: { fullName: 'خالد العتيبي', phone: '0501234567', email: 'khaled@example.com' },
  })
  const customer2 = await prisma.customer.create({
    data: { fullName: 'سارة محمد', phone: '0559876543', email: 'sara@example.com' },
  })

  // 5. إنشاء الحجوزات (Bookings)
  const booking1 = await prisma.booking.create({
    data: {
      artistId: artist1.id, customerId: customer1.id, venueId: venue1.id,
      clientName: customer1.fullName, clientPhone: customer1.phone, clientEmail: customer1.email,
      date: new Date('2024-12-15T20:00:00Z'), timeSlot: 'EVENING', status: 'APPROVED',
      grossAmount: 5000, depositAmount: 1000, remainingAmount: 4000,
    },
  })

  const booking2 = await prisma.booking.create({
    data: {
      artistId: artist2.id, customerId: customer2.id, venueId: venue2.id,
      clientName: customer2.fullName, clientPhone: customer2.phone, clientEmail: customer2.email,
      date: new Date('2024-12-20T22:00:00Z'), timeSlot: 'NIGHT', status: 'PENDING_APPROVAL',
      grossAmount: 3000, depositAmount: 600, remainingAmount: 2400,
    },
  })

  const booking3 = await prisma.booking.create({
    data: {
      artistId: artist3.id, customerId: customer1.id, venueId: venue1.id,
      clientName: customer1.fullName, clientPhone: customer1.phone, clientEmail: customer1.email,
      date: new Date('2024-11-10T19:00:00Z'), timeSlot: 'EVENING', status: 'COMPLETED',
      grossAmount: 8000, depositAmount: 8000, remainingAmount: 0,
    },
  })

  // 6. ✨ إضافة بيانات الجداول المتبقية ✨

  // الأسعار (Pricing)
  await prisma.pricing.createMany({
    data: [
      { artistId: artist1.id, name: 'حفلة زفاف كاملة', description: '4 ساعات مع فرقة كاملة', price: 5000, duration: 240 },
      { artistId: artist2.id, name: 'حفلة خاصة', description: '3 ساعات DJ', price: 3000, duration: 180 },
      { artistId: artist3.id, name: 'أمسية غنائية', description: 'ساعتين غناء', price: 4000, duration: 120 },
    ]
  })

  // التوافر (Availability)
  await prisma.availability.createMany({
    data: [
      { artistId: artist1.id, date: new Date('2024-12-25'), timeSlot: 'EVENING', isBooked: false, price: 5000 },
      { artistId: artist2.id, date: new Date('2024-12-30'), timeSlot: 'NIGHT', isBooked: false, price: 3000 },
      { artistId: artist3.id, date: new Date('2025-01-05'), timeSlot: 'EVENING', isBooked: false, price: 4000 },
    ]
  })

  // التقييمات (Reviews)
  await prisma.review.createMany({
    data: [
      { artistId: artist1.id, rating: 5, comment: 'أداء رائع جداً واحترافية عالية في التعامل!' },
      { artistId: artist3.id, rating: 4, comment: 'صوت جميل وتجربة مميزة، أنصح بهم بشدة.' },
      { artistId: artist2.id, rating: 5, comment: 'أفضل DJ حضرنا له، الحفلة كانت رائعة.' },
    ]
  })

  // المدفوعات (Payments)
  await prisma.payment.createMany({
    data: [
      { bookingId: booking1.id, amount: 1000, status: 'COMPLETED', method: 'CREDIT_CARD', notes: 'دفع العربون' },
      { bookingId: booking3.id, amount: 8000, status: 'COMPLETED', method: 'BANK_TRANSFER', notes: 'دفع كامل مقدماً' },
    ]
  })

  console.log('✅ تم تعبئة قاعدة البيانات بنجاح وشامل!')
  console.log('🎵 عدد الفنانين: 3')
  console.log('📍 عدد الأماكن: 2')
  console.log('📅 عدد الحجوزات: 3')
  console.log('⭐ عدد التقييمات: 3')
  console.log('💰 عدد المدفوعات: 2')
}

main()
  .catch((e) => {
    console.error('❌ حدث خطأ:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })