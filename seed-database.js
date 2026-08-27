const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 جاري إعادة زرع البيانات...\n');

  // 1. التأكد من وجود الأدمن
  console.log('👤 التحقق من الأدمن...');
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@nooryi.com' },
    update: { password: adminPassword, role: 'SUPER_ADMIN' },
    create: {
      email: 'admin@nooryi.com',
      name: 'مدير النظام',
      password: adminPassword,
      role: 'SUPER_ADMIN',
    },
  });
  console.log('✅ الأدمن موجود: ' + admin.email);

  // 2. إنشاء 3 أماكن (Venues)
  console.log('\n🏛️ إنشاء الأماكن...');
  const venues = [];
  const venueNames = ['قاعة الأفراح الملكية', 'حديقة النيل', 'فندق سميراميس'];
  const addresses = ['شارع التحرير، القاهرة', 'كورنيش النيل، الجيزة', 'ميدان التحرير، القاهرة'];
  
  for (let i = 0; i < 3; i++) {
    const venue = await prisma.venue.upsert({
      where: { id: 'venue-' + (i + 1) },
      update: {},
      create: {
        id: 'venue-' + (i + 1),
        name: venueNames[i],
        address: addresses[i],
        city: 'القاهرة',
      },
    });
    venues.push(venue);
  }
  console.log('✅ تم إنشاء 3 أماكن');

  // 3. إنشاء فنانين مع جميع الحقول الصحيحة
  console.log('\n🎵 إنشاء الفنانين...');
  const artistsData = [
    {
      name: 'فرقة الطرب الأصيل',
      slug: 'tarab-aseel',
      category: 'موسيقى شرقية',
      bio: 'فرقة موسيقية متخصصة في الطرب الشرقي الأصيل مع أكثر من 10 سنوات خبرة في إحياء الحفلات والمناسبات الخاصة. نقدم أفضل الأغاني الكلاسيكية والحديثة.',
      profileImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800',
      coverImage: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1200',
      accentColor: '#EAB308',
      status: 'ACTIVE',
    },
    {
      name: 'دي جي نور',
      slug: 'dj-noor',
      category: 'موسيقى إلكترونية',
      bio: 'دي جي محترف متخصص في الموسيقى الإلكترونية والحفلات الصاخبة. خبرة 8 سنوات في أكبر النوادي والمنتجعات.',
      profileImage: 'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=800',
      coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200',
      accentColor: '#3B82F6',
      status: 'ACTIVE',
    },
    {
      name: 'عازف العود محمد',
      slug: 'oud-mohammed',
      category: 'موسيقى كلاسيكية',
      bio: 'عازف عود محترف مع 15 سنة خبرة في الموسيقى الكلاسيكية والشرقية. مثالي للأمسيات الهادئة والمناسبات الخاصة.',
      profileImage: 'https://images.unsplash.com/photo-1514117445516-2ecfc9c4ec90?w=800',
      coverImage: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=1200',
      accentColor: '#10B981',
      status: 'ACTIVE',
    },
  ];

  const createdArtists = [];
  for (const artistData of artistsData) {
    const artist = await prisma.artist.upsert({
      where: { slug: artistData.slug },
      update: artistData,
      create: artistData,
    });
    createdArtists.push(artist);
    console.log('   ✅ ' + artist.name);
  }

  // 4. إنشاء 2 عملاء
  console.log('\n👥 إنشاء العملاء...');
  const customers = [];
  const customersData = [
    { fullName: 'أحمد محمد', phone: '01012345678', email: 'ahmed@example.com' },
    { fullName: 'فاطمة علي', phone: '01198765432', email: 'fatma@example.com' },
  ];

  for (let i = 0; i < customersData.length; i++) {
    const customer = await prisma.customer.upsert({
      where: { id: 'customer-' + (i + 1) },
      update: {},
      create: {
        id: 'customer-' + (i + 1),
        ...customersData[i],
      },
    });
    customers.push(customer);
  }
  console.log('✅ تم إنشاء 2 عملاء');

  // 5. إنشاء 3 حجوزات تجريبية
  console.log('\n📅 إنشاء الحجوزات...');
  const bookingStatuses = ['PENDING_APPROVAL', 'APPROVED', 'COMPLETED'];
  
  for (let i = 0; i < 3; i++) {
    const date = new Date();
    date.setDate(date.getDate() + (i + 3)); // بعد 3-5 أيام

    await prisma.booking.create({
      data: {
        artistId: createdArtists[i].id,
        customerId: customers[i % 2].id,
        venueId: venues[i].id,
        clientName: customers[i % 2].fullName,
        clientPhone: customers[i % 2].phone,
        clientEmail: customers[i % 2].email,
        date: date,
        timeSlot: 'EVENING',
        status: bookingStatuses[i],
        grossAmount: 5000 + (i * 1000),
        depositAmount: 1000 + (i * 200),
        remainingAmount: 4000 + (i * 800),
      },
    });
  }
  console.log('✅ تم إنشاء 3 حجوزات');

  // 6. ملخص
  const [artistCount, bookingCount, venueCount, userCount] = await Promise.all([
    prisma.artist.count(),
    prisma.booking.count(),
    prisma.venue.count(),
    prisma.user.count(),
  ]);

  console.log('\n🎉 اكتمل زرع البيانات بنجاح!');
  console.log('═══════════════════════════════════');
  console.log('📊 الإحصائيات النهائية:');
  console.log('   🎵 الفنانين: ' + artistCount);
  console.log('   📅 الحجوزات: ' + bookingCount);
  console.log('   🏛️ الأماكن: ' + venueCount);
  console.log('   👤 المستخدمين: ' + userCount);
  console.log('═══════════════════════════════════');
  console.log('\n🔗 افتح الآن:');
  console.log('   https://nooryi-studio.vercel.app/artists');
  console.log('   https://nooryi-studio.vercel.app/admin');
}

main().catch(e => { console.error('❌ خطأ:', e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
