const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('🔐 جاري إعادة تعيين كلمات السر...\n');

  // 1. إعادة تعيين كلمة سر الأدمن
  const adminEmail = 'admin@nooryi.com';
  const adminPassword = 'admin123';

  const admin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (admin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await prisma.user.update({
      where: { email: adminEmail },
      data: { 
        password: hashedPassword,
        role: 'SUPER_ADMIN',
      },
    });
    console.log('✅ تم تحديث كلمة سر الأدمن');
  } else {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'مدير النظام',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
      },
    });
    console.log('✅ تم إنشاء أدمن جديد');
  }

  // 2. عرض جميع المستخدمين للتحقق
  console.log('\n📋 جميع المستخدمين في قاعدة البيانات:\n');
  const allUsers = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      password: true,
    },
  });

  allUsers.forEach((u, i) => {
    const isHashed = u.password.startsWith('\\$') || 
                     u.password.startsWith('\\$') ||
                     u.password.startsWith('\\$');
    console.log((i + 1) + '. ' + (u.name || 'بدون اسم'));
    console.log('   البريد: ' + u.email);
    console.log('   الدور: ' + u.role);
    console.log('   مشفّرة: ' + (isHashed ? '✅ نعم' : '❌ لا'));
    console.log('');
  });

  console.log('🎉 اكتمل بنجاح!');
  console.log('\n📝 بيانات الدخول للأدمن:');
  console.log('   البريد: admin@nooryi.com');
  console.log('   كلمة السر: admin123');
}

main().catch(e => { console.error('❌ خطأ:', e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
