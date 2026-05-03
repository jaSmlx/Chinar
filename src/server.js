import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import prisma from './db.js';
import multer from 'multer';
import fs from 'fs';
import session from 'express-session';
import bcrypt from 'bcryptjs';
import AdminJSExpress from '@adminjs/express';
import AdminJS from 'adminjs';
import { Database, Resource } from '@adminjs/prisma';
import { getAdminJSConfig } from './adminjs-config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

AdminJS.registerAdapter({ Database, Resource });

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(cors());
app.use(express.static(path.join(__dirname, '../public')));
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

const resumesDir = path.join(__dirname, '../public/uploads/resumes');
try {
  fs.mkdirSync(resumesDir, { recursive: true });
} catch (err) {
  console.error('Could not create resumes directory', err);
}

const resumeStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, resumesDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'resume-' + uniqueSuffix + ext);
  }
});

const uploadResume = multer({
  storage: resumeStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx', '.rtf', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Недопустимый формат файла. Разрешены: PDF, DOC, DOCX, RTF, TXT'));
  }
});

const validatePhone = (phone) => {
  const phoneRegex = /[\d\s\-\+\(\)]{10,}/;
  return phoneRegex.test(phone?.trim() || '');
};

const validateEmail = (email) => {
  if (!email) return true;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateName = (name) => {
  return name && name.trim().length >= 2;
};

const validateMessage = (message) => {
  return message && message.trim().length >= 5;
};

const adminJs = getAdminJSConfig(prisma);

const authenticateAdmin = async (email, password) => {
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      return { email, role: 'superadmin' };
    }
  }

  const adminUser = await prisma.adminUser.findUnique({ where: { email } });
  if (!adminUser || !adminUser.isActive) {
    return false;
  }

  const passwordMatches = await bcrypt.compare(password, adminUser.passwordHash);
  if (!passwordMatches) {
    return false;
  }

  return {
    email: adminUser.email,
    role: adminUser.role,
    fullName: adminUser.fullName,
    id: adminUser.id
  };
};

const adminJsRouter = AdminJSExpress.buildAuthenticatedRouter(
  adminJs,
  {
    authenticate: authenticateAdmin,
    cookieName: 'adminjs',
    cookiePassword: process.env.SESSION_SECRET || 'your-secret-key'
  },
  null,
  {
    resave: false,
    saveUninitialized: false,
  }
);

app.use(adminJs.options.rootPath, adminJsRouter);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    });
    res.render('about', {
      title: 'О компании — Чинар',
      reviews
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка сервера');
  }
});

app.get('/services', async (req, res) => {
  try {
    const categories = await prisma.serviceCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        services: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' }
        }
      }
    });
    res.render('services', { title: 'Услуги — Чинар', categories });
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка сервера');
  }
});

app.get('/clients', async (req, res) => {
  try {
    const clients = await prisma.client.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    });
    
    const clientsGrouped = {};
    clients.forEach(client => {
      if (!clientsGrouped[client.category]) clientsGrouped[client.category] = [];
      clientsGrouped[client.category].push(client);
    });
    
    res.render('clients', { title: 'Клиенты — Чинар', clientsGrouped });
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка сервера');
  }
});

app.get('/contacts', (req, res) => {
  res.render('contacts', { title: 'Контакты — Чинар', msg: req.query.msg || null });
});

app.get('/vacancies', async (req, res) => {
  try {
    const vacancies = await prisma.vacancy.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        duties: {
          orderBy: { sortOrder: 'asc' }
        }
      }
    });
    
    const vacanciesFormatted = vacancies.map(v => ({
      ...v,
      duties: v.duties.map(d => d.dutyText)
    }));
    
    res.render('vacancies', {
      title: 'Вакансии — Чинар',
      vacancies: vacanciesFormatted,
      msg: req.query.msg || null
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка сервера');
  }
});

app.post('/api/service-orders', async (req, res) => {
  try {
    const { service_id, service_name, client_name, phone, email } = req.body;
    
    if (!validateName(client_name)) {
      return res.status(400).send('Пожалуйста, введите корректное имя (минимум 2 символа)');
    }
    if (!validatePhone(phone)) {
      return res.status(400).send('Пожалуйста, введите корректный номер телефона');
    }
    if (!validateEmail(email)) {
      return res.status(400).send('Пожалуйста, введите корректный Email');
    }
    
    await prisma.serviceOrder.create({
      data: {
        serviceId: service_id ? parseInt(service_id) : null,
        serviceName: service_name,
        clientName: client_name,
        phone,
        email: email || null,
        status: 'new'
      }
    });
    res.redirect('/services?msg=order_sent');
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка сохранения заявки');
  }
});

