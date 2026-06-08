import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../db/index.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, requireRole('admin'), async (req, res) => {
  const { search } = req.query;
  try {
    let queryText = 'SELECT id, full_name, email, role, subject, phone, avatar_url, is_active, created_at FROM users WHERE 1=1';
    const params = [];
    if (search) {
      queryText += ' AND (LOWER(full_name) LIKE ? OR LOWER(email) LIKE ? OR LOWER(subject) LIKE ?)';
      const s = `%${search.trim().toLowerCase()}%`;
      params.push(s, s, s);
    }
    queryText += ' ORDER BY full_name ASC';
    const [rows] = await db.query(queryText, params);
    res.json({ data: rows, total: rows.length });
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ error: 'Server xatoligi.' });
  }
});

router.post('/', authenticateToken, requireRole('admin'), async (req, res) => {
  const { full_name, email, password, role, subject, phone } = req.body;
  if (!full_name || !email || !password || !role)
    return res.status(400).json({ error: "To'liq ism, email, parol va rol majburiy." });
  try {
    const [[existing]] = await db.query('SELECT id FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (existing) return res.status(400).json({ error: "Ushbu email bilan ro'yxatdan o'tgan foydalanuvchi allaqachon mavjud." });

    const passwordHash = await bcrypt.hash(password, 10);
    const [insertResult] = await db.query(
      'INSERT INTO users (full_name, email, password_hash, role, subject, phone, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)',
      [full_name.trim(), email.trim().toLowerCase(), passwordHash, role, subject?.trim() || null, phone?.trim() || null]
    );
    const [[newUser]] = await db.query(
      'SELECT id, full_name, email, role, subject, phone, is_active, created_at FROM users WHERE id = ?',
      [insertResult.insertId]
    );
    await db.query('INSERT INTO activity_logs (user_id, action, entity_type, entity_id) VALUES (?, ?, ?, ?)',
      [req.user.id, 'create', 'user', newUser.id]);
    res.status(201).json({ message: 'Foydalanuvchi muvaffaqiyatli yaratildi.', user: newUser });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Server xatoligi.' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { full_name, email, password, role, subject, phone, is_active } = req.body;
  if (req.user.role !== 'admin' && String(req.user.id) !== String(id))
    return res.status(403).json({ error: 'Ushbu amalni bajarish uchun sizda huquq yetarli emas.' });
  try {
    const [[existingUser]] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    if (!existingUser) return res.status(404).json({ error: 'Foydalanuvchi topilmadi.' });

    if (email && email.trim().toLowerCase() !== existingUser.email) {
      const [[dup]] = await db.query('SELECT id FROM users WHERE email = ? AND id <> ?', [email.trim().toLowerCase(), id]);
      if (dup) return res.status(400).json({ error: 'Ushbu email boshqa foydalanuvchi tomonidan ishlatilmoqda.' });
    }

    const passwordHash = password ? await bcrypt.hash(password, 10) : existingUser.password_hash;
    const finalRole = req.user.role === 'admin' && role ? role : existingUser.role;
    const finalActive = req.user.role === 'admin' && is_active !== undefined ? is_active : existingUser.is_active;

    await db.query(
      'UPDATE users SET full_name=?, email=?, password_hash=?, role=?, subject=?, phone=?, is_active=?, updated_at=NOW() WHERE id=?',
      [
        full_name?.trim() || existingUser.full_name,
        email?.trim().toLowerCase() || existingUser.email,
        passwordHash, finalRole,
        subject !== undefined ? (subject?.trim() || null) : existingUser.subject,
        phone !== undefined ? (phone?.trim() || null) : existingUser.phone,
        finalActive, id,
      ]
    );
    const [[updatedUser]] = await db.query(
      'SELECT id, full_name, email, role, subject, phone, is_active, created_at, updated_at FROM users WHERE id = ?', [id]
    );
    await db.query('INSERT INTO activity_logs (user_id, action, entity_type, entity_id) VALUES (?, ?, ?, ?)',
      [req.user.id, 'update', 'user', id]);
    res.json({ message: "Foydalanuvchi ma'lumotlari muvaffaqiyatli yangilandi.", user: updatedUser });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Server xatoligi.' });
  }
});

router.delete('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  const { id } = req.params;
  if (String(req.user.id) === String(id))
    return res.status(400).json({ error: "O'z akkauntingizni o'chira olmaysiz." });
  try {
    const [[user]] = await db.query('SELECT id FROM users WHERE id = ?', [id]);
    if (!user) return res.status(404).json({ error: 'Foydalanuvchi topilmadi.' });
    await db.query('DELETE FROM users WHERE id = ?', [id]);
    await db.query('INSERT INTO activity_logs (user_id, action, entity_type, entity_id) VALUES (?, ?, ?, ?)',
      [req.user.id, 'delete', 'user', id]);
    res.json({ message: "Foydalanuvchi muvaffaqiyatli o'chirildi." });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Server xatoligi.' });
  }
});

export default router;
