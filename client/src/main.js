/**
 * E-PEDAGOG - Main Application Entry Point
 */
import './styles/index.css';
import { router } from './utils/router.js';
import { auth } from './utils/auth.js';

// Import pages
import { renderLogin, initLogin } from './pages/login.js';
import { renderDashboard, initDashboard } from './pages/dashboard.js';
import { renderDocuments, initDocuments } from './pages/documents.js';
import { renderPortfolio, initPortfolio } from './pages/portfolio.js';
import { renderMonitoring, initMonitoring } from './pages/monitoring.js';
import { renderUsers, initUsers } from './pages/users.js';
import { renderProfile, initProfile } from './pages/profile.js';

// Route guard - auth & role check
router.guard(async (path, options) => {
  const publicPages = ['login'];
  const isPublic = publicPages.includes(path);
  const isLoggedIn = auth.isAuthenticated();

  if (!isPublic && !isLoggedIn) {
    router.navigate('login');
    return false;
  }

  if (isPublic && isLoggedIn) {
    router.navigate('dashboard');
    return false;
  }

  // Role-based access
  if (options.roles && !auth.hasRole(...options.roles)) {
    router.navigate('dashboard');
    return false;
  }

  return true;
});

// Register routes
router.on('login', renderLogin);
router.on('dashboard', renderDashboard, { roles: ['admin', 'pedagog', 'mehmon'] });
router.on('documents', renderDocuments, { roles: ['admin', 'pedagog', 'mehmon'] });
router.on('portfolio', renderPortfolio, { roles: ['admin', 'pedagog'] });
router.on('monitoring', renderMonitoring, { roles: ['admin'] });
router.on('users', renderUsers, { roles: ['admin'] });
router.on('profile', renderProfile, { roles: ['admin', 'pedagog', 'mehmon'] });

// Initialize page-specific logic after route loads
window.addEventListener('route:loaded', (e) => {
  const { path } = e.detail;
  const inits = {
    login: initLogin,
    dashboard: initDashboard,
    documents: initDocuments,
    portfolio: initPortfolio,
    monitoring: initMonitoring,
    users: initUsers,
    profile: initProfile,
  };

  if (inits[path]) {
    setTimeout(() => inits[path](), 0);
  }
});

// Handle mobile sidebar close on outside click
document.addEventListener('click', (e) => {
  const sidebar = document.getElementById('sidebar');
  const menuToggle = document.getElementById('mobile-menu-toggle');
  if (sidebar && !sidebar.contains(e.target) && menuToggle && !menuToggle.contains(e.target)) {
    if (window.innerWidth < 1024) {
      sidebar.classList.add('-translate-x-full');
    }
  }
});

console.log('🎓 E-PEDAGOG tizimi ishga tushdi');
