/**
 * Sidebar navigation component
 */

import { auth } from '../utils/auth.js';
import { router } from '../utils/router.js';

const menuItems = [
  {
    id: 'dashboard',
    label: 'Bosh sahifa',
    icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zm-10 9a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zm10-2a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1h-4a1 1 0 01-1-1v-5z"/></svg>`,
    roles: ['admin', 'pedagog', 'mehmon'],
  },
  {
    id: 'documents',
    label: 'Hujjatlar',
    icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>`,
    roles: ['admin', 'pedagog', 'mehmon'],
  },
  {
    id: 'portfolio',
    label: 'Portfolio',
    icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>`,
    roles: ['admin', 'pedagog'],
  },
  {
    id: 'monitoring',
    label: 'Monitoring',
    icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>`,
    roles: ['admin'],
  },
  {
    id: 'users',
    label: 'Foydalanuvchilar',
    icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>`,
    roles: ['admin'],
  },
];

export function renderSidebar() {
  const user = auth.getUser();
  const userRole = user?.role || 'mehmon';
  const currentPath = router.getPath();
  const initials = auth.getInitials(user?.full_name);

  const filteredMenu = menuItems.filter(item => item.roles.includes(userRole));

  const roleLabels = {
    admin: 'Administrator',
    pedagog: 'Pedagog',
    mehmon: 'Mehmon',
  };

  return `
    <aside id="sidebar" class="fixed left-0 top-0 h-full w-64 z-40 flex flex-col transition-transform duration-300 lg:translate-x-0 -translate-x-full" style="background: linear-gradient(180deg, #1a2e4a 0%, #0f1d31 100%);">
      <!-- Logo area -->
      <div class="px-5 pt-5 pb-4">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style="background: #0891b2;">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
            </svg>
          </div>
          <div>
            <h1 class="text-white font-bold text-base tracking-tight leading-tight">E-PEDAGOG</h1>
            <p class="text-slate-500 text-[10px] font-medium uppercase tracking-widest">Boshqaruv tizimi</p>
          </div>
        </div>
      </div>

      <!-- Teal divider line -->
      <div class="mx-5 h-px" style="background: linear-gradient(90deg, #0891b2, transparent);"></div>

      <!-- Navigation -->
      <nav class="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        ${filteredMenu.map(item => `
          <a href="#/${item.id}" class="sidebar-link ${currentPath === item.id ? 'active' : ''}" data-page="${item.id}">
            ${item.icon}
            <span class="text-sm">${item.label}</span>
          </a>
        `).join('')}
      </nav>

      <!-- User card at bottom -->
      <div class="mx-3 mb-4 p-3 rounded-lg" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.06);">
        <a href="#/profile" class="flex items-center gap-3 group cursor-pointer mb-2.5">
          <div class="w-9 h-9 rounded-lg flex items-center justify-center text-white font-semibold text-sm flex-shrink-0" style="background: #0891b2;">
            ${initials}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-white text-sm font-medium truncate group-hover:text-accent-300 transition-colors leading-tight">${user?.full_name || 'Foydalanuvchi'}</p>
            <p class="text-slate-500 text-xs">${roleLabels[userRole] || userRole}</p>
          </div>
        </a>
        <div class="h-px bg-white/5 mb-2.5"></div>
        <button id="logout-btn" class="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-all duration-200">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
          <span>Tizimdan chiqish</span>
        </button>
      </div>
    </aside>
  `;
}

export function initSidebar() {
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      auth.logout();
      router.navigate('login');
    });
  }

  // Mobile menu toggle
  const menuToggle = document.getElementById('mobile-menu-toggle');
  const sidebar = document.getElementById('sidebar');
  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', () => {
      sidebar.classList.toggle('-translate-x-full');
    });
  }
}
