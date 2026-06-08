import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const isProduction = process.env.NODE_ENV === 'production';

// Parse DATABASE_URL  mysql://user:pass@host:port/dbname
function parseDbUrl(url) {
  try {
    const u = new URL(url);
    return {
      host: u.hostname,
      port: parseInt(u.port) || 4000,
      user: decodeURIComponent(u.username),
      password: decodeURIComponent(u.password),
      database: decodeURIComponent(u.pathname.slice(1)),
      ssl: isProduction ? { rejectUnauthorized: false } : undefined,
    };
  } catch {
    return null;
  }
}

const dbConfig = parseDbUrl(process.env.DATABASE_URL) || {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 4000,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'epedagog',
  ssl: isProduction ? { rejectUnauthorized: false } : undefined,
};

const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function initDatabase() {
  let conn;
  try {
    conn = await pool.getConnection();

    const [rows] = await conn.query(`
      SELECT COUNT(*) as cnt FROM information_schema.tables
      WHERE table_schema = DATABASE() AND table_name = 'users'
    `);

    const tablesExist = rows[0].cnt > 0;

    if (!tablesExist) {
      console.log("⏳ Ma'lumotlar bazasi topilmadi. Sxema yaratilmoqda...");

      const initSqlPath = path.join(__dirname, '../../database/init.sql');
      const seedSqlPath = path.join(__dirname, '../../database/seed.sql');

      if (fs.existsSync(initSqlPath)) {
        const initSql = fs.readFileSync(initSqlPath, 'utf8');
        const statements = initSql.split(';').map(s => s.trim()).filter(s => s.length > 0);
        for (const stmt of statements) {
          await conn.query(stmt);
        }
        console.log('✅ Sxema muvaffaqiyatli yaratildi (init.sql).');
      }

      if (fs.existsSync(seedSqlPath)) {
        const seedSql = fs.readFileSync(seedSqlPath, 'utf8');
        const statements = seedSql.split(';').map(s => s.trim()).filter(s => s.length > 0);
        for (const stmt of statements) {
          await conn.query(stmt);
        }
        console.log("✅ Seed ma'lumotlari bazaga yuklandi (seed.sql).");
      }
    } else {
      console.log("✅ Ma'lumotlar bazasi sxemasi allaqachon mavjud.");
    }
  } catch (error) {
    console.error("❌ Ma'lumotlar bazasini initsializatsiya qilishda xatolik:", error.message);
  } finally {
    if (conn) conn.release();
  }
}

export default {
  query: (text, params) => pool.execute(text, params),
  pool,
  initDatabase,
};
