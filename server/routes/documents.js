import express from 'express';
import multer from 'multer';
import path from 'path';
import db from '../db/index.js';
import { uploadFile, deleteFile } from '../services/drive.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Multer memory storage configuration
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.docx', '.xlsx', '.pptx', '.doc', '.xls', '.ppt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Faqat PDF, DOCX, XLSX, PPTX fayllari ruxsat etilgan.'));
    }
  },
});

/**
 * GET /api/documents
 * Fetch documents with filters and pagination
 */
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
      params.push(`%${search.trim().toLowerCase()}%`);
      queryText += ` AND (LOWER(d.title) LIKE $${params.length} OR LOWER(d.description) LIKE $${params.length})`;
    }

    if (category && category !== 'Barchasi') {
      params.push(category);
      queryText += ` AND d.category = $${params.length}`;
    }

    if (status) {
      params.push(status);
      queryText += ` AND d.status = $${params.length}`;
    }

    // Role-based visibility (optional: in E-PEDAGOG, all authenticated users can view the documents)
    queryText += ' ORDER BY d.created_at DESC';

    const result = await db.query(queryText, params);
    
    res.json({
      data: result.rows,
      total: result.rowCount,
    });
  } catch (error) {
    console.error('Fetch documents error:', error);
    res.status(500).json({ error: 'Server xatoligi.' });
  }
});

/**
 * POST /api/documents/upload
 * Upload document
 */
router.post('/upload', authenticateToken, requireRole('admin', 'pedagog'), upload.single('file'), async (req, res) => {
  try {
    const { title, category, deadline, description } = req.body;
    const file = req.file;

    if (!title || !category) {
      return res.status(400).json({ error: 'Sarlavha va kategoriya majburiy.' });
    }

    if (!file) {
      return res.status(400).json({ error: 'Fayl yuklanishi kerak.' });
    }

    // 1. Upload file to storage (Drive or Local Fallback)
    const uploadResult = await uploadFile(file);

    // 2. Extract extension
    const fileExt = path.extname(file.originalname).toLowerCase().replace('.', '');

    // 3. Save to database
    const queryText = `
      INSERT INTO documents 
        (title, description, drive_file_id, drive_link, file_type, file_size, category, uploaded_by, deadline, status)
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const values = [
      title.trim(),
      description ? description.trim() : null,
      uploadResult.id,
      uploadResult.link,
      fileExt,
      file.size,
      category,
      req.user.id,
      deadline ? deadline : null,
      'uploaded'
    ];

    const result = await db.query(queryText, values);

    // Log activity
    await db.query(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id) VALUES ($1, $2, $3, $4)',
      [req.user.id, 'upload', 'document', result.rows[0].id]
    );

    res.status(201).json({
      message: 'Hujjat muvaffaqiyatli yuklandi.',
      document: result.rows[0],
    });
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({ error: error.message || 'Hujjat yuklashda xatolik yuz berdi.' });
  }
});

/**
 * DELETE /api/documents/:id
 * Delete document
 */
router.delete('/:id', authenticateToken, requireRole('admin', 'pedagog'), async (req, res) => {
  const { id } = req.params;

  try {
    // Check if document exists and user owns it (or is admin)
    const checkResult = await db.query('SELECT * FROM documents WHERE id = $1', [id]);
    const doc = checkResult.rows[0];

    if (!doc) {
      return res.status(404).json({ error: 'Hujjat topilmadi.' });
    }

    if (req.user.role !== 'admin' && doc.uploaded_by !== req.user.id) {
      return res.status(403).json({ error: 'Ushbu hujjatni o\'chirish huquqi sizda yo\'q.' });
    }

    // Determine local filename if it is local storage
    let filename = null;
    if (doc.drive_link && doc.drive_link.includes('/uploads/')) {
      const parts = doc.drive_link.split('/');
      filename = parts[parts.length - 1];
    }

    // 1. Delete physical file
    await deleteFile(doc.drive_file_id, filename);

    // 2. Delete database record
    await db.query('DELETE FROM documents WHERE id = $1', [id]);

    // Log activity
    await db.query(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id) VALUES ($1, $2, $3, $4)',
      [req.user.id, 'delete', 'document', id]
    );

    res.json({ message: 'Hujjat muvaffaqiyatli o\'chirildi.' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ error: 'Server xatoligi yuz berdi.' });
  }
});

export default router;
