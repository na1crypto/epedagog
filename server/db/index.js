import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const { Pool } = pg;

// Pool instance
const isProduction = process.env.NODE_ENV === 'production';

let poolConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
};

try {
  const urlStr = process.env.DATABASE_URL.replace('postgresql://', 'http://').replace('postgres://', 'http://');
  const dbUrl = new URL(urlStr);
  poolConfig = {
    user: decodeURIComponent(dbUrl.username),
    password: String(decodeURIComponent(dbUrl.password)),
    host: dbUrl.hostname,
    port: dbUrl.port ? parseInt(dbUrl.port, 10) : 5432,
    database: decodeURIComponent(dbUrl.pathname.slice(1)),
    ssl: isProduction ? { rejectUnauthorized: false } : false,
  };
} catch (e) {
  console.warn('URL orqali DATABASE_URL ni parslashda ogohlantirish, asl format ishlatiladi:', e.message);
}

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('Kutilmagan PostgreSQL xatosi:', err);
});

/**
  * Database initialization function
  * Reads init.sql and seed.sql and runs them if the 'users' table is not present.
  */
export async function initDatabase() {
  let client;
  try {
    client = await pool.connect();
    // Check if 'users' table exists
    const res = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    const tablesExist = res.rows[0].exists;
    
    if (!tablesExist) {
      console.log('⏳ Ma\'lumotlar bazasi topilmadi. Sxema yaratilmoqda...');
      
      const initSqlPath = path.join(__dirname, '../../database/init.sql');
      const seedSqlPath = path.join(__dirname, '../../database/seed.sql');
      
      if (fs.existsSync(initSqlPath)) {
        const initSql = fs.readFileSync(initSqlPath, 'utf8');
        await client.query(initSql);
        console.log('✅ Sxema muvaffaqiyatli yaratildi (init.sql).');
      } else {
        console.warn('⚠️ init.sql fayli topilmadi!');
      }
      
      if (fs.existsSync(seedSqlPath)) {
        const seedSql = fs.readFileSync(seedSqlPath, 'utf8');
        await client.query(seedSql);
        console.log('✅ Seed ma\'lumotlari bazaga yuklandi (seed.sql).');
      } else {
        console.warn('⚠️ seed.sql fayli topilmadi!');
      }
    } else {
      console.log('✅ Ma\'lumotlar bazasi sxemasi allaqachon mavjud.');
    }
  } catch (error) {
    console.error('❌ Ma\'lumotlar bazasini initsializatsiya qilishda xatolik:', error.message);
    console.error('Iltimos, .env faylidagi DATABASE_URL va PostgreSQL ishlayotganini tekshiring.');
  } finally {
    if (client) client.release();
  }
}

export default {
  query: (text, params) => pool.query(text, params),
  pool,
  initDatabase,
};
