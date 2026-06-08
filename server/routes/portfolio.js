import express from 'express';
import db from '../db/index.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/:userId', authenticateToken, async (req, res) => {
  const { userId } = req.params;
  const { type } = req.query;
  try {
    let queryText = 'SELECT * FROM portfolios WHERE user_id = ?';
    const params = [userId];
    if (type && type !== 'Barchasi') {
      queryText += ' AND type = ?';
      params.push(type);
    }
    queryText += ' ORDER BY issue_date DESC, created_at DESC';
    const [rows] = await db.query(queryText, params);
    res.json({ data: rows, total: rows.length });
  } catch (error) {
    console.error('Fetch portfolio error:', error);
    res.status(500).json({ error: 'Server xatoligi.' });
  }
});

router.post('/', authenticateToken, requireRole('admin', 'pedagog'), async (req, res) => {
  const { title, type, description, issue_date, drive_file_id, drive_link } = req.body;
  if (!title || !type) return res.status(400).json({ error: 'Sarlavha va tur majburiy.' });
  try {
    const [insertResult] = await db.query(
      `INSERT INTO portfolios (user_id, title, type, description, drive_file_id, drive_link, issue_date)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, title.trim(), type, description?.trim() || null, drive_file_id || null, drive_link || null, issue_date || null]
    );
    const [[newItem]] = await db.query('SELECT * FROM portfolios WHERE id = ?', [insertResult.insertId]);
    await db.query('INSERT INTO activity_logs (user_id, action, entity_type, entity_id) VALUES (?, ?, ?, ?)',
      [req.user.id, 'create', 'portfolio', newItem.id]);
    res.status(201).json({ message: "Portfolio yozuvi muvaffaqiyatli qo'shildi.", data: newItem });
  } catch (error) {
    console.error('Create portfolio error:', error);
    res.status(500).json({ error: 'Server xatoligi.' });
  }
});

router.delete('/:id', authenticateToken, requireRole('admin', 'pedagog'), async (req, res) => {
  const { id } = req.params;
  try {
    const [[item]] = await db.query('SELECT * FROM portfolios WHERE id = ?', [id]);
    if (!item) return res.status(404).json({ error: 'Portfolio yozuvi topilmadi.' });
    if (req.user.role !== 'admin' && item.user_id !== req.user.id)
      return res.status(403).json({ error: "Ushbu yozuvni o'chirish huquqi sizda yo'q." });
    await db.query('DELETE FROM portfolios WHERE id = ?', [id]);
    await db.query('INSERT INTO activity_logs (user_id, action, entity_type, entity_id) VALUES (?, ?, ?, ?)',
      [req.user.id, 'delete', 'portfolio', id]);
    res.json({ message: "Portfolio yozuvi muvaffaqiyatli o'chirildi." });
  } catch (error) {
    console.error('Delete portfolio error:', error);
    res.status(500).json({ error: 'Server xatoligi.' });
  }
});

export default router;
