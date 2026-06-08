import mysql from 'mysql2/promise';

const conn = await mysql.createConnection({
  host: 'gateway01.eu-central-1.prod.aws.tidbcloud.com',
  port: 4000,
  user: 'sJwLacNCvu5iX2E.root',
  password: 'cp1QqN736G9jM77p',
  database: 'dokon_db',
  ssl: { rejectUnauthorized: false }
});

console.log('Connected to TiDB...');

// Documents: [title, description, drive_file_id, drive_link, file_type, file_size, category, folder_path, uploaded_by, deadline, status, created_at]
const documents = [
  // Karimov Olimjon (user 2) - Matematika
  ['Algebra 9-sinf dars ishlanma - 1-mavzu', 'Kvadrat tenglamalar mavzusida 9-sinf uchun dars ishlanma', null, null, 'docx', 512000, 'Dars ishlanma', null, 2, '2026-06-15', 'uploaded', '2026-05-26 09:15:00'],
  ["2025-2026 o'quv yili taqvim rejasi - Matematika", "Matematika fani bo'yicha 2025-2026 o'quv yili uchun taqvim reja", null, null, 'xlsx', 245760, 'Taqvim reja', null, 2, '2026-06-20', 'uploaded', '2026-05-27 10:30:00'],
  ['Matematika 8-sinf dars ishlanma - Kvadrat ildiz', "Kvadrat ildiz va uning xossalari mavzusida dars ishlanma", null, null, 'docx', 487424, 'Dars ishlanma', null, 2, '2026-06-18', 'uploaded', '2026-05-28 14:00:00'],
  ['May oyi hisoboti - Matematika fani', "Matematika fani bo'yicha 2026-yil may oyi faoliyat hisoboti", null, null, 'pdf', 1048576, 'Hisobot', null, 2, '2026-06-30', 'uploaded', '2026-05-31 16:45:00'],
  ['Matematika olimpiadasi savollari', "9-10 sinf o'quvchilari uchun olimpiada savollari to'plami", null, null, 'pdf', 768000, "Metodik qo'llanma", null, 2, '2026-07-01', 'pending', '2026-06-02 08:20:00'],
  ['Geometriya 10-sinf - Trigonometriya dars ishlanma', 'Trigonometrik funksiyalar va ularning grafiklari mavzusi', null, null, 'docx', 634880, 'Dars ishlanma', null, 2, '2026-06-25', 'uploaded', '2026-06-03 11:00:00'],
  ["Matematika fani o'quv dasturi - 2025-2026", "Umumiy o'rta ta'lim maktablari uchun matematika fani o'quv dasturi", null, null, 'pdf', 2097152, "O'quv dastur", null, 2, '2026-06-28', 'uploaded', '2026-06-05 09:30:00'],

  // Rahimova Nilufar (user 3) - Ingliz tili
  ['Ingliz tili 7-sinf leksika dars ishlanma', 'Travel and Transport mavzusida leksika va grammatika dars ishlanma', null, null, 'docx', 425984, 'Dars ishlanma', null, 3, '2026-06-17', 'uploaded', '2026-05-26 11:00:00'],
  ["Ingliz tili fani o'quv dasturi", "Ingliz tili fani bo'yicha 2025-2026 o'quv yili davlat dasturi", null, null, 'pdf', 1572864, "O'quv dastur", null, 3, '2026-06-22', 'uploaded', '2026-05-29 13:15:00'],
  ["Ingliz tili grammatika qo'llanma", "Present Perfect va Past Simple grammatik mavzular bo'yicha qo'llanma", null, null, 'pdf', 2621440, "Metodik qo'llanma", null, 3, '2026-07-01', 'uploaded', '2026-05-30 15:00:00'],
  ['Ingliz tili 5-sinf taqvim reja', "5-sinf ingliz tili fani bo'yicha choraklik taqvim reja", null, null, 'xlsx', 311296, 'Taqvim reja', null, 3, '2026-06-19', 'pending', '2026-06-01 09:00:00'],
  ['May-Iyun hisoboti - Ingliz tili fani', "Ingliz tili fani bo'yicha yarim yillik faoliyat hisoboti", null, null, 'pdf', 921600, 'Hisobot', null, 3, '2026-06-30', 'uploaded', '2026-06-04 10:45:00'],
  ["Ingliz tili 9-sinf - Speaking mashg'ulotlari", "Og'zaki nutq ko'nikmalarini rivojlantirish uchun mashq to'plami", null, null, 'docx', 358400, 'Dars ishlanma', null, 3, '2026-06-10', 'overdue', '2026-05-27 08:30:00'],

  // Toshmatov Sardor (user 4) - Fizika
  ['Fizika 10-sinf elektr toki mavzusi', "Elektr toki, qarshilik va Om qonuni mavzusida dars ishlanma", null, null, 'docx', 573440, 'Dars ishlanma', null, 4, '2026-06-16', 'uploaded', '2026-05-28 10:00:00'],
  ["Fizika metodik qo'llanma - Mexanika bo'limi", "Mexanika bo'limi: kinematika va dinamika mavzulari bo'yicha metodika", null, null, 'pdf', 3145728, "Metodik qo'llanma", null, 4, '2026-06-25', 'uploaded', '2026-05-30 14:30:00'],
  ['2025-2026 taqvim reja - Fizika fani', "Fizika fani bo'yicha o'quv yili taqvim-mavzuviy rejasi", null, null, 'xlsx', 286720, 'Taqvim reja', null, 4, '2026-06-20', 'uploaded', '2026-06-01 11:30:00'],
  ["Fizika labaratoriya ishlari to'plami", "10-11 sinf uchun fizika labaratoriya mashg'ulotlari to'plami", null, null, 'pdf', 1835008, "Metodik qo'llanma", null, 4, '2026-07-01', 'pending', '2026-06-03 09:15:00'],
  ['Pedagoglar faoliyati hisoboti - Iyun 2026', "Fizika fani pedagogi faoliyati bo'yicha iyun oyi hisoboti", null, null, 'pdf', 745472, 'Hisobot', null, 4, '2026-06-30', 'pending', '2026-06-06 16:00:00'],
  ['Fizika 11-sinf kvant fizikasi dars ishlanma', "Foton va fotoeffekt mavzusida 11-sinf uchun dars ishlanma", null, null, 'docx', 499712, 'Dars ishlanma', null, 4, '2026-06-22', 'uploaded', '2026-06-07 08:45:00'],
];

