import bcrypt from 'bcryptjs';
import prisma from './db.js';

const [,, email, password] = process.argv;

if (!email || !password) {
  console.error('Использование: node src/create-admin-user.js <email> <password>');
  process.exit(1);
}

const createOrUpdateAdmin = async () => {
  const passwordHash = await bcrypt.hash(password, 10);

  const adminUser = await prisma.adminUser.upsert({
    where: { email },
    update: {
      passwordHash,
      isActive: true,
      updatedAt: new Date()
    },
    create: {
      email,
      passwordHash,
      fullName: 'Администратор',
      role: 'superadmin',
      isActive: true
    }
  });

  console.log('Успешно создан/обновлён админ:');
  console.log(`  email: ${adminUser.email}`);
  console.log(`  пароль: ${password}`);
  console.log('Теперь вы можете войти в /admin с этими данными.');
  process.exit(0);
};

createOrUpdateAdmin().catch(err => {
  console.error('Ошибка при создании админа:', err);
  process.exit(1);
});
