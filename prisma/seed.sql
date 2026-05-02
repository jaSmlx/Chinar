DO $$
BEGIN
    BEGIN EXECUTE 'ALTER TABLE admin_users ALTER COLUMN created_at SET DEFAULT now()'; EXCEPTION WHEN undefined_column THEN NULL; END;
    BEGIN EXECUTE 'ALTER TABLE admin_users ALTER COLUMN updated_at SET DEFAULT now()'; EXCEPTION WHEN undefined_column THEN NULL; END;
    BEGIN EXECUTE 'ALTER TABLE service_categories ALTER COLUMN created_at SET DEFAULT now()'; EXCEPTION WHEN undefined_column THEN NULL; END;
    BEGIN EXECUTE 'ALTER TABLE service_categories ALTER COLUMN updated_at SET DEFAULT now()'; EXCEPTION WHEN undefined_column THEN NULL; END;
    BEGIN EXECUTE 'ALTER TABLE services ALTER COLUMN created_at SET DEFAULT now()'; EXCEPTION WHEN undefined_column THEN NULL; END;
    BEGIN EXECUTE 'ALTER TABLE services ALTER COLUMN updated_at SET DEFAULT now()'; EXCEPTION WHEN undefined_column THEN NULL; END;
    BEGIN EXECUTE 'ALTER TABLE service_orders ALTER COLUMN created_at SET DEFAULT now()'; EXCEPTION WHEN undefined_column THEN NULL; END;
    BEGIN EXECUTE 'ALTER TABLE service_orders ALTER COLUMN updated_at SET DEFAULT now()'; EXCEPTION WHEN undefined_column THEN NULL; END;
    BEGIN EXECUTE 'ALTER TABLE vacancies ALTER COLUMN created_at SET DEFAULT now()'; EXCEPTION WHEN undefined_column THEN NULL; END;
    BEGIN EXECUTE 'ALTER TABLE vacancies ALTER COLUMN updated_at SET DEFAULT now()'; EXCEPTION WHEN undefined_column THEN NULL; END;
    BEGIN EXECUTE 'ALTER TABLE vacancy_duties ALTER COLUMN created_at SET DEFAULT now()'; EXCEPTION WHEN undefined_column THEN NULL; END;
    BEGIN EXECUTE 'ALTER TABLE vacancy_duties ALTER COLUMN updated_at SET DEFAULT now()'; EXCEPTION WHEN undefined_column THEN NULL; END;
    BEGIN EXECUTE 'ALTER TABLE resumes ALTER COLUMN created_at SET DEFAULT now()'; EXCEPTION WHEN undefined_column THEN NULL; END;
    BEGIN EXECUTE 'ALTER TABLE resumes ALTER COLUMN updated_at SET DEFAULT now()'; EXCEPTION WHEN undefined_column THEN NULL; END;
    BEGIN EXECUTE 'ALTER TABLE clients ALTER COLUMN created_at SET DEFAULT now()'; EXCEPTION WHEN undefined_column THEN NULL; END;
    BEGIN EXECUTE 'ALTER TABLE clients ALTER COLUMN updated_at SET DEFAULT now()'; EXCEPTION WHEN undefined_column THEN NULL; END;
    BEGIN EXECUTE 'ALTER TABLE reviews ALTER COLUMN created_at SET DEFAULT now()'; EXCEPTION WHEN undefined_column THEN NULL; END;
    BEGIN EXECUTE 'ALTER TABLE reviews ALTER COLUMN updated_at SET DEFAULT now()'; EXCEPTION WHEN undefined_column THEN NULL; END;
    BEGIN EXECUTE 'ALTER TABLE contact_messages ALTER COLUMN created_at SET DEFAULT now()'; EXCEPTION WHEN undefined_column THEN NULL; END;
    BEGIN EXECUTE 'ALTER TABLE contact_messages ALTER COLUMN updated_at SET DEFAULT now()'; EXCEPTION WHEN undefined_column THEN NULL; END;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

INSERT INTO admin_users (email, password_hash, full_name, role) VALUES
(
    'admin@chinar-security.ru',
    '$2b$10$YourBcryptHashHere.ReplaceWithRealHashOnFirstLogin',
    'Главный администратор',
    'superadmin'
),
(
    'manager@chinar-security.ru',
    '$2b$10$YourBcryptHashHere.ReplaceWithRealHashOnFirstLogin',
    'Менеджер по заявкам',
    'manager'
);

INSERT INTO service_categories (name, sort_order) VALUES
('Пультовая охрана',    1),
('Физическая охрана',   2),
('Пожарная безопасность', 3),
('Системы охраны',      4),
('Дополнительно',       5);

INSERT INTO services
    (category_id, name, description, price_from, price_unit, image_path, sort_order)
VALUES
(1, 'Защита квартиры',
 'Удалённая охрана квартиры с круглосуточным мониторингом и мгновенным реагированием группы быстрого реагирования.',
 1200, 'руб/мес', 'img/services/Защита квартиры.png', 1),

(1, 'Защита дома',
 'Комплексная защита частного дома с подключением сигнализации и контролем доступа.',
 1500, 'руб/мес', 'img/services/Защита дома.png', 2),

(1, 'Защита бизнеса',
 'Охрана коммерческих объектов с круглосуточным наблюдением и выездом экипажа при тревоге.',
 2000, 'руб/мес', 'img/services/Защита бизнеса.png', 3),

(2, 'Физическая охрана',
 'Постоянная охрана объектов с постоянным присутствием сотрудника на территории.',
 120, 'руб/час', 'img/services/Физическая защита.png', 1),

(2, 'Невооружённая охрана',
 'Контроль доступа и поддержание порядка без использования спецсредств.',
 100, 'руб/час', 'img/services/Невооруженная охрана.png', 2),

(2, 'Вооружённая охрана',
 'Охрана объектов повышенной важности с применением спецсредств и оружия.',
 300, 'руб/час', 'img/services/Вооруженная охрана.png', 3),

(3, 'Техобслуживание ПС',
 'Регулярное обслуживание пожарной сигнализации и проверка исправности оборудования.',
 1000, 'руб/мес', 'img/services/Тех обслуживание ПС.png', 1),

(3, 'Мониторинг пожарной безопасности',
 'Круглосуточный контроль систем пожарной безопасности с передачей сигналов тревоги.',
 800, 'руб/мес', 'img/services/Мониторинг.png', 2),

(3, 'Пожарные сигнализации',
 'Проектирование и установка систем пожарной сигнализации «под ключ».',
 5000, 'руб', 'img/services/Пожарные сигнализации.png', 3),

(4, 'Охранное оборудование',
 'Подбор и установка современного охранного оборудования.',
 3500, 'руб', 'img/services/Оборудование.png', 1),

(4, 'СКУД',
 'Системы контроля и управления доступом для бизнеса и предприятий.',
 7000, 'руб', 'img/services/СКУД.png', 2),

(4, 'Видеонаблюдение',
 'Установка и настройка камер видеонаблюдения с удалённым доступом.',
 5000, 'руб', 'img/services/Видеонаблюдение.png', 3),

(5, 'Каталог услуг',
 'Полный перечень услуг компании с подробным описанием и условиями сотрудничества.',
 NULL, NULL, 'img/services/Каталог.png', 1);


INSERT INTO service_orders
    (service_id, service_name, client_name, phone, email, status)
VALUES
(1,  'Защита квартиры',    'Иванов Сергей',   '+7 906 111-22-33', 'ivanov@mail.ru',   'new'),
(3,  'Защита бизнеса',     'ООО Ромашка',     '+7 917 444-55-66', 'romashka@biz.ru',  'in_progress'),
(12, 'Видеонаблюдение',    'Петрова Анна',    '+7 928 777-88-99', NULL,               'new'),
(5,  'Невооружённая охрана','Кузнецов Дмитрий','+7 903 000-11-22', 'kd@gmail.com',    'completed'),
(8,  'Мониторинг пожарной безопасности', 'ТЦ Меридиан', '+7 844 333-44-55', NULL,   'new');

INSERT INTO vacancies
    (title, schedule, salary_from, salary_unit, experience, requirements, conditions, sort_order)
VALUES
(
    'Охранник (объектовая охрана)',
    'Сутки / трое, дневные смены',
    40000, 'руб/мес',
    'От 1 года, рассматриваем без опыта',
    'Удостоверение охранника 4–6 разряда (поможем получить)',
    NULL,
    1
),
(
    'Охранник (вахтовый метод)',
    '30/30, 15/15 (вахта)',
    55000, 'руб/мес',
    'От 1 года',
    NULL,
    'Жильё, питание, проезд — за счёт компании',
    2
),
(
    'Охранник ГБР',
    'Сутки / двое, ночные смены',
    50000, 'руб/мес',
    'От 2 лет, опыт в силовых структурах — плюс',
    'Удостоверение 6 разряда, права кат. B',
    NULL,
    3
),
(
    'Оператор пульта охраны',
    'Сутки / трое',
    38000, 'руб/мес',
    'Не обязателен, обучим',
    'Уверенный пользователь ПК, внимательность',
    NULL,
    4
),
(
    'Техник по обслуживанию систем безопасности',
    'Пн–Пт, 09:00–18:00',
    45000, 'руб/мес',
    'От 1 года в монтаже/обслуживании систем',
    'Знание ОПС, СКУД, видеонаблюдения, права кат. B',
    NULL,
    5
);

INSERT INTO vacancy_duties (vacancy_id, duty_text, sort_order) VALUES
(1, 'Контроль пропускного режима на объекте',              1),
(1, 'Обход и осмотр охраняемой территории',                2),
(1, 'Взаимодействие с группой быстрого реагирования',      3),
(1, 'Ведение журнала дежурства',                           4);

INSERT INTO vacancy_duties (vacancy_id, duty_text, sort_order) VALUES
(2, 'Охрана объектов в режиме вахты',                      1),
(2, 'Несение службы на постах согласно инструкции',        2),
(2, 'Обеспечение внутреннего режима на объекте',           3),
(2, 'Взаимодействие с руководством вахты',                 4);

INSERT INTO vacancy_duties (vacancy_id, duty_text, sort_order) VALUES
(3, 'Выезд на тревожные сигналы с охраняемых объектов',    1),
(3, 'Задержание нарушителей до приезда полиции',           2),
(3, 'Патрулирование закреплённых территорий',              3),
(3, 'Составление актов и рапортов',                        4);

INSERT INTO vacancy_duties (vacancy_id, duty_text, sort_order) VALUES
(4, 'Мониторинг сигналов тревоги в реальном времени',      1),
(4, 'Координация выездов групп быстрого реагирования',     2),
(4, 'Ведение журналов событий',                            3),
(4, 'Приём и обработка входящих звонков',                  4);

INSERT INTO vacancy_duties (vacancy_id, duty_text, sort_order) VALUES
(5, 'Монтаж и настройка охранной и пожарной сигнализации', 1),
(5, 'Техническое обслуживание систем видеонаблюдения и СКУД', 2),
(5, 'Диагностика и устранение неисправностей',             3),
(5, 'Оформление технической документации',                 4);

INSERT INTO resumes
    (vacancy_id, vacancy_title, full_name, phone, resume_file_path, status)
