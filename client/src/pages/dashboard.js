/**
 * Dashboard page
 */
import { auth } from '../utils/auth.js';
import { api } from '../utils/api.js';
import { renderSidebar, initSidebar } from '../components/sidebar.js';
import { renderHeader } from '../components/header.js';

let weeklyActivityData = [0, 0, 0, 0, 0, 0, 0];

const icons = {
  doc: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>',
  upload: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>',
  alert: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>',
  users: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>',
};

const statusMap = {
  uploaded: { label: 'Yuklangan', class: 'badge-success' },
  pending: { label: 'Kutilmoqda', class: 'badge-warning' },
  overdue: { label: 'Muddati o\'tgan', class: 'badge-danger' },
};

// Stat card accent colors
const statColors = [
  { border: '#0284c7', bg: '#eff6ff', icon: '#0284c7' },   // blue
  { border: '#0d9488', bg: '#f0fdfa', icon: '#0d9488' },   // teal
  { border: '#dc2626', bg: '#fef2f2', icon: '#dc2626' },   // red
  { border: '#7c3aed', bg: '#f5f3ff', icon: '#7c3aed' },   // violet
];

export async function renderDashboard() {
  const user = auth.getUser();

  let statsData = {
    totalDocuments: 0,
    todayUploads: 0,
    overdueDocuments: 0,
    totalPedagog: 0,
  };

  let recentDocs = [];

  try {
    const [statsRes, docsRes] = await Promise.all([
      api.get('/monitoring/stats').catch(err => {
        console.warn('Stats fetch failed, using fallback:', err);
        return { totalDocuments: 0, todayUploads: 0, overdueDocuments: 0, totalPedagog: 0, weeklyActivity: [0,0,0,0,0,0,0] };
      }),
      api.get('/documents').catch(err => {
        console.warn('Documents fetch failed:', err);
        return { data: [] };
      })
    ]);

    statsData = statsRes;
    weeklyActivityData = statsRes.weeklyActivity || [0, 0, 0, 0, 0, 0, 0];
    recentDocs = (docsRes.data || []).slice(0, 5);
  } catch (error) {
    console.error('Dashboard load error:', error);
  }

  const stats = [
    { label: 'Jami hujjatlar', value: statsData.totalDocuments, sub: '+12 bu hafta', icon: 'doc' },
    { label: 'Bugungi yuklamalar', value: statsData.todayUploads, sub: 'Faol kun', icon: 'upload' },
    { label: 'Muddati o\'tganlar', value: statsData.overdueDocuments, sub: 'E\'tibor talab etiladi', icon: 'alert' },
    { label: 'Pedagoglar', value: statsData.totalPedagog, sub: "Faol o'qituvchilar", icon: 'users' },
  ];

  return `
    <div class="flex min-h-screen" style="background: #f8f9fa;">
      ${renderSidebar()}
      <main class="flex-1 lg:ml-64 p-6 lg:p-8">
        ${renderHeader(`Salom, ${user?.full_name?.split(' ')[0] || 'Foydalanuvchi'}!`)}

        <!-- Stats Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          ${stats.map((s, i) => `
            <div class="stat-card animate-scale-in border-l-4" style="animation-delay: ${i * 80}ms; border-left-color: ${statColors[i].border};">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <p class="text-dark-400 text-xs font-medium uppercase tracking-wide">${s.label}</p>
                  <p class="text-3xl font-bold text-dark-800 mt-2 mb-1">${s.value}</p>
                  <p class="text-xs ${i === 2 ? 'text-red-500' : 'text-dark-400'}">${s.sub}</p>
                </div>
                <div class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ml-3" style="background: ${statColors[i].bg}; color: ${statColors[i].icon};">
                  ${icons[s.icon]}
                </div>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-5">
          <!-- Chart -->
          <div class="xl:col-span-2 glass-card p-6">
            <div class="flex items-center justify-between mb-5">
              <div>
                <h2 class="text-base font-semibold text-dark-800">Haftalik faollik</h2>
                <p class="text-xs text-dark-400 mt-0.5">Yuklangan hujjatlar soni</p>
              </div>
              <select class="text-xs border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-dark-600 focus:outline-none focus:ring-2 focus:ring-primary-500/20">
                <option>Bu hafta</option>
              </select>
            </div>
            <div style="position: relative; height: 240px; width: 100%;">
              <canvas id="activity-chart"></canvas>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="glass-card p-6">
            <h2 class="text-base font-semibold text-dark-800 mb-4">Tezkor harakatlar</h2>
            <div class="space-y-2.5">
              <a href="#/documents" class="flex items-center gap-3 p-3.5 rounded-xl border border-gray-100 hover:border-primary-200 hover:bg-primary-50 transition-all group">
                <div class="w-9 h-9 rounded-lg flex items-center justify-center text-white flex-shrink-0" style="background: #0284c7;">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
                </div>
                <div>
                  <p class="font-medium text-dark-800 text-sm group-hover:text-primary-700 transition-colors">Hujjat yuklash</p>
                  <p class="text-xs text-dark-400">Yangi fayl qo'shish</p>
                </div>
              </a>
              <a href="#/portfolio" class="flex items-center gap-3 p-3.5 rounded-xl border border-gray-100 hover:border-accent-200 hover:bg-accent-50 transition-all group">
                <div class="w-9 h-9 rounded-lg flex items-center justify-center text-white flex-shrink-0" style="background: #0d9488;">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
                </div>
                <div>
                  <p class="font-medium text-dark-800 text-sm group-hover:text-accent-700 transition-colors">Portfolio</p>
                  <p class="text-xs text-dark-400">Yutuqlarni qo'shish</p>
                </div>
              </a>
              ${auth.hasRole('admin') ? `
              <a href="#/monitoring" class="flex items-center gap-3 p-3.5 rounded-xl border border-gray-100 hover:border-violet-200 hover:bg-violet-50 transition-all group">
                <div class="w-9 h-9 rounded-lg flex items-center justify-center text-white flex-shrink-0" style="background: #7c3aed;">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                </div>
                <div>
                  <p class="font-medium text-dark-800 text-sm group-hover:text-violet-700 transition-colors">Monitoring</p>
                  <p class="text-xs text-dark-400">Hisobotlarni ko'rish</p>
                </div>
              </a>` : ''}
            </div>
          </div>
        </div>

        <!-- Recent Documents -->
        <div class="glass-card overflow-hidden">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 class="text-base font-semibold text-dark-800">Oxirgi hujjatlar</h2>
            <a href="#/documents" class="text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors">Barchasini ko'rish &rarr;</a>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-dark-500 uppercase tracking-wider">Hujjat nomi</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-dark-500 uppercase tracking-wider">Muallif</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-dark-500 uppercase tracking-wider">Kategoriya</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-dark-500 uppercase tracking-wider">Sana</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-dark-500 uppercase tracking-wider">Holat</th>
                </tr>
              </thead>
              <tbody>
                ${recentDocs.length === 0 ? `
                <tr>
                  <td colspan="5" class="px-6 py-10 text-center text-dark-400">
                    <div class="flex flex-col items-center gap-2">
                      <svg class="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                      <span class="text-sm">Hujjatlar yuklanmagan</span>
                    </div>
                  </td>
                </tr>
                ` : recentDocs.map(doc => `
                <tr class="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                  <td class="px-6 py-4 font-medium text-dark-800">${doc.title}</td>
                  <td class="px-6 py-4 text-dark-500">${doc.author_name || 'Muallif topilmadi'}</td>
                  <td class="px-6 py-4"><span class="badge-info">${doc.category}</span></td>
                  <td class="px-6 py-4 text-dark-400 text-xs">${new Date(doc.created_at).toLocaleDateString('uz-UZ')}</td>
                  <td class="px-6 py-4"><span class="${statusMap[doc.status]?.class || 'badge-warning'}">${statusMap[doc.status]?.label || doc.status}</span></td>
                </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  `;
}

export function initDashboard() {
  initSidebar();
  initChart();
}

function initChart() {
  const canvas = document.getElementById('activity-chart');
  if (!canvas) return;
  import('chart.js').then(({ Chart, registerables }) => {
    Chart.register(...registerables);

    const existingChart = Chart.getChart(canvas);
    if (existingChart) existingChart.destroy();

    new Chart(canvas, {
      type: 'bar',
      data: {
        labels: ['Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan', 'Yak'],
        datasets: [{
          label: 'Yuklangan hujjatlar',
          data: weeklyActivityData,
          backgroundColor: 'rgba(2, 132, 199, 0.1)',
          borderColor: 'rgba(2, 132, 199, 0.7)',
          borderWidth: 2,
          borderRadius: 6,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(0,0,0,0.04)' },
            border: { display: false },
            ticks: {
              font: { family: 'Inter', size: 11 },
              stepSize: 1,
              color: '#94a3b8',
            }
          },
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: { font: { family: 'Inter', size: 11 }, color: '#94a3b8' }
          }
        }
      }
    });
  });
}
