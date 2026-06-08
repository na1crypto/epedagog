import express from 'express';
import multer from 'multer';
import path from 'path';
import db from '../db/index.js';
import { uploadFile, deleteFile } from '../services/drive.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.docx', '.xlsx', '.pptx', '.doc', '.xls', '.ppt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) cb(null, true);
    else cb(new Error('Faqat PDF, DOCX, XLSX, PPTX fayllari ruxsat etilgan.'));
  },
});

router.get('/', authenticateToken, async (req, res) => {
  const { search, category, status } = req.query;
  try {
    let queryText = `
      SELECT d.*, u.full_name as author_name
      FROM documents d
      LEFT JOIN users u ON d.uploaded_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      queryText += ` AND (LOWER(d.title) LIKE ? OR LOWER(d.description) LIKE ?)`;
      params.push(`%${search.trim().toLowerCase()}%`, `%${search.trim().toLowerCase()}%`);
    }
    if (category && category !== 'Barchasi') {
      queryText += ` AND d.category = ?`;
      params.push(category);
    }
    if (status) {
      queryText += ` AND d.status = ?`;
      params.push(status);
    }
    queryText += ' ORDER BY d.created_at DESC';

    const [rows] = await db.query(queryText, params);

    // Fix localhost URLs → real server URL
    const serverUrl = process.env.SERVER_URL || `${req.protocol}://${req.get('host')}`;
    const fixed = rows.map(doc => {
      if (doc.drive_link && doc.drive_link.includes('localhost')) {
        doc.drive_link = doc.drive_link.replace(/https?:\/\/localhost:\d+/, serverUrl);
      }
      return doc;
    });

    res.json({ data: fixed, total: fixed.length });
  } catch (error) {
    console.error('Fetch documents error:', error);
    res.status(500).json({ error: 'Server xatoligi.' });
  }
});

router.post('/upload', authenticateToken, requireRole('admin', 'pedagog'), upload.single('file'), async (req, res) => {
  try {
    const { title, category, deadline, description } = req.body;
    const file = req.file;

    if (!title || !category) return res.status(400).json({ error: 'Sarlavha va kategoriya majburiy.' });
    if (!file) return res.status(400).json({ error: 'Fayl yuklanishi kerak.' });

    const uploadResult = await uploadFile(file);
    const fileExt = path.extname(file.originalname).toLowerCase().replace('.', '');

    const [insertResult] = await db.query(
      `INSERT INTO documents (title, description, drive_file_id, drive_link, file_type, file_size, category, uploaded_by, deadline, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title.trim(), description?.trim() || null, uploadResult.id, uploadResult.link, fileExt, file.size, category, req.user.id, deadline || null, 'uploaded']
    );

    const [[newDoc]] = await db.query('SELECT * FROM documents WHERE id = ?', [insertResult.insertId]);

    await db.query('INSERT INTO activity_logs (user_id, action, entity_type, entity_id) VALUES (?, ?, ?, ?)',
      [req.user.id, 'upload', 'document', newDoc.id]);

    res.status(201).json({ message: 'Hujjat muvaffaqiyatli yuklandi.', document: newDoc });
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({ error: error.message || 'Hujjat yuklashda xatolik yuz berdi.' });
  }
});

router.delete('/:id', authenticateToken, requireRole('admin', 'pedagog'), async (req, res) => {
  const { id } = req.params;
  try {
    const [[doc]] = await db.query('SELECT * FROM documents WHERE id = ?', [id]);
    if (!doc) return res.status(404).json({ error: 'Hujjat topilmadi.' });
    if (req.user.role !== 'admin' && doc.uploaded_by !== req.user.id)
      return res.status(403).json({ error: "Ushbu hujjatni o'chirish huquqi sizda yo'q." });

    let filename = null;
    if (doc.drive_link?.includes('/uploads/')) {
      const parts = doc.drive_link.split('/');
      filename = parts[parts.length - 1];
    }

    await deleteFile(doc.drive_file_id, filename);
    await db.query('DELETE FROM documents WHERE id = ?', [id]);
    await db.query('INSERT INTO activity_logs (user_id, action, entity_type, entity_id) VALUES (?, ?, ?, ?)',
      [req.user.id, 'delete', 'document', id]);

    res.json({ message: "Hujjat muvaffaqiyatli o'chirildi." });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ error: 'Server xatoligi yuz berdi.' });
  }
});

export default router;