// Portfolios: [user_id, title, type, description, drive_file_id, drive_link, issue_date]
const portfolios = [
  // Karimov Olimjon (user 2)
  [2, 'Matematikaidan respublika musobaqasi - II daraja', 'Yutuq', "O'zbekiston Respublikasi matematika olimpiadasida II darajali diplom", null, null, '2025-03-15'],
  [2, 'Milliy sertifikat - Pedagog mahorati', 'Sertifikat', "Xalq ta'limi vazirligi tomonidan berilgan 'Pedagog mahorati' milliy sertifikati", null, null, '2024-11-20'],
  [2, "Matematika ta'limida zamonaviy metodlar", 'Maqola', "Respublika ilmiy-amaliy konferensiyasida chop etilgan maqola", null, null, '2025-09-10'],
  [2, 'Matematik modellashtirish kursi', 'Kurs', "Toshkent davlat pedagogika universiteti qoshida malaka oshirish kursi", null, null, '2024-06-30'],
  [2, 'Eng yaxshi pedagog - 2024', 'Yutuq', "Tuman ko'rik-tanlovida 'Eng yaxshi matematika o'qituvchisi' unvoni", null, null, '2024-12-25'],

  // Rahimova Nilufar (user 3)
  [3, 'Cambridge B2 First Certificate', 'Sertifikat', "British Council tomonidan berilgan Cambridge B2 First ingliz tili sertifikati", null, null, '2024-05-20'],
  [3, "Ingliz tili o'qitishda kommunikativ yondashuv", 'Maqola', "Xalqaro ilmiy jurnalda chop etilgan metodika maqolasi", null, null, '2025-02-14'],
  [3, 'IELTS 7.0 sertifikati', 'Sertifikat', "British Council Toshkent markazi IELTS sertifikati, band 7.0", null, null, '2024-08-10'],
  [3, 'Respublika ingliz tili olimpiadasi - I daraja', 'Diplom', "O'quvchi bilan birga respublika olimpiadasida I darajali diplom", null, null, '2025-04-18'],
  [3, 'Digital metodlar kursi', 'Kurs', "Xalq ta'limi instituti qoshida 'Raqamli texnologiyalar orqali til o'qitish' kursi", null, null, '2024-09-15'],

  // Toshmatov Sardor (user 4)
  [4, "Fizika fanini o'qitishda innovatsion metodlar", 'Maqola', "O'zbekiston fanlar akademiyasi jurnalida chop etilgan ilmiy maqola", null, null, '2025-01-25'],
  [4, 'Fizika viloyat musobaqasi - III daraja', 'Diplom', "Viloyat fizika olimpiadasida III darajali diplom", null, null, '2025-03-20'],
  [4, "STEM ta'lim kursi", 'Kurs', "Prezident maktablari boshqarmasi qoshida STEM metodologiyasi bo'yicha kurs", null, null, '2024-07-12'],
  [4, "Yoshlar va fan forumi - Faol ishtirokchi", 'Sertifikat', "'Yoshlar va fan' respublika forumida faol ishtirokchi sifatida sertifikat", null, null, '2024-10-05'],
];

// Insert documents
console.log('Inserting documents...');
let docCount = 0;
for (const doc of documents) {
  const [result] = await conn.execute(
    `INSERT IGNORE INTO documents (title, description, drive_file_id, drive_link, file_type, file_size, category, folder_path, uploaded_by, deadline, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    doc
  );
  if (result.affectedRows > 0) docCount++;
}
console.log(`Inserted ${docCount} new documents (${documents.length - docCount} already existed)`);

// Insert portfolios
console.log('Inserting portfolio items...');
let portCount = 0;
for (const p of portfolios) {
  const [result] = await conn.execute(
    `INSERT IGNORE INTO portfolios (user_id, title, type, description, drive_file_id, drive_link, issue_date)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    p
  );
  if (result.affectedRows > 0) portCount++;
}
console.log(`Inserted ${portCount} new portfolio items (${portfolios.length - portCount} already existed)`);

await conn.end();
console.log('Done! Seed data inserted successfully.');
