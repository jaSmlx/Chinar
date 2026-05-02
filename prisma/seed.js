import { readFile } from 'fs/promises';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

try {
  const sql = await readFile(new URL('./seed.sql', import.meta.url), 'utf8');
    const statements = [];
    let buf = '';
    let inDollar = false;
    for (let i = 0; i < sql.length; i++) {
      const two = sql.slice(i, i + 2);
      if (two === '$$') {
        inDollar = !inDollar;
        buf += two;
        i++; 
        continue;
      }
      const ch = sql[i];
      if (ch === ';' && !inDollar) {
        const s = buf.trim();
        if (s) statements.push(s);
        buf = '';
        continue;
      }
      buf += ch;
    }
    if (buf.trim()) statements.push(buf.trim());

    for (const statement of statements) {
      try {
        await prisma.$executeRawUnsafe(statement);
      } catch (err) {
        console.error('Failed statement:', statement.slice(0, 200));
        throw err;
      }
    }

  console.log('Prisma seed completed successfully.');
} catch (error) {
  console.error('Prisma seed failed:', error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
