import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import prisma from './db.js';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
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

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

const uploadResume = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx', '.rtf', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Недопустимый формат файла. Разрешены: PDF, DOC, DOCX, RTF, TXT'));
  }
});

const normalizeCloudinaryPublicId = (originalName) => {
  const ext = path.extname(originalName).toLowerCase().replace(/^[.]/, '') || 'pdf';
  const baseName = path.basename(originalName, path.extname(originalName))
    .replace(/[^a-zA-Z0-9-_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase() || 'resume';

  return {
    publicId: `${baseName}_${Date.now()}`,
    format: ext
  };
};

const uploadResumeToCloudinary = (buffer, originalname) => {
  const ext = path.extname(originalname).replace('.', '').toLowerCase();
  const baseName = path.basename(originalname, path.extname(originalname))
    .replace(/[^a-zA-Z0-9-_]/g, '_')
    .toLowerCase() || 'resume';

  const publicId = `resume_${Date.now()}`;

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'resumes',
        public_id: publicId,
        resource_type: 'raw',
        format: ext,
        access_mode: 'public',
        overwrite: false,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

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
      if (!req.file) {
        return res.status(400).send('Пожалуйста, загрузите файл резюме');
      }

      if (!validateName(full_name)) {
        return res.status(400).send('Пожалуйста, введите корректное ФИО (минимум 2 символа)');
      }
      if (!validatePhone(phone)) {
        return res.status(400).send('Пожалуйста, введите корректный номер телефона');
      }

      const uploadResult = await uploadResumeToCloudinary(req.file.buffer, req.file.originalname);
      const resumeFilePath = uploadResult.secure_url;

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
      res.status(500).send(`Ошибка отправки отклика: ${e.message}`);
      res.status(500).send('Ошибка отправки отклика');
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сайт запущен: http://localhost:${PORT}`);
  console.log(`Админ-панель доступна: http://localhost:${PORT}/admin`);
});