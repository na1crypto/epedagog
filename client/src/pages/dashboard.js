import { auth } from '../utils/auth.js';
import { api } from '../utils/api.js';
import { renderSidebar, initSidebar } from '../components/sidebar.js';
import { showToast } from '../components/toast.js';

let refreshInterval = null;
let clockInterval = null;
let countdownInterval = null;
let chartInstance = null;
let weeklyData = [0, 0, 0, 0, 0, 0, 0];
const REFRESH_SECONDS = 30;

// ─── helpers ────────────────────────────────────────────────────────────────

function pad(n) { return String(n).padStart(2, '0'); }

function liveTime() {
  const n = new Date();
  return `${pad(n.getHours())}:${pad(n.getMinutes())}:${pad(n.getSeconds())}`;
}

function liveDate() {
  return new Date().toLocaleDateString('uz-UZ', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
}

function animateCounter(el, target) {
  if (!el) return;
  const duration = 800;
  const step = Math.ceil(target / (duration / 16));
  let cur = 0;
  const t = setInterval(() => {
    cur = Math.min(cur + step, target);
    el.textContent = cur;
    if (cur >= target) clearInterval(t);
  }, 16);
}

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return `${diff}s oldin`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m oldin`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}s oldin`;
  return new Date(dateStr).toLocaleDateString('uz-UZ');
}

const actionLabels = {
  create: { text: 'Yukladi', color: '#10b981', dot: 'bg-emerald-400' },
  update: { text: 'Yangiladi', color: '#3b82f6', dot: 'bg-blue-400' },
  delete: { text: "O'chirdi", color: '#ef4444', dot: 'bg-red-400' },
  login:  { text: 'Kirdi',    color: '#8b5cf6', dot: 'bg-violet-400' },
};
const entityLabels = { document: 'hujjat', portfolio: 'portfolio', user: "foydalanuvchi" };