app.post('/api/service-orders/ajax', async (req, res) => {
  try {
    const { service_id, service_name, client_name, phone, email } = req.body;
    
    if (!validateName(client_name)) {
      return res.status(400).json({ success: false, message: 'Пожалуйста, введите корректное имя (минимум 2 символа)' });
    }
    if (!validatePhone(phone)) {
      return res.status(400).json({ success: false, message: 'Пожалуйста, введите корректный номер телефона' });
    }
    if (!validateEmail(email)) {
      return res.status(400).json({ success: false, message: 'Пожалуйста, введите корректный Email' });
    }
    
    await prisma.serviceOrder.create({
      data: {
        serviceId: service_id ? parseInt(service_id) : null,
        serviceName: service_name,
        clientName: client_name,
        phone,
        email: email || null,
        status: 'new'
      }
    });
    res.json({ success: true });
  } catch (err) {
    console.error('Ошибка сохранения заявки (AJAX):', err);
    res.status(500).json({ success: false, message: 'Ошибка сохранения заявки' });
  }
});

app.post('/api/contact-messages', async (req, res) => {
  try {
    const { full_name, phone, email, message } = req.body;
    
    if (!validateName(full_name)) {
      return res.status(400).send('Пожалуйста, введите корректное ФИО (минимум 2 символа)');
    }
    if (!validatePhone(phone)) {
      return res.status(400).send('Пожалуйста, введите корректный номер телефона');
    }
    if (!validateEmail(email)) {
      return res.status(400).send('Пожалуйста, введите корректный Email');
    }
    if (!validateMessage(message)) {
      return res.status(400).send('Сообщение должно содержать минимум 5 символов');
    }
    
    await prisma.contactMessage.create({
      data: {
        fullName: full_name,
        phone,
        email: email || null,
        message
      }
    });
    res.redirect('/contacts?msg=message_sent');
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка отправки сообщения');
  }
});

app.post('/api/resumes', (req, res) => {
  uploadResume.single('resume_file')(req, res, async (err) => {
    if (err) {
      console.error('Upload error:', err);
      if (err instanceof multer.MulterError) {
        return res.status(400).send(`Ошибка загрузки файла: ${err.message}`);
      }
      return res.status(400).send(err.message || 'Ошибка при загрузке файла');
    }

    try {
      const { vacancy_id, vacancy_title, full_name, phone } = req.body;
      const resumeFilePath = req.file ? '/uploads/resumes/' + req.file.filename : null;

      if (!validateName(full_name)) {
        return res.status(400).send('Пожалуйста, введите корректное ФИО (минимум 2 символа)');
      }
      if (!validatePhone(phone)) {
        return res.status(400).send('Пожалуйста, введите корректный номер телефона');
      }

      await prisma.resume.create({
        data: {
          vacancyId: vacancy_id ? parseInt(vacancy_id) : null,
          vacancyTitle: vacancy_title,
          fullName: full_name,
          phone,
          resumeFilePath,
          status: 'new'
        }
      });
      res.redirect('/vacancies?msg=resume_sent');
    } catch (e) {
      console.error('Error saving resume record:', e);
      res.status(500).send('Ошибка отправки отклика');
    }
  });
});

app.get('/download/resume/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const r = await prisma.resume.findUnique({ where: { id } });
    if (!r || !r.resumeFilePath) return res.status(404).send('Файл не найден');

    const filePath = path.join(__dirname, '../public', r.resumeFilePath.replace(/^\//, ''));
    if (!fs.existsSync(filePath)) return res.status(404).send('Файл не найден');

    res.download(filePath);
  } catch (err) {
    console.error('Download error:', err);
    res.status(500).send('Ошибка загрузки файла');
  }
});

app.get('/admin/redirect/resume/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const r = await prisma.resume.findUnique({ where: { id } });
    if (!r || !r.resumeFilePath) return res.status(404).send('Файл не найден');

    const downloadUrl = `/download/resume/${id}`;
    res.send(`<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=${downloadUrl}"></head><body><script>window.location.href='${downloadUrl}';</script><p>Перенаправление... <a href="${downloadUrl}">если не произошло автоматически, нажмите здесь</a></p></body></html>`);
  } catch (err) {
    console.error('Admin redirect error:', err);
    res.status(500).send('Ошибка перенаправления');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сайт запущен: http://localhost:${PORT}`);
  console.log(`Админ-панель доступна: http://localhost:${PORT}/admin`);
});