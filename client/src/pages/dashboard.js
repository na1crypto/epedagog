/**
 * Dashboard page
 */
import { auth } from '../utils/auth.js';
import { api } from '../utils/api.js';
import { renderSidebar, initSidebar } from '../components/sidebar.js';
import { renderHeader } from '../components/header.js';

let weeklyActivityData = [0, 0, 0, 0, 0, 0, 0];

const icons = {
  doc: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>',
  upload: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>',
  alert: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>',
  users: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>',
};

const statusMap = {
  uploaded: { label: 'Yuklangan', class: 'badge-success' },
  pending: { label: 'Kutilmoqda', class: 'badge-warning' },
  overdue: { label: 'Muddati o\'tgan', class: 'badge-danger' },
};

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
    // Fetch stats and documents from real backend API
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
    { label: 'Jami hujjatlar', value: statsData.totalDocuments, change: '+12 bu hafta', icon: 'doc', color: 'from-primary-500 to-primary-600' },
    { label: 'Bugungi yuklamalar', value: statsData.todayUploads, change: 'Faol kun', icon: 'upload', color: 'from-accent-500 to-accent-600' },
    { label: 'Muddati o\'tganlar', value: statsData.overdueDocuments, change: 'E\'tibor talab etiladi', icon: 'alert', color: 'from-red-500 to-red-600' },
    { label: 'Pedagoglar', value: statsData.totalPedagog, change: 'Faol o\'qituvchilar', icon: 'users', color: 'from-violet-500 to-violet-600' },
  ];

  return `
    <div class="flex min-h-screen bg-dark-50">
      ${renderSidebar()}
      <main class="flex-1 lg:ml-64 p-6 lg:p-8">
        ${renderHeader(`Salom, ${user?.full_name?.split(' ')[0] || 'Foydalanuvchi'}! 👋`)}
 
        <!-- Stats Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          ${stats.map((s, i) => `
            <div class="stat-card animate-scale-in" style="animation-delay: ${i * 80}ms">
              <div class="flex items-start justify-between">
                <div>
                  <p class="text-dark-400 text-sm font-medium">${s.label}</p>
                  <p class="text-3xl font-bold text-dark-800 mt-2">${s.value}</p>
                  <p class="text-xs mt-2 ${s.label.includes('o\'tgan') ? 'text-red-500' : 'text-accent-600'}">${s.change}</p>
                </div>
                <div class="w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white shadow-lg">
                  ${icons[s.icon]}
                </div>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <!-- Chart -->
          <div class="xl:col-span-2 glass-card p-6">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-lg font-semibold text-dark-800">Haftalik faollik</h2>
              <select class="text-sm border border-dark-200 rounded-lg px-3 py-1.5 bg-white text-dark-600 focus:outline-none focus:ring-2 focus:ring-primary-500/30">
                <option>Bu hafta</option>
              </select>
            </div>
            <div style="position: relative; height: 260px; width: 100%;">
              <canvas id="activity-chart"></canvas>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="glass-card p-6">
            <h2 class="text-lg font-semibold text-dark-800 mb-5">Tezkor harakatlar</h2>
            <div class="space-y-3">
              <a href="#/documents" class="flex items-center gap-4 p-4 rounded-xl bg-primary-50 hover:bg-primary-100 transition-colors group">
                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white shadow-md">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
                </div>
                <div>
                  <p class="font-medium text-dark-800 text-sm group-hover:text-primary-700 transition-colors">Hujjat yuklash</p>
                  <p class="text-xs text-dark-400">Yangi fayl qo'shish</p>
                </div>
              </a>
              <a href="#/portfolio" class="flex items-center gap-4 p-4 rounded-xl bg-accent-50 hover:bg-accent-100 transition-colors group">
                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center text-white shadow-md">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
                </div>
                <div>
                  <p class="font-medium text-dark-800 text-sm group-hover:text-accent-700 transition-colors">Portfolio</p>
                  <p class="text-xs text-dark-400">Yutuqlarni qo'shish</p>
                </div>
              </a>
              ${auth.hasRole('admin') ? `
              <a href="#/monitoring" class="flex items-center gap-4 p-4 rounded-xl bg-violet-50 hover:bg-violet-100 transition-colors group">
                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center text-white shadow-md">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
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
        <div class="mt-6 glass-card overflow-hidden">
          <div class="flex items-center justify-between p-6 pb-0">
            <h2 class="text-lg font-semibold text-dark-800">Oxirgi hujjatlar</h2>
            <a href="#/documents" class="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors">Barchasini ko'rish →</a>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm mt-4">
              <thead class="bg-dark-50/80">
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
                  <td colspan="5" class="px-6 py-8 text-center text-dark-400 font-medium bg-white">Hujjatlar yuklanmagan</td>
                </tr>
                ` : recentDocs.map(doc => `
                <tr class="border-t border-dark-100 hover:bg-primary-50/50 transition-colors">
                  <td class="px-6 py-4 font-medium text-dark-800">${doc.title}</td>
                  <td class="px-6 py-4 text-dark-600">${doc.author_name || 'Muallif topilmadi'}</td>
                  <td class="px-6 py-4"><span class="badge-info">${doc.category}</span></td>
                  <td class="px-6 py-4 text-dark-500">${new Date(doc.created_at).toLocaleDateString('uz-UZ')}</td>
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
          backgroundColor: 'rgba(59, 130, 246, 0.15)',
          borderColor: 'rgba(59, 130, 246, 0.8)',
          borderWidth: 2,
          borderRadius: 8,
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
            ticks: { 
              font: { family: 'Inter' },
              stepSize: 1,
            } 
          },
          x: { grid: { display: false }, ticks: { font: { family: 'Inter' } } }
        }
      }
    });
  });
}
