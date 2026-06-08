import express from 'express';
import db from '../db/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const [[{ totalDocuments }]] = await db.query('SELECT COUNT(*) AS totalDocuments FROM documents');
    const [[{ totalUsers }]]     = await db.query('SELECT COUNT(*) AS totalUsers FROM users');
    const [[{ totalPedagog }]]   = await db.query("SELECT COUNT(*) AS totalPedagog FROM users WHERE role = 'pedagog'");
    const [[{ todayUploads }]]   = await db.query('SELECT COUNT(*) AS todayUploads FROM documents WHERE DATE(created_at) = CURDATE()');
    const [[{ overdueDocuments }]] = await db.query("SELECT COUNT(*) AS overdueDocuments FROM documents WHERE deadline < CURDATE() AND status <> 'uploaded'");

    // Weekly activity: DAYOFWEEK returns 1=Sun,2=Mon...7=Sat → remap to Mon-Sun (0-6)
    const weekStart = 'DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)';
    const [weeklyRows] = await db.query(
      `SELECT DAYOFWEEK(created_at) AS dow, COUNT(*) AS cnt
       FROM documents
       WHERE created_at >= ${weekStart}
       GROUP BY dow`
    );
    const weeklyActivity = [0, 0, 0, 0, 0, 0, 0];
    weeklyRows.forEach(r => {
      // DAYOFWEEK: 1=Sun,2=Mon,...,7=Sat → Mon=index 0
      const dow = parseInt(r.dow);
      const idx = dow === 1 ? 6 : dow - 2; // Sun→6, Mon→0, ..., Sat→5
      if (idx >= 0 && idx < 7) weeklyActivity[idx] = parseInt(r.cnt);
    });

    // Teachers stats
    const [teacherRows] = await db.query(`
      SELECT u.id, u.full_name AS name, u.subject,
        COUNT(d.id) AS uploaded,
        SUM(CASE WHEN d.deadline IS NULL OR d.deadline >= DATE(d.created_at) THEN 1 ELSE 0 END) AS on_time,
        SUM(CASE WHEN d.deadline IS NOT NULL AND d.deadline < DATE(d.created_at) THEN 1 ELSE 0 END) AS late
      FROM users u
      LEFT JOIN documents d ON u.id = d.uploaded_by
      WHERE u.role = 'pedagog'
      GROUP BY u.id, u.full_name, u.subject
      ORDER BY u.full_name ASC
    `);

    const required = 14;
    const teachersStats = teacherRows.map(t => {
      const uploaded = parseInt(t.uploaded) || 0;
      let status = 'danger';
      if (uploaded >= required) status = 'excellent';
      else if (uploaded >= 10)  status = 'good';
      else if (uploaded >= 6)   status = 'warning';
      return {
        id: t.id, name: t.name, subject: t.subject || '—',
        uploaded, required,
        onTime: parseInt(t.on_time) || 0,
        late: parseInt(t.late) || 0,
        status,
      };
    });

    res.json({ totalDocuments, totalUsers, totalPedagog, todayUploads, overdueDocuments, weeklyActivity, teachersStats });
  } catch (error) {
    console.error('Monitoring stats error:', error);
    res.status(500).json({ error: 'Server xatoligi.' });
  }
});

// Activity feed for real-time dashboard
router.get('/activity', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT a.id, a.action, a.entity_type, a.entity_id, a.created_at,
             u.full_name AS user_name
      FROM activity_logs a
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
      LIMIT 20
    `);
    res.json({ data: rows });
  } catch (error) {
    console.error('Activity feed error:', error);
    res.status(500).json({ error: 'Server xatoligi.' });
  }
});

export default router;