VALUES
(1, 'Охранник (объектовая охрана)', 'Смирнов Алексей Владимирович',  '+7 905 123-45-67', NULL,                        'new'),
(3, 'Охранник ГБР',                 'Фролов Денис Игоревич',         '+7 916 234-56-78', 'uploads/resumes/frolov.pdf', 'viewed'),
(5, 'Техник по обслуживанию систем безопасности', 'Зайцев Михаил',  '+7 927 345-67-89', NULL,                        'interview'),
(4, 'Оператор пульта охраны',       'Морозова Елена Сергеевна',      '+7 938 456-78-90', NULL,                        'new'),
(2, 'Охранник (вахтовый метод)',     'Волков Андрей Петрович',        '+7 949 567-89-01', 'uploads/resumes/volkov.pdf', 'hired');

INSERT INTO clients (name, category, logo_path, sort_order) VALUES
('Магнит',      'Магазины', 'img/clients/Магнит.png',    1),
('Пятёрочка',   'Магазины', 'img/Пятерочка.png', 2),
('Fix Price',   'Магазины', 'img/clients/Fixprice.png',  3),
('Чижик',       'Магазины', 'img/clients/Чижик.png',     4),

('Бамберг',         'Рестораны', 'img/clients/Бамберг.png',          1),
('Шашлычный двор',  'Рестораны', 'img/clients/Шашлычный двор.png',   2),
('Маруся',          'Рестораны', 'img/clients/Маруся.png',            3),
('Вкусный дом',     'Рестораны', 'img/clients/Вкусный дом.png',       4),

('Сбербанк',       'Банки и гос. учреждения', 'img/clients/Сбер.png',             1),
('ВТБ',            'Банки и гос. учреждения', 'img/clients/ВТБ.png',              2),
('Почта России',   'Банки и гос. учреждения', 'img/clients/Почта России.png',     3),
('Мои Документы',  'Банки и гос. учреждения', 'img/clients/Мои документы.png',    4),

('Акварель',        'Торговые центры', 'img/clients/Акварель.png',       1),
('Европа',          'Торговые центры', 'img/clients/Европа.png',         2),
('Ворошиловский',   'Торговые центры', 'img/clients/Ворошиловский.png',  3),

('Wildberries', 'Фабрики и склады', 'img/clients/Wb.png',   1),
('Ozon',        'Фабрики и склады', 'img/clients/ozon.png', 2);

INSERT INTO reviews (author_name, review_text, sort_order) VALUES
(
    'Алексей Б.',
    '«Отличная организация! Быстро, просто, надежно! С момента обращения для установки охранной сигнализации в квартиру, до установки и подключения прошло менее суток. Отзывчивый персонал, удобная система управления сигнализацией при помощи приложения. Рекомендую 100%.»',
    1
),
(
    'Екатерина А.',
    '«Замечательная организация и работники. В обед позвонила, вечером квартира уже под охраной. Быстро, четко, все объяснили, показали. Работают профессионалы. Спасибо.»',
    2
),
(
    'Никита Г.',
    '«Отличные профессионалы, справляются со всеми задачами очень быстро! Очень внимательные, отзывчивые сотрудники, на все вопросы быстро реагируют 24/7. Мы очень рады, что обратились именно в это предприятие, чтобы обезопасить наш дом! Спасибо большое.»',
    3
);

INSERT INTO contact_messages (full_name, phone, email, message, is_read) VALUES
(
    'Громов Василий Николаевич',
    '+7 844 900-11-22',
    'gromov@mail.ru',
    'Добрый день! Хотим подключить охрану для нашего офиса площадью 200 кв.м. Пожалуйста, перезвоните.',
    FALSE
),
(
    'Соколова Ирина',
    '+7 917 800-33-44',
    NULL,
    'Интересует пультовая охрана квартиры. Когда можно вызвать специалиста для замера?',
    TRUE
),
(
    'ТЦ Меридиан — Администрация',
    '+7 844 500-66-77',
    'admin@meridian.ru',
    'Нам нужна комплексная система охраны: физическая охрана + видеонаблюдение. Хотим обсудить условия.',
    FALSE
);
