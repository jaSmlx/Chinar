import AdminJS from 'adminjs';

const getPrismaModel = (prisma, modelName) => {
  const model = prisma._runtimeDataModel?.models?.[modelName];
  if (!model) {
    throw new Error(`Prisma model metadata not found: ${modelName}`);
  }
  return { ...model, name: modelName };
};

const resourceLabels = {
  'AdminUser': 'Администраторы',
  'ServiceCategory': 'Категории услуг',
  'Service': 'Услуги',
  'ServiceOrder': 'Заявки на услуги',
  'Vacancy': 'Вакансии',
  'VacancyDuty': 'Обязанности',
  'Resume': 'Резюме',
  'Client': 'Клиенты',
  'Review': 'Отзывы',
  'ContactMessage': 'Сообщения'
};

const navOptions = {
  admin: { name: 'Администрирование', icon: 'Settings' },
  services: { name: 'Услуги', icon: 'Settings' },
  orders: { name: 'Заказы', icon: 'Settings' },
  vacancies: { name: 'Вакансии', icon: 'Settings' },
  resumes: { name: 'Резюме', icon: 'Settings' },
  content: { name: 'Контент', icon: 'Settings' },
  messages: { name: 'Сообщения', icon: 'Settings' }
};

export const getAdminJSConfig = (prisma) => {
  return new AdminJS({
    rootPath: '/admin',
    locale: 'ru',
    branding: {
      companyName: 'Чинар - Админ Панель'
    },
    translations: {
      ru: {
        messages: {
          loginWelcome: 'Добро пожаловать в AdminJS'
        },
        actions: {
          new: 'Создать',
          edit: 'Редактировать',
          show: 'Просмотр',
          delete: 'Удалить',
          bulkDelete: 'Удалить выбранные',
          list: 'Список'
        }
      }
    },
    navigationFilter: ({ resource }) => {
      return true;
    },
    nav: [
      { name: 'Администрирование' },
      { name: 'Услуги' },
      { name: 'Заказы' },
      { name: 'Вакансии' },
      { name: 'Резюме' },
      { name: 'Контент' },
      { name: 'Сообщения' }
    ],
    resources: [
      {
        resource: { model: getPrismaModel(prisma, 'AdminUser'), client: prisma },
        options: {
          parent: 'admin',
          label: 'Администраторы',
          navigation: {
            name: 'Администраторы',
            icon: 'User'
          },
          listProperties: ['id', 'email', 'fullName', 'role', 'isActive', 'createdAt', 'updatedAt'],
          showProperties: ['id', 'email', 'fullName', 'role', 'isActive', 'createdAt', 'updatedAt'],
          editProperties: ['email', 'passwordHash', 'fullName', 'role', 'isActive'],
          filterProperties: ['id', 'email', 'fullName', 'role', 'isActive', 'createdAt', 'updatedAt'],
          properties: {
            id: { isVisible: { list: true, filter: true, show: true, edit: false }, position: 1 },
            email: { isTitle: true, position: 2 },
            passwordHash: {
              position: 3,
              isVisible: { list: false, filter: false, show: false, edit: true },
              type: 'password'
            },
            fullName: { position: 4 },
            role: {
              position: 5,
              type: 'select',
              availableValues: [
                { label: 'Суперадмин', value: 'superadmin' },
                { label: 'Менеджер', value: 'manager' }
              ]
            },
            isActive: { position: 6, type: 'boolean' },
            createdAt: { position: 7, isVisible: { edit: false }, type: 'datetime' },
            updatedAt: { position: 8, isVisible: { edit: false }, type: 'datetime' }
          },
          actions: {
            new: { isAccessible: false },
            delete: { isAccessible: false },
            bulkDelete: { isAccessible: false }
          }
        }
      },

      {
        resource: { model: getPrismaModel(prisma, 'ServiceCategory'), client: prisma },
        options: {
          parent: 'services',
          label: 'Категории услуг',
          navigation: {
            name: 'Категории услуг',
            icon: 'Folder'
          },
          properties: {
            id: { position: 1, isVisible: { list: true, filter: true, show: true, edit: false } },
            name: { position: 2, isTitle: true },
            sortOrder: { position: 3, type: 'number' },
            isActive: { position: 4, type: 'boolean' }
          },
          listProperties: ['id', 'name', 'sortOrder', 'isActive'],
          showProperties: ['id', 'name', 'sortOrder', 'isActive'],
          editProperties: ['name', 'sortOrder', 'isActive'],
          filterProperties: ['id', 'name', 'isActive']
        }
      },
      {
        resource: { model: getPrismaModel(prisma, 'Service'), client: prisma },
        options: {
          parent: 'services',
          label: 'Услуги',
          navigation: {
            name: 'Услуги',
            icon: 'Wrench'
          },
          listProperties: ['id', 'name', 'category', 'priceFrom', 'priceUnit', 'isActive', 'sortOrder', 'createdAt', 'updatedAt'],
          showProperties: ['id', 'name', 'category', 'description', 'priceFrom', 'priceUnit', 'imagePath', 'isActive', 'sortOrder', 'createdAt', 'updatedAt'],
          editProperties: ['name', 'categoryId', 'description', 'priceFrom', 'priceUnit', 'imagePath', 'isActive', 'sortOrder'],
          filterProperties: ['id', 'name', 'category', 'isActive'],
          properties: {
            id: { position: 1, isVisible: { list: true, filter: true, show: true, edit: false } },
            name: { position: 2, isTitle: true },
            category: {
              position: 3,
              reference: 'ServiceCategory',
              isVisible: { list: true, filter: true, show: true, edit: false }
            },
            categoryId: {
              position: 4,
              reference: 'ServiceCategory',
              isVisible: { list: false, filter: true, show: false, edit: true }
            },
            description: { position: 5, type: 'textarea' },
            priceFrom: { position: 6, type: 'number' },
            priceUnit: {
              position: 7,
              type: 'select',
              availableValues: [
                { label: 'руб/мес', value: 'руб/мес' },
                { label: 'руб/час', value: 'руб/час' },
                { label: 'руб', value: 'руб' }
              ]
            },
            imagePath: { position: 8 },
            isActive: { position: 9, type: 'boolean' },
            sortOrder: { position: 10, type: 'number' },
            createdAt: { position: 11, isVisible: { edit: false }, type: 'datetime' },
            updatedAt: { position: 12, isVisible: { edit: false }, type: 'datetime' }
          }
        }
      },

      {
        resource: { model: getPrismaModel(prisma, 'ServiceOrder'), client: prisma },
        options: {
          parent: 'orders',
          label: 'Заявки на услуги',
          navigation: {
            name: 'Заявки на услуги',
            icon: 'FileText'
          },
          listProperties: ['id', 'service', 'serviceName', 'clientName', 'phone', 'email', 'status', 'managerNote', 'createdAt', 'updatedAt'],
          showProperties: ['id', 'service', 'serviceName', 'clientName', 'phone', 'email', 'status', 'managerNote', 'createdAt', 'updatedAt'],
          editProperties: ['serviceId', 'clientName', 'phone', 'email', 'status', 'managerNote'],
          filterProperties: ['id', 'service', 'serviceName', 'clientName', 'phone', 'email', 'status'],
          properties: {
            id: { position: 1, isTitle: true },
            service: {
              position: 2,
              reference: 'Service',
              isVisible: { list: true, show: true, filter: true, edit: false }
            },

            serviceId: {
              position: 3,
              reference: 'Service',
              isVisible: { list: false, show: false, filter: true, edit: true }
            },
            serviceName: { position: 4, isTitle: true },
            clientName: { position: 5 },
            phone: { position: 6 },
            email: { position: 7 },
            status: {
              position: 8,
              type: 'select',
              availableValues: [
                { label: 'Новая', value: 'new' },
                { label: 'В работе', value: 'in_progress' },
                { label: 'Выполнена', value: 'completed' },
                { label: 'Отменена', value: 'cancelled' }
              ]
            },
            managerNote: {
              position: 9,
              type: 'textarea',
              isVisible: { list: true, filter: false, show: true, edit: true }
            },
            createdAt: { position: 10, isVisible: { edit: false }, type: 'datetime' },
            updatedAt: { position: 11, isVisible: { edit: false }, type: 'datetime' }
          },
          actions: {
            new: { isAccessible: false },
            delete: { isAccessible: false }
          }
        }
      },

      {
        resource: { model: getPrismaModel(prisma, 'Vacancy'), client: prisma },
        options: {
          parent: 'vacancies',
          label: 'Вакансии',
          navigation: {
            name: 'Вакансии',
            icon: 'Briefcase'
          },
          listProperties: ['id', 'title', 'schedule', 'salaryFrom', 'salaryUnit', 'experience', 'isActive', 'sortOrder', 'createdAt', 'updatedAt'],
          showProperties: ['id', 'title', 'schedule', 'salaryFrom', 'salaryUnit', 'experience', 'requirements', 'conditions', 'isActive', 'sortOrder', 'createdAt', 'updatedAt'],
          editProperties: ['title', 'schedule', 'salaryFrom', 'salaryUnit', 'experience', 'requirements', 'conditions', 'isActive', 'sortOrder'],
          filterProperties: ['id', 'title', 'schedule', 'salaryUnit', 'experience', 'isActive'],
          properties: {
            id: { position: 1, isVisible: { list: true, filter: true, show: true, edit: false } },
            title: { position: 2, isTitle: true },
            schedule: { position: 3 },
            salaryFrom: { position: 4, type: 'number' },
            salaryUnit: { position: 5 },
            experience: { position: 6 },
            requirements: { position: 7, type: 'textarea' },
            conditions: {
              position: 8,
              type: 'textarea',
              isVisible: { list: false, filter: false, show: true, edit: true }
            },
            isActive: { position: 9, type: 'boolean' },
            sortOrder: { position: 10, type: 'number' },
            createdAt: { position: 11, isVisible: { edit: false }, type: 'datetime' },
            updatedAt: { position: 12, isVisible: { edit: false }, type: 'datetime' }
          }
        }
      },
      {
        resource: { model: getPrismaModel(prisma, 'VacancyDuty'), client: prisma },
        options: {
          parent: 'vacancies',
          label: 'Обязанности',
          navigation: { name: 'Обязанности', icon: 'List' },

          listProperties: ['id', 'vacancy', 'vacancyTitle', 'dutyText', 'sortOrder'],
          showProperties: ['id', 'vacancy', 'vacancyTitle', 'dutyText', 'sortOrder'],
          editProperties: ['vacancyId', 'dutyText', 'sortOrder'],

          properties: {
            id: { position: 1, isVisible: { list: true, filter: true, show: true, edit: false } },

            vacancy: {
              position: 2,
              reference: 'Vacancy',
              isVisible: { list: true, show: true, filter: true, edit: false }
            },

            vacancyId: {
              reference: 'Vacancy',
              isVisible: { list: false, show: false, filter: true, edit: true }
            },

            vacancyTitle: {
              position: 3,
              type: 'string',
              isVisible: { list: true, show: true, edit: false, filter: false }
            },

            dutyText: {
              position: 4,
              type: 'textarea',
              isVisible: { list: true, show: true, edit: true, filter: false }
            },

            sortOrder: {
              position: 5,
              type: 'number',
              isVisible: { list: true, show: true, edit: true, filter: false }
            }
          },

          actions: {
            list: {
              after: async (response) => {
                response.records.forEach(record => {
                  record.params.vacancyTitle =
                    record.populated?.vacancy?.params?.title || '—';
                });
                return response;
              }
            }
          }
        }
      },

      {
        resource: { model: getPrismaModel(prisma, 'Resume'), client: prisma },
        options: {
          label: 'Резюме',
          actions: {
            list: {
              after: async (response) => {
                response.records.forEach(record => {
                  record.params.vacancyTitle =
                    record.populated?.vacancy?.params?.title || '—';
                });
                return response;
              }
            }
          },
          parent: 'resumes',
          navigation: {
            name: 'Резюме',
            icon: 'FileText'
          },
          listProperties: ['id', 'vacancy', 'vacancyTitle', 'fullName', 'phone', 'resumeFilePath', 'status', 'hrNote', 'createdAt', 'updatedAt'],
          showProperties: ['id', 'vacancy', 'vacancyTitle', 'fullName', 'phone', 'resumeFilePath', 'status', 'hrNote', 'createdAt', 'updatedAt'],
          editProperties: ['vacancyId', 'vacancyTitle', 'fullName', 'phone', 'resumeFilePath', 'status', 'hrNote'],
          filterProperties: ['id', 'vacancy', 'vacancyTitle', 'fullName', 'phone', 'status'],
          properties: {
            id: { position: 1, isVisible: { list: true, filter: true, show: true, edit: false } },
            vacancy: {
              position: 2,
              reference: 'Vacancy',
              isVisible: { list: true, filter: true, show: true, edit: false }
            },
            vacancyId: {
              position: 3,
              reference: 'Vacancy',
              isVisible: { list: false, filter: true, show: false, edit: true }
            },
            vacancyTitle: { position: 4, isVisible: { list: true, show: true, edit: false, filter: false } },
            fullName: { position: 5, isTitle: true },
            phone: { position: 6 },
            resumeFilePath: { position: 7 },
            status: {
              position: 8,
              type: 'select',
              availableValues: [
                { label: 'Новое', value: 'new' },
                { label: 'Просмотрено', value: 'viewed' },
                { label: 'Приглашённый', value: 'interview' },
                { label: 'Принят', value: 'hired' },
                { label: 'Отказано', value: 'rejected' }
              ]
            },
            hrNote: {
              position: 9,
              type: 'textarea',
              isVisible: { list: true, filter: false, show: true, edit: true }
            },
            createdAt: { position: 10, isVisible: { edit: false }, type: 'datetime' },
            updatedAt: { position: 11, isVisible: { edit: false }, type: 'datetime' }
          },
          actions: {
            new: { isAccessible: false },
            delete: { isAccessible: false }
          }
        }
      },

      {
        resource: { model: getPrismaModel(prisma, 'Client'), client: prisma },
        options: {
          parent: 'content',
          label: 'Клиенты',
          navigation: {
            name: 'Клиенты',
            icon: 'Building'
          },
          listProperties: ['id', 'name', 'category', 'logoPath', 'isActive', 'sortOrder'],
          showProperties: ['id', 'name', 'category', 'logoPath', 'isActive', 'sortOrder'],
          editProperties: ['name', 'category', 'logoPath', 'isActive', 'sortOrder'],
          filterProperties: ['id', 'name', 'category', 'isActive'],
          properties: {
            id: { position: 1, isVisible: { list: true, filter: true, show: true, edit: false } },
            name: { position: 2, isTitle: true },
            category: {
              position: 3,
              type: 'select',
              availableValues: [
                { label: 'Магазины', value: 'Магазины' },
                { label: 'Рестораны', value: 'Рестораны' },
                { label: 'Банки и гос. учреждения', value: 'Банки и гос. учреждения' },
                { label: 'Торговые центры', value: 'Торговые центры' },
                { label: 'Фабрики и склады', value: 'Фабрики и склады' }
              ]
            },
            logoPath: { position: 4 },
            isActive: { position: 5, type: 'boolean' },
            sortOrder: { position: 6, type: 'number' }
          }
        }
      },
      {
        resource: { model: getPrismaModel(prisma, 'Review'), client: prisma },
        options: {
          parent: 'content',
          label: 'Отзывы',
          navigation: {
            name: 'Отзывы',
            icon: 'Star'
          },
          listProperties: ['id', 'authorName', 'reviewText', 'isActive', 'sortOrder', 'createdAt'],
          showProperties: ['id', 'authorName', 'reviewText', 'isActive', 'sortOrder', 'createdAt'],
          editProperties: ['authorName', 'reviewText', 'isActive', 'sortOrder'],
          filterProperties: ['id', 'authorName', 'isActive'],
          properties: {
            id: { position: 1, isVisible: { list: true, filter: true, show: true, edit: false } },
            authorName: { position: 2, isTitle: true },
            reviewText: { position: 3, type: 'textarea' },
            isActive: { position: 4, type: 'boolean' },
            sortOrder: { position: 5, type: 'number' },
            createdAt: { position: 6, isVisible: { edit: false }, type: 'datetime' }
          }
        }
      },

      {
        resource: { model: getPrismaModel(prisma, 'ContactMessage'), client: prisma },
        options: {
          parent: 'messages',
          label: 'Сообщения',
          navigation: {
            name: 'Сообщения',
            icon: 'MessageCircle'
          },
          listProperties: ['id', 'fullName', 'phone', 'email', 'isRead', 'adminReply', 'createdAt', 'updatedAt'],
          showProperties: ['id', 'fullName', 'phone', 'email', 'message', 'isRead', 'adminReply', 'createdAt', 'updatedAt'],
          editProperties: ['fullName', 'phone', 'email', 'message', 'isRead', 'adminReply'],
          filterProperties: ['id', 'fullName', 'phone', 'email', 'isRead'],
          properties: {
            id: { position: 1, isVisible: { list: true, filter: true, show: true, edit: false } },
            fullName: { position: 2, isTitle: true },
            phone: { position: 3 },
            email: { position: 4 },
            message: { position: 5, type: 'textarea' },
            isRead: { position: 6, type: 'boolean' },
            adminReply: {
              position: 7,
              type: 'textarea',
              isVisible: { list: true, filter: false, show: true, edit: true }
            },
            createdAt: { position: 8, isVisible: { edit: false }, type: 'datetime' },
            updatedAt: { position: 9, isVisible: { edit: false }, type: 'datetime' }
          },
          actions: {
            new: { isAccessible: false },
            delete: { isAccessible: false }
          }
        }
      }
    ]
  });
};