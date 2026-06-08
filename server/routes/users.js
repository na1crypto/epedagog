import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../db/index.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/users
 * Get all users (Admin only)
 */
router.get('/', authenticateToken, requireRole('admin'), async (req, res) => {
  const { search } = req.query;
  try {
    let queryText = 'SELECT id, full_name, email, role, subject, phone, avatar_url, is_active, created_at FROM users WHERE 1=1';
    const params = [];

    if (search) {
      params.push(`%${search.trim().toLowerCase()}%`);
      queryText += ` AND (LOWER(full_name) LIKE $1 OR LOWER(email) LIKE $1 OR LOWER(subject) LIKE $1)`;
    }

    queryText += ' ORDER BY full_name ASC';
    const result = await db.query(queryText, params);
    res.json({ data: result.rows, total: result.rowCount });
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ error: 'Server xatoligi.' });
  }
});

/**
 * POST /api/users
 * Create user (Admin only)
 */
router.post('/', authenticateToken, requireRole('admin'), async (req, res) => {
  const { full_name, email, password, role, subject, phone } = req.body;

  if (!full_name || !email || !password || !role) {
    return res.status(400).json({ error: 'To\'liq ism, email, parol va rol majburiy.' });
  }

  try {
    // Check if email already exists
    const checkUser = await db.query('SELECT id FROM users WHERE email = $1', [email.trim().toLowerCase()]);
    if (checkUser.rowCount > 0) {
      return res.status(400).json({ error: 'Ushbu email bilan ro\'yxatdan o\'tgan foydalanuvchi allaqachon mavjud.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const queryText = `
      INSERT INTO users (full_name, email, password_hash, role, subject, phone, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, true)
      RETURNING id, full_name, email, role, subject, phone, is_active, created_at
    `;

    const result = await db.query(queryText, [
      full_name.trim(),
      email.trim().toLowerCase(),
      passwordHash,
      role,
      subject ? subject.trim() : null,
      phone ? phone.trim() : null,
    ]);

    // Log activity
    await db.query(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id) VALUES ($1, $2, $3, $4)',
      [req.user.id, 'create', 'user', result.rows[0].id]
    );

    res.status(201).json({
      message: 'Foydalanuvchi muvaffaqiyatli yaratildi.',
      user: result.rows[0],
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Server xatoligi.' });
  }
});

/**
 * PUT /api/users/:id
 * Update user (Admin only, or current user updating their own profile)
 */
router.put('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { full_name, email, password, role, subject, phone, is_active } = req.body;

  // Access control: admins can update anyone, regular user can only update themselves
  if (req.user.role !== 'admin' && String(req.user.id) !== String(id)) {
    return res.status(403).json({ error: 'Ushbu amalni bajarish uchun sizda huquq yetarli emas.' });
  }

  try {
    // Check if user exists
    const checkUser = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    if (checkUser.rowCount === 0) {
      return res.status(404).json({ error: 'Foydalanuvchi topilmadi.' });
    }
    const existingUser = checkUser.rows[0];

    // If updating email, check uniqueness
    if (email && email.trim().toLowerCase() !== existingUser.email) {
      const checkEmail = await db.query('SELECT id FROM users WHERE email = $1 AND id <> $2', [email.trim().toLowerCase(), id]);
      if (checkEmail.rowCount > 0) {
        return res.status(400).json({ error: 'Ushbu email boshqa foydalanuvchi tomonidan ishlatilmoqda.' });
      }
    }

    let passwordHash = existingUser.password_hash;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      passwordHash = await bcrypt.hash(password, salt);
    }

    // Role can only be changed by admin
    const finalRole = req.user.role === 'admin' && role ? role : existingUser.role;
    // Active state can only be changed by admin
    const finalActive = req.user.role === 'admin' && is_active !== undefined ? is_active : existingUser.is_active;

    const queryText = `
      UPDATE users
      SET full_name = $1, email = $2, password_hash = $3, role = $4, subject = $5, phone = $6, is_active = $7, updated_at = NOW()
      WHERE id = $8
      RETURNING id, full_name, email, role, subject, phone, is_active, created_at, updated_at
    `;

    const result = await db.query(queryText, [
      full_name ? full_name.trim() : existingUser.full_name,
      email ? email.trim().toLowerCase() : existingUser.email,
      passwordHash,
      finalRole,
      subject !== undefined ? (subject ? subject.trim() : null) : existingUser.subject,
      phone !== undefined ? (phone ? phone.trim() : null) : existingUser.phone,
      finalActive,
      id,
    ]);

    // Log activity
    await db.query(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id) VALUES ($1, $2, $3, $4)',
      [req.user.id, 'update', 'user', id]
    );

    res.json({
      message: 'Foydalanuvchi ma\'lumotlari muvaffaqiyatli yangilandi.',
      user: result.rows[0],
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Server xatoligi.' });
  }
});

/**
 * DELETE /api/users/:id
 * Delete user (Admin only)
 */
router.delete('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  const { id } = req.params;

  if (String(req.user.id) === String(id)) {
    return res.status(400).json({ error: 'O\'z akkauntingizni o\'chira olmaysiz.' });
  }

  try {
    const checkUser = await db.query('SELECT id FROM users WHERE id = $1', [id]);
    if (checkUser.rowCount === 0) {
      return res.status(404).json({ error: 'Foydalanuvchi topilmadi.' });
    }

    await db.query('DELETE FROM users WHERE id = $1', [id]);

    // Log activity
    await db.query(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id) VALUES ($1, $2, $3, $4)',
      [req.user.id, 'delete', 'user', id]
    );

    res.json({ message: 'Foydalanuvchi muvaffaqiyatli o\'chirildi.' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Server xatoligi.' });
  }
});

export default router;
