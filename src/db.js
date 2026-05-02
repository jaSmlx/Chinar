import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

(async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('Успешное подключение к базе данных (Prisma)');
  } catch (err) {
    console.error('Ошибка подключения к базе данных:', err.message);
    process.exit(1);
  }
})();

export default prisma;