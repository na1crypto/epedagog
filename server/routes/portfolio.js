import express from 'express';
import db from '../db/index.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/portfolio/:userId
 * Fetch portfolio items for a specific user
 */
router.get('/:userId', authenticateToken, async (req, res) => {
  const { userId } = req.params;
  const { type } = req.query;

  try {
    let queryText = 'SELECT * FROM portfolios WHERE user_id = $1';
    const params = [userId];

    if (type && type !== 'Barchasi') {
      params.push(type);
      queryText += ` AND type = $2`;
    }

    queryText += ' ORDER BY issue_date DESC, created_at DESC';

    const result = await db.query(queryText, params);
    res.json({
      data: result.rows,
      total: result.rowCount,
    });
  } catch (error) {
    console.error('Fetch portfolio error:', error);
    res.status(500).json({ error: 'Server xatoligi.' });
  }
});

/**
 * POST /api/portfolio
 * Add a new portfolio item
 */
router.post('/', authenticateToken, requireRole('admin', 'pedagog'), async (req, res) => {
  const { title, type, description, issue_date, drive_file_id, drive_link } = req.body;

  if (!title || !type) {
    return res.status(400).json({ error: 'Sarlavha va tur majburiy.' });
  }

  try {
    const queryText = `
      INSERT INTO portfolios (user_id, title, type, description, drive_file_id, drive_link, issue_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [
      req.user.id,
      title.trim(),
      type,
      description ? description.trim() : null,
      drive_file_id || null,
      drive_link || null,
      issue_date || null,
    ];

    const result = await db.query(queryText, values);

    // Log activity
    await db.query(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id) VALUES ($1, $2, $3, $4)',
      [req.user.id, 'create', 'portfolio', result.rows[0].id]
    );

    res.status(201).json({
      message: 'Portfolio yozuvi muvaffaqiyatli qo\'shildi.',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Create portfolio error:', error);
    res.status(500).json({ error: 'Server xatoligi.' });
  }
});

/**
 * DELETE /api/portfolio/:id
 * Delete a portfolio item
 */
router.delete('/:id', authenticateToken, requireRole('admin', 'pedagog'), async (req, res) => {
  const { id } = req.params;

  try {
    // Check ownership
    const checkResult = await db.query('SELECT * FROM portfolios WHERE id = $1', [id]);
    const item = checkResult.rows[0];

    if (!item) {
      return res.status(404).json({ error: 'Portfolio yozuvi topilmadi.' });
    }

    if (req.user.role !== 'admin' && item.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Ushbu yozuvni o\'chirish huquqi sizda yo\'q.' });
    }

    await db.query('DELETE FROM portfolios WHERE id = $1', [id]);

    // Log activity
    await db.query(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id) VALUES ($1, $2, $3, $4)',
      [req.user.id, 'delete', 'portfolio', id]
    );

    res.json({ message: 'Portfolio yozuvi muvaffaqiyatli o\'chirildi.' });
  } catch (error) {
    console.error('Delete portfolio error:', error);
    res.status(500).json({ error: 'Server xatoligi.' });
  }
});

export default router;
