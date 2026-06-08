/**
 * Header component
 */
import { auth } from '../utils/auth.js';

export function renderHeader(title, subtitle = '') {
  const now = new Date();
  const dateStr = now.toLocaleDateString('uz-UZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return `
    <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-200">
      <div class="flex items-center gap-3">
        <button id="mobile-menu-toggle" class="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200">
          <svg class="w-5 h-5 text-dark-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
        <div>
          <h1 class="text-xl font-bold text-dark-800 leading-tight">${title}</h1>
          <p class="text-dark-400 text-xs mt-0.5">${subtitle || dateStr}</p>
        </div>
      </div>
      <div class="flex items-center gap-2.5">
        <div class="relative hidden sm:block">
          <svg class="w-4 h-4 text-dark-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input type="text" id="global-search" placeholder="Qidirish..." class="pl-9 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-sm w-56 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" />
        </div>
        <button class="relative p-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200">
          <svg class="w-4 h-4 text-dark-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
          <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
      </div>
    </header>
  `;
}