const statusMap = {
  uploaded: { label: 'Yuklangan',       cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  pending:  { label: 'Kutilmoqda',      cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  overdue:  { label: "Muddati o'tgan",  cls: 'bg-red-50 text-red-700 border-red-200' },
};

// ─── render ──────────────────────────────────────────────────────────────────

export async function renderDashboard() {
  const user = auth.getUser();

  let stats = { totalDocuments: 0, todayUploads: 0, overdueDocuments: 0, totalPedagog: 0, weeklyActivity: weeklyData };
  let recentDocs = [];
  let activityLogs = [];

  try {
    const [sRes, dRes, aRes] = await Promise.all([
      api.get('/monitoring/stats').catch(() => stats),
      api.get('/documents').catch(() => ({ data: [] })),
      api.get('/monitoring/activity').catch(() => ({ data: [] })),
    ]);
    stats = sRes;
    weeklyData = sRes.weeklyActivity || weeklyData;
    recentDocs = (dRes.data || []).slice(0, 6);
    activityLogs = (aRes.data || []).slice(0, 12);
  } catch (e) {
    console.error('Dashboard load error:', e);
  }

  return `
    <div class="flex min-h-screen" style="background:#f0f2f5;">
      ${renderSidebar()}
      <main class="flex-1 lg:ml-64 flex flex-col min-h-screen">

        <!-- Top bar -->
        <div class="sticky top-0 z-30 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <button id="mobile-menu-toggle" class="lg:hidden p-1.5 hover:bg-gray-100 rounded-lg">
              <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
            </button>
            <div>
              <div class="flex items-center gap-2">
                <h1 class="text-sm font-semibold text-gray-800">Bosh sahifa</h1>
                <span class="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block"></span>JONLI
                </span>
              </div>
              <p class="text-xs text-gray-400" id="live-date">${liveDate()}</p>
            </div>
          </div>

          <div class="flex items-center gap-4">
            <!-- Refresh countdown -->
            <div class="hidden sm:flex items-center gap-2 text-xs text-gray-400">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
              <span id="refresh-countdown">${REFRESH_SECONDS}s</span>
            </div>
            <!-- Live clock -->
            <div class="font-mono text-sm font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-lg tracking-wider" id="live-clock">${liveTime()}</div>
            <!-- Salom -->
            <div class="hidden sm:flex items-center gap-2">
              <div class="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white" style="background:#1a2e4a;">
                ${auth.getInitials(user?.full_name)}
              </div>
              <span class="text-sm font-medium text-gray-700">${user?.full_name?.split(' ')[0] || 'Foydalanuvchi'}</span>
            </div>
          </div>
        </div>

        <div class="flex-1 p-5 lg:p-6 space-y-5">

          <!-- Stats row -->
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            ${[
              { id:'stat-docs',    label:'Jami hujjatlar',     val: stats.totalDocuments,  trend:'+3 bugun',  color:'#1d4ed8', bg:'#eff6ff', icon:'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', trendUp:true },
              { id:'stat-today',   label:'Bugungi yuklamalar', val: stats.todayUploads,    trend:'Faol',      color:'#0d9488', bg:'#f0fdfa', icon:'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12', trendUp:true },
              { id:'stat-overdue', label:"Muddati o'tgan",     val: stats.overdueDocuments,trend:'Diqqat!',   color:'#dc2626', bg:'#fef2f2', icon:'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z', trendUp:false },
              { id:'stat-pedagog', label:'Faol pedagoglar',    val: stats.totalPedagog,    trend:'Onlayn',    color:'#7c3aed', bg:'#f5f3ff', icon:'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', trendUp:true },
            ].map(s => `
              <div class="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <div class="flex items-center justify-between mb-3">
                  <span class="text-xs font-medium text-gray-500 uppercase tracking-wide">${s.label}</span>
                  <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background:${s.bg}; color:${s.color}">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${s.icon}"/></svg>
                  </div>
                </div>
                <div class="text-2xl font-bold text-gray-900 mb-1" id="${s.id}">${s.val}</div>
                <div class="flex items-center gap-1 text-xs ${s.trendUp ? 'text-emerald-600' : 'text-red-500'}">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${s.trendUp ? 'M5 10l7-7m0 0l7 7m-7-7v18' : 'M19 14l-7 7m0 0l-7-7m7 7V3'}"/></svg>
                  ${s.trend}
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Middle row: chart + activity feed -->
          <div class="grid grid-cols-1 xl:grid-cols-3 gap-4">

            <!-- Chart (2/3) -->
            <div class="xl:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
              <div class="flex items-center justify-between mb-4">
                <div>
                  <h2 class="text-sm font-semibold text-gray-800">Haftalik yuklash faolligi</h2>
                  <p class="text-xs text-gray-400 mt-0.5">Oxirgi 7 kun — hujjatlar soni</p>
                </div>
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                  <span class="text-xs text-gray-400">Jonli</span>
                </div>
              </div>
              <div style="position:relative; height:220px; width:100%;">
                <canvas id="activity-chart"></canvas>
              </div>
            </div>

            <!-- Activity feed (1/3) -->
            <div class="bg-white rounded-xl border border-gray-200 flex flex-col">
              <div class="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <h2 class="text-sm font-semibold text-gray-800">Jonli faollik</h2>
                <span class="text-xs text-gray-400" id="feed-updated">hozir yangilandi</span>
              </div>
              <div class="flex-1 overflow-y-auto divide-y divide-gray-50" id="activity-feed" style="max-height:280px;">
                ${renderActivityFeed(activityLogs)}
              </div>
            </div>
          </div>

          <!-- Bottom row: recent docs + quick actions -->
          <div class="grid grid-cols-1 xl:grid-cols-3 gap-4">

            <!-- Recent docs (2/3) -->
            <div class="xl:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div class="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                <div class="flex items-center gap-2">
                  <h2 class="text-sm font-semibold text-gray-800">Oxirgi hujjatlar</h2>
                  <span class="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full" id="doc-count">${recentDocs.length}</span>
                </div>
                <a href="#/documents" class="text-xs text-blue-600 hover:text-blue-700 font-medium">Barchasini ko'rish →</a>
              </div>
              <div class="overflow-x-auto" id="recent-docs-table">
                ${renderRecentDocsTable(recentDocs)}
              </div>
            </div>

            <!-- Quick actions (1/3) -->
            <div class="bg-white rounded-xl border border-gray-200 p-4">
              <h2 class="text-sm font-semibold text-gray-800 mb-3">Tezkor amallar</h2>
              <div class="space-y-2">
                <a href="#/documents" class="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-all group">
                  <div class="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs" style="background:#1d4ed8;">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
                  </div>
                  <div class="flex-1">
                    <p class="text-xs font-semibold text-gray-800">Hujjat yuklash</p>
                    <p class="text-[11px] text-gray-400">Yangi fayl qo'shish</p>
                  </div>
                  <svg class="w-3.5 h-3.5 text-gray-300 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                </a>
                <a href="#/portfolio" class="flex items-center gap-3 p-3 rounded-lg hover:bg-teal-50 border border-transparent hover:border-teal-100 transition-all group">
                  <div class="w-8 h-8 rounded-lg flex items-center justify-center text-white" style="background:#0d9488;">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
                  </div>
                  <div class="flex-1">
                    <p class="text-xs font-semibold text-gray-800">Portfolio</p>
                    <p class="text-[11px] text-gray-400">Yutuq qo'shish</p>
                  </div>
                  <svg class="w-3.5 h-3.5 text-gray-300 group-hover:text-teal-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                </a>
                ${auth.hasRole('admin') ? `
                <a href="#/monitoring" class="flex items-center gap-3 p-3 rounded-lg hover:bg-violet-50 border border-transparent hover:border-violet-100 transition-all group">
                  <div class="w-8 h-8 rounded-lg flex items-center justify-center text-white" style="background:#7c3aed;">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                  </div>
                  <div class="flex-1">
                    <p class="text-xs font-semibold text-gray-800">Monitoring</p>
                    <p class="text-[11px] text-gray-400">Hisobotlar</p>
                  </div>
                  <svg class="w-3.5 h-3.5 text-gray-300 group-hover:text-violet-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                </a>
                <a href="#/users" class="flex items-center gap-3 p-3 rounded-lg hover:bg-orange-50 border border-transparent hover:border-orange-100 transition-all group">
                  <div class="w-8 h-8 rounded-lg flex items-center justify-center text-white" style="background:#ea580c;">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                  </div>
                  <div class="flex-1">
                    <p class="text-xs font-semibold text-gray-800">Foydalanuvchilar</p>
                    <p class="text-[11px] text-gray-400">Boshqarish</p>
                  </div>
                  <svg class="w-3.5 h-3.5 text-gray-300 group-hover:text-orange-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                </a>` : ''}
              </div>

              <!-- System status -->
              <div class="mt-4 pt-3 border-t border-gray-100">
                <p class="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Tizim holati</p>
                <div class="space-y-1.5">
                  <div class="flex items-center justify-between text-xs">
                    <span class="text-gray-600">Server</span>
                    <span class="flex items-center gap-1 text-emerald-600 font-medium"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>Ishlayapti</span>
                  </div>
                  <div class="flex items-center justify-between text-xs">
                    <span class="text-gray-600">Ma'lumotlar bazasi</span>
                    <span class="flex items-center gap-1 text-emerald-600 font-medium"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>Ulangan</span>
                  </div>
                  <div class="flex items-center justify-between text-xs">
                    <span class="text-gray-600">So'nggi yangilanish</span>
                    <span class="text-gray-400 font-mono" id="last-refresh">${new Date().toLocaleTimeString('uz-UZ')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  `;
}

// ─── sub-renders ─────────────────────────────────────────────────────────────

function renderActivityFeed(logs) {
  if (!logs.length) return `<div class="px-4 py-6 text-center text-xs text-gray-400">Faollik yo'q</div>`;
  return logs.map(log => {
    const a = actionLabels[log.action] || { text: log.action, color: '#64748b', dot: 'bg-gray-400' };
    const entity = entityLabels[log.entity_type] || log.entity_type;
    return `
      <div class="flex items-start gap-2.5 px-4 py-2.5 hover:bg-gray-50 transition-colors">
        <div class="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${a.dot}"></div>
        <div class="flex-1 min-w-0">
          <p class="text-xs text-gray-700 leading-snug">
            <span class="font-medium">${log.user_name || 'Foydalanuvchi'}</span>
            <span style="color:${a.color}"> ${a.text}</span>
            <span class="text-gray-500"> — ${entity}</span>
          </p>
          <p class="text-[11px] text-gray-400 mt-0.5">${timeAgo(log.created_at)}</p>
        </div>
      </div>`;
  }).join('');
}

function renderRecentDocsTable(docs) {
  if (!docs.length) return `<div class="px-5 py-8 text-center text-xs text-gray-400">Hujjatlar yo'q</div>`;
  const fileColor = { pdf:'#ef4444', docx:'#3b82f6', doc:'#3b82f6', xlsx:'#10b981', xls:'#10b981', pptx:'#f59e0b', ppt:'#f59e0b' };
  return `
    <table class="w-full text-xs">
      <thead><tr class="bg-gray-50 border-b border-gray-100">
        <th class="px-5 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Nomi</th>
        <th class="px-5 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Muallif</th>
        <th class="px-5 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Kategoriya</th>
        <th class="px-5 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Holat</th>
        <th class="px-5 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Vaqt</th>
      </tr></thead>
      <tbody>
        ${docs.map(doc => {
          const st = statusMap[doc.status] || statusMap.pending;
          const fc = fileColor[doc.file_type] || '#64748b';
          return `
          <tr class="border-t border-gray-50 hover:bg-gray-50 transition-colors">
            <td class="px-5 py-3">
              <div class="flex items-center gap-2.5">
                <span class="text-[10px] font-bold px-1.5 py-0.5 rounded" style="background:${fc}18; color:${fc};">${(doc.file_type||'').toUpperCase()}</span>
                <span class="font-medium text-gray-800 truncate max-w-[180px]">${doc.title}</span>
              </div>
            </td>
            <td class="px-5 py-3 text-gray-500">${doc.author_name || '—'}</td>
            <td class="px-5 py-3 text-gray-500">${doc.category}</td>
            <td class="px-5 py-3"><span class="text-[11px] font-medium px-2 py-0.5 rounded-full border ${st.cls}">${st.label}</span></td>
            <td class="px-5 py-3 text-gray-400 font-mono">${timeAgo(doc.created_at)}</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>`;
}

// ─── init ────────────────────────────────────────────────────────────────────

export function initDashboard() {
  initSidebar();
  initChart();
  startClock();
  startAutoRefresh();
}

function startClock() {
  clockInterval && clearInterval(clockInterval);
  clockInterval = setInterval(() => {
    const el = document.getElementById('live-clock');
    if (el) el.textContent = liveTime();
    else clearInterval(clockInterval);
  }, 1000);
}

function startAutoRefresh() {
  let remaining = REFRESH_SECONDS;
  countdownInterval && clearInterval(countdownInterval);
  countdownInterval = setInterval(() => {
    remaining--;
    const el = document.getElementById('refresh-countdown');
    if (!el) { clearInterval(countdownInterval); return; }
    el.textContent = `${remaining}s`;
    if (remaining <= 0) {
      remaining = REFRESH_SECONDS;
      refreshDashboard();
    }
  }, 1000);
}

async function refreshDashboard() {
  try {
    const [sRes, dRes, aRes] = await Promise.all([
      api.get('/monitoring/stats').catch(() => null),
      api.get('/documents').catch(() => null),
      api.get('/monitoring/activity').catch(() => null),
    ]);

    if (sRes) {
      animateCounter(document.getElementById('stat-docs'),    sRes.totalDocuments);
      animateCounter(document.getElementById('stat-today'),   sRes.todayUploads);
      animateCounter(document.getElementById('stat-overdue'), sRes.overdueDocuments);
      animateCounter(document.getElementById('stat-pedagog'), sRes.totalPedagog);

      if (sRes.weeklyActivity && chartInstance) {
        chartInstance.data.datasets[0].data = sRes.weeklyActivity;
        chartInstance.update('active');
      }
    }

    if (dRes?.data) {
      const docs = dRes.data.slice(0, 6);
      const t = document.getElementById('recent-docs-table');
      if (t) t.innerHTML = renderRecentDocsTable(docs);
      const c = document.getElementById('doc-count');
      if (c) c.textContent = docs.length;
    }

    if (aRes?.data) {
      const feed = document.getElementById('activity-feed');
      if (feed) feed.innerHTML = renderActivityFeed(aRes.data.slice(0, 12));
      const feedTs = document.getElementById('feed-updated');
      if (feedTs) feedTs.textContent = `${new Date().toLocaleTimeString('uz-UZ')} yangilandi`;
    }

    const lr = document.getElementById('last-refresh');
    if (lr) lr.textContent = new Date().toLocaleTimeString('uz-UZ');

  } catch (e) {
    console.error('Refresh error:', e);
  }
}

function initChart() {
  const canvas = document.getElementById('activity-chart');
  if (!canvas) return;
  import('chart.js').then(({ Chart, registerables }) => {
    Chart.register(...registerables);
    const existing = Chart.getChart(canvas);
    if (existing) existing.destroy();

    chartInstance = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: ['Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan', 'Yak'],
        datasets: [{
          label: 'Hujjatlar',
          data: weeklyData,
          backgroundColor: (ctx) => {
            const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 200);
            g.addColorStop(0, 'rgba(29, 78, 216, 0.7)');
            g.addColorStop(1, 'rgba(29, 78, 216, 0.1)');
            return g;
          },
          borderColor: 'rgba(29, 78, 216, 0.9)',
          borderWidth: 2,
          borderRadius: 6,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 600 },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1e293b',
            titleColor: '#94a3b8',
            bodyColor: '#f1f5f9',
            padding: 10,
            borderColor: '#334155',
            borderWidth: 1,
            callbacks: { label: (ctx) => ` ${ctx.parsed.y} ta hujjat` }
          }
        },
        scales: {
          y: {
            beginAtZero: true, grid: { color: 'rgba(0,0,0,0.04)' },
            border: { display: false },
            ticks: { font: { family: 'Inter', size: 11 }, stepSize: 1, color: '#94a3b8' }
          },
          x: {
            grid: { display: false }, border: { display: false },
            ticks: { font: { family: 'Inter', size: 11 }, color: '#94a3b8' }
          }
        }
      }
    });
  });
}
