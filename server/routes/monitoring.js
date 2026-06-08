import express from 'express';
import db from '../db/index.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/monitoring/stats
 * Dashboard & Monitoring statistics (Admin & Pedagog & Mehmon can view, but admin gets full breakdown)
 */
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    // 1. Total documents count
    const totalDocsRes = await db.query('SELECT COUNT(*) FROM documents');
    const totalDocuments = parseInt(totalDocsRes.rows[0].count, 10);

    // 2. Total users count
    const totalUsersRes = await db.query('SELECT COUNT(*) FROM users');
    const totalUsers = parseInt(totalUsersRes.rows[0].count, 10);

    // 3. Total pedagog users count
    const totalPedagRes = await db.query("SELECT COUNT(*) FROM users WHERE role = 'pedagog'");
    const totalPedagog = parseInt(totalPedagRes.rows[0].count, 10);

    // 4. Today's uploads
    const todayUploadsRes = await db.query("SELECT COUNT(*) FROM documents WHERE created_at::date = CURRENT_DATE");
    const todayUploads = parseInt(todayUploadsRes.rows[0].count, 10);

    // 5. Overdue documents
    const overdueRes = await db.query("SELECT COUNT(*) FROM documents WHERE deadline < CURRENT_DATE AND status <> 'uploaded'");
    const overdueDocuments = parseInt(overdueRes.rows[0].count, 10);

    // 6. Weekly activity data for chart (Dush - Yak)
    // Counts documents uploaded in the last 7 days grouped by weekday
    const weeklyQuery = `
      SELECT 
        EXTRACT(ISODOW FROM created_at) as dow,
        COUNT(*) as count
      FROM documents
      WHERE created_at >= DATE_TRUNC('week', CURRENT_DATE)
      GROUP BY dow
      ORDER BY dow
    `;
    const weeklyRes = await db.query(weeklyQuery);
    
    // Initialize array with 7 elements (Monday - Sunday)
    const weeklyActivity = [0, 0, 0, 0, 0, 0, 0];
    weeklyRes.rows.forEach(row => {
      const idx = parseInt(row.dow, 10) - 1; // ISODOW is 1-indexed (Monday=1, Sunday=7)
      if (idx >= 0 && idx < 7) {
        weeklyActivity[idx] = parseInt(row.count, 10);
      }
    });

    // 7. Teachers stats for monitoring table
    const teachersQuery = `
      SELECT 
        u.id, 
        u.full_name as name, 
        u.subject,
        COUNT(d.id) as uploaded,
        COUNT(CASE WHEN d.deadline >= d.created_at::date OR d.deadline IS NULL THEN 1 END) as on_time,
        COUNT(CASE WHEN d.deadline < d.created_at::date THEN 1 END) as late
      FROM users u
      LEFT JOIN documents d ON u.id = d.uploaded_by
      WHERE u.role = 'pedagog'
      GROUP BY u.id, u.full_name, u.subject
      ORDER BY u.full_name ASC
    `;
    const teachersRes = await db.query(teachersQuery);
    
    const requiredDocsConst = 14; // Default required documents target
    const teachersStats = teachersRes.rows.map(t => {
      const uploaded = parseInt(t.uploaded, 10);
      const onTime = parseInt(t.on_time, 10);
      const late = parseInt(t.late, 10);
      
      // Calculate status based on uploaded percentage
      let status = 'danger';
      if (uploaded >= requiredDocsConst) {
        status = 'excellent';
      } else if (uploaded >= 10) {
        status = 'good';
      } else if (uploaded >= 6) {
        status = 'warning';
      }

      return {
        id: t.id,
        name: t.name,
        subject: t.subject || '—',
        uploaded,
        required: requiredDocsConst,
        onTime,
        late,
        status,
      };
    });

    res.json({
      totalDocuments,
      totalUsers,
      totalPedagog,
      todayUploads,
      overdueDocuments,
      weeklyActivity,
      teachersStats,
    });
  } catch (error) {
    console.error('Fetch monitoring stats error:', error);
    res.status(500).json({ error: 'Server xatoligi.' });
  }
});

export default router;
