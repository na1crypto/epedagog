import jwt from 'jsonwebtoken';

/**
 * Authentication middleware
 * Verifies JWT token from Authorization header
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Avtorizatsiyadan o\'tilmagan. Token topilmadi.' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'epedagog-secret-key-2026-very-secure-change-it', (err, user) => {
    if (err) {
      console.warn('JWT Verification error:', err.message);
      return res.status(401).json({ error: 'Sessiya muddati tugagan yoki token noto\'g\'ri.' });
    }
    req.user = user;
    next();
  });
}

/**
 * Role-based authorization middleware
 * Checks if the user's role is allowed
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Avtorizatsiyadan o\'tilmagan.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Ushbu amalni bajarish uchun sizda huquq yetarli emas.' });
    }

    next();
  };
}
