const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 جاري زرع البيانات التجريبية...\n');

  // 1. إنشاء الأدمن
  console.log('👤 إنشاء مستخدم أدمن...');
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@nooryi.com' },
    update: {},
    create: {
      email: 'admin@nooryi.com',
      name: 'مدير النظام',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
    },
  });
  console.log('✅ تم إنشاء الأدمن\n');

  // 2. إنشاء فنانيين (باستخدام الحقول الصحيحة فقط)
  console.log('🎵 إنشاء فنانيين تجريبيين...');
  const artists = [
    { 
      name: 'فرقة الطرب الأصيل', 
      slug: 'tarab-aseel', 
      category: 'موسيقى شرقية',
      bio: 'فرقة موسيقية متخصصة في الطرب الشرقي الأصيل مع أكثر من 10 سنوات خبرة.', 
      profileImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800',
      coverImage: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1200',
      accentColor: '#EAB308',
      status: 'ACTIVE',
    },
    { 
      name: 'دي جي نور', 
      slug: 'dj-noor', 
      category: 'موسيقى إلكترونية',
      bio: 'دي جي محترف متخصص في الموسيقى الإلكترونية والحفلات.', 
      profileImage: 'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=800',
      coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200',
      accentColor: '#3B82F6',
      status: 'ACTIVE',
    },
    { 
      name: 'عازف العود محمد', 
      slug: 'oud-mohammed', 
      category: 'موسيقى كلاسيكية',
      bio: 'عازف عود محترف مع 15 سنة خبرة في الموسيقى الكلاسيكية.', 
      profileImage: 'https://images.unsplash.com/photo-1514117445516-2ecfc9c4ec90?w=800',
      coverImage: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=1200',
      accentColor: '#10B981',
      status: 'ACTIVE',
    },
  ];

  for (const artist of artists) {
    await prisma.artist.upsert({
      where: { slug: artist.slug },
      update: artist,
      create: artist,
    });
    console.log('   ✅ ' + artist.name);
  }
  console.log('\n✅ تم إنشاء 3 فنانيين بنجاح\n');

  console.log('🎉 اكتمل زرع البيانات بنجاح!');
  console.log('\n📝 بيانات الدخول للأدمن:');
  console.log('   البريد: admin@nooryi.com');
  console.log('   كلمة السر: admin123');
}

main().catch(e => { console.error('❌ خطأ:', e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
