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
    <aside id="sidebar" class="fixed left-0 top-0 h-full w-64 gradient-sidebar z-40 flex flex-col transition-transform duration-300 lg:translate-x-0 -translate-x-full">
      <!-- Logo -->
      <div class="p-6 pb-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
            </svg>
          </div>
          <div>
            <h1 class="text-white font-bold text-lg tracking-tight">E-PEDAGOG</h1>
            <p class="text-dark-400 text-[11px] font-medium tracking-wider uppercase">Boshqaruv tizimi</p>
          </div>
        </div>
      </div>

      <!-- Divider -->
      <div class="mx-5 h-px bg-gradient-to-r from-transparent via-dark-600 to-transparent"></div>

      <!-- Navigation -->
      <nav class="flex-1 px-4 py-5 space-y-1 overflow-y-auto">
        ${filteredMenu.map(item => `
          <a href="#/${item.id}" class="sidebar-link relative ${currentPath === item.id ? 'active' : ''}" data-page="${item.id}">
            ${item.icon}
            <span class="text-sm">${item.label}</span>
          </a>
        `).join('')}
      </nav>

      <!-- User Profile -->
      <div class="p-4 mx-3 mb-4 rounded-xl bg-white/5 border border-white/5">
        <a href="#/profile" class="flex items-center gap-3 group cursor-pointer">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white font-semibold text-sm shadow-md">
            ${initials}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-white text-sm font-medium truncate group-hover:text-primary-300 transition-colors">${user?.full_name || 'Foydalanuvchi'}</p>
            <p class="text-dark-400 text-xs">${roleLabels[userRole] || userRole}</p>
          </div>
        </a>
        <button id="logout-btn" class="mt-3 w-full flex items-center gap-2 px-3 py-2 text-sm text-dark-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
          <span>Chiqish</span>
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
