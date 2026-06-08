import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'epedagog-secret-key-2026-very-secure-change-it';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'epedagog-refresh-secret-key-2026-very-secure';

/**
 * Generate Access Token
 */
function generateAccessToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
}

/**
 * Generate Refresh Token
 */
function generateRefreshToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role },
    JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
}

/**
 * POST /api/auth/login
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email va parolni kiritish majburiy.' });
  }

  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email.trim().toLowerCase()]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Email yoki parol noto\'g\'ri.' });
    }

    if (!user.is_active) {
      return res.status(403).json({ error: 'Akkaunt faol emas. Administrator bilan bog\'laning.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Email yoki parol noto\'g\'ri.' });
    }

    const token = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Remove password hash from response
    const { password_hash, ...userResponse } = user;

    res.json({
      token,
      refreshToken,
      user: userResponse,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server xatoligi yuz berdi.' });
  }
});

/**
 * POST /api/auth/refresh
 */
router.post('/refresh', (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ error: 'Refresh token talab qilinadi.' });
  }

  try {
    jwt.verify(refreshToken, JWT_REFRESH_SECRET, async (err, payload) => {
      if (err) {
        return res.status(401).json({ error: 'Yaroqsiz refresh token.' });
      }

      try {
        const result = await db.query('SELECT * FROM users WHERE id = $1', [payload.id]);
        const user = result.rows[0];

        if (!user || !user.is_active) {
          return res.status(401).json({ error: 'Foydalanuvchi topilmadi yoki faol emas.' });
        }

        const newAccessToken = generateAccessToken(user);
        res.json({ token: newAccessToken });
      } catch (dbErr) {
        console.error('Refresh token DB error:', dbErr);
        res.status(500).json({ error: 'Server xatoligi.' });
      }
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ error: 'Server xatoligi.' });
  }
});

/**
 * POST /api/auth/logout
 */
router.post('/logout', (req, res) => {
  // Stateless JWT doesn't need DB changes, client will delete localStorage keys
  res.json({ message: 'Tizimdan muvaffaqiyatli chiqildi.' });
});

/**
 * GET /api/auth/me
 */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const result = await db.query('SELECT id, full_name, email, role, subject, phone, avatar_url, is_active, created_at FROM users WHERE id = $1', [req.user.id]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ error: 'Foydalanuvchi topilmadi.' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Server xatoligi.' });
  }
});

export default router;
