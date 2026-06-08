/**
 * Monitoring page (Admin only)
 */
import { api } from '../utils/api.js';
import { renderSidebar, initSidebar } from '../components/sidebar.js';
import { renderHeader } from '../components/header.js';

let chartActivityData = [0, 0, 0, 0, 0, 0, 0];

const statusConfig = {
  excellent: { label: 'A\'lo', dot: 'status-online', bg: 'bg-accent-100 text-accent-700' },
  good: { label: 'Yaxshi', dot: 'status-online', bg: 'bg-primary-100 text-primary-700' },
  warning: { label: 'O\'rtacha', dot: 'status-warning', bg: 'bg-amber-100 text-amber-700' },
  danger: { label: 'Past', dot: 'status-offline', bg: 'bg-red-100 text-red-700' },
};

export async function renderMonitoring() {
  let statsData = {
    totalDocuments: 0,
    totalUsers: 0,
    totalPedagog: 0,
    todayUploads: 0,
    overdueDocuments: 0,
    weeklyActivity: [0, 0, 0, 0, 0, 0, 0],
    teachersStats: [],
  };

  try {
    const res = await api.get('/monitoring/stats');
    statsData = res;
    chartActivityData = res.weeklyActivity || [0, 0, 0, 0, 0, 0, 0];
  } catch (error) {
    console.error('Fetch monitoring stats error:', error);
  }

  const teachers = statsData.teachersStats || [];
  
  const totalUploaded = teachers.reduce((a, t) => a + t.uploaded, 0);
  const totalRequired = teachers.reduce((a, t) => a + t.required, 0) || 1; // Prevent division by zero
  const avgPercent = Math.round((totalUploaded / totalRequired) * 100);
  const excellentCount = teachers.filter(t => t.status === 'excellent').length;
  const dangerCount = teachers.filter(t => t.status === 'danger' || t.status === 'warning').length;

  return `
    <div class="flex min-h-screen bg-dark-50">
      ${renderSidebar()}
      <main class="flex-1 lg:ml-64 overflow-y-auto">
        <div class="p-6 lg:p-8">
        ${renderHeader('Monitoring paneli', 'Pedagoglar faoliyatini kuzating')}

        <!-- Summary Stats -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div class="stat-card">
            <p class="text-dark-400 text-sm">Umumiy bajarilish</p>
            <div class="flex items-end gap-2 mt-2">
              <span class="text-3xl font-bold text-dark-800">${avgPercent}%</span>
            </div>
            <div class="w-full bg-dark-100 rounded-full h-2 mt-3">
              <div class="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all" style="width: ${avgPercent}%"></div>
            </div>
          </div>
          <div class="stat-card">
            <p class="text-dark-400 text-sm">Jami yuklangan</p>
            <p class="text-3xl font-bold text-dark-800 mt-2">${totalUploaded}<span class="text-lg text-dark-400 font-normal">/${totalRequired}</span></p>
            <p class="text-xs text-accent-600 mt-2">hujjat topshirildi</p>
          </div>
          <div class="stat-card">
            <p class="text-dark-400 text-sm">A'lo baholangan</p>
            <p class="text-3xl font-bold text-accent-600 mt-2">${excellentCount}</p>
            <p class="text-xs text-dark-400 mt-2">pedagog</p>
          </div>
          <div class="stat-card">
            <p class="text-dark-400 text-sm">Diqqat talab etadi</p>
            <p class="text-3xl font-bold text-red-500 mt-2">${dangerCount}</p>
            <p class="text-xs text-dark-400 mt-2">pedagog</p>
          </div>
        </div>

        <div class="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
          <!-- Chart -->
          <div class="xl:col-span-2 glass-card p-6">
            <h2 class="text-lg font-semibold text-dark-800 mb-4">Kunlik faollik (Haftalik)</h2>
            <div style="position: relative; height: 280px; width: 100%;">
              <canvas id="monitoring-chart"></canvas>
            </div>
          </div>

          <!-- Status Distribution -->
          <div class="glass-card p-6">
            <h2 class="text-lg font-semibold text-dark-800 mb-5">Holat taqsimoti</h2>
            <div class="space-y-4">
              ${Object.entries(statusConfig).map(([key, cfg]) => {
                const count = teachers.filter(t => t.status === key).length;
                const pct = teachers.length > 0 ? Math.round((count / teachers.length) * 100) : 0;
                return `
                <div>
                  <div class="flex items-center justify-between mb-1.5">
                    <div class="flex items-center gap-2">
                      <span class="${cfg.dot}"></span>
                      <span class="text-sm font-medium text-dark-700">${cfg.label}</span>
                    </div>
                    <span class="text-sm font-semibold text-dark-800">${count} ta (${pct}%)</span>
                  </div>
                  <div class="w-full bg-dark-100 rounded-full h-2">
                    <div class="h-2 rounded-full transition-all ${key === 'excellent' ? 'bg-accent-500' : key === 'good' ? 'bg-primary-500' : key === 'warning' ? 'bg-amber-500' : 'bg-red-500'}" style="width: ${pct}%"></div>
                  </div>
                </div>`;
              }).join('')}
            </div>
          </div>
        </div>

        <!-- Teachers Table -->
        <div class="table-container mb-6">
          <div class="p-6 pb-0">
            <h2 class="text-lg font-semibold text-dark-800">Pedagoglar ro'yxati</h2>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm mt-4">
              <thead class="bg-dark-50/80">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-dark-500 uppercase">Pedagog</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-dark-500 uppercase">Fan</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-dark-500 uppercase">Yuklangan</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-dark-500 uppercase">Bajarilish</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-dark-500 uppercase">Vaqtida</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-dark-500 uppercase">Kechikkan</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-dark-500 uppercase">Holat</th>
                </tr>
              </thead>
              <tbody>
                ${teachers.length === 0 ? `
                <tr>
                  <td colspan="7" class="text-center py-8 text-dark-400 font-medium">Pedagoglar topilmadi</td>
                </tr>
                ` : teachers.map(t => {
                  const pct = Math.round((t.uploaded / t.required) * 100);
                  const sc = statusConfig[t.status] || statusConfig.danger;
                  const initials = t.name ? t.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '?';
                  return `
                  <tr class="border-t border-dark-100 hover:bg-primary-50/50 transition-colors">
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                          ${initials}
                        </div>
                        <span class="font-medium text-dark-800 whitespace-nowrap">${t.name}</span>
                      </div>
                    </td>
                    <td class="px-6 py-4 text-dark-600">${t.subject}</td>
                    <td class="px-6 py-4 font-medium text-dark-700">${t.uploaded}/${t.required}</td>
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-2">
                        <div class="w-20 bg-dark-100 rounded-full h-1.5">
                          <div class="h-1.5 rounded-full ${pct >= 90 ? 'bg-accent-500' : pct >= 60 ? 'bg-primary-500' : pct >= 40 ? 'bg-amber-500' : 'bg-red-500'}" style="width: ${pct}%"></div>
                        </div>
                        <span class="text-xs font-medium text-dark-500">${pct}%</span>
                      </div>
                    </td>
                    <td class="px-6 py-4 text-accent-600 font-medium">${t.onTime}</td>
                    <td class="px-6 py-4 text-red-500 font-medium">${t.late}</td>
                    <td class="px-6 py-4"><span class="badge ${sc.bg}">${sc.label}</span></td>
                  </tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
        </div>
      </main>
    </div>
  `;
}

export function initMonitoring() {
  initSidebar();
  initChart();
}

function initChart() {
  const canvas = document.getElementById('monitoring-chart');
  if (!canvas) return;

  import('chart.js').then(({ Chart, registerables }) => {
    Chart.register(...registerables);

    const existingChart = Chart.getChart(canvas);
    if (existingChart) existingChart.destroy();

    new Chart(canvas, {
      type: 'line',
      data: {
        labels: ['Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan', 'Yak'],
        datasets: [
          {
            label: 'Yuklangan',
            data: chartActivityData,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59,130,246,0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 2,
            pointBackgroundColor: '#3b82f6',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index',
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            titleFont: { family: 'Inter', size: 13 },
            bodyFont: { family: 'Inter', size: 12 },
            padding: 12,
            cornerRadius: 10,
            displayColors: true,
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(0,0,0,0.04)' },
            ticks: { 
              font: { family: 'Inter', size: 11 },
              stepSize: 1,
            }
          },
          x: {
            grid: { display: false },
            ticks: { font: { family: 'Inter', size: 11 } }
          }
        }
      }
    });
  }).catch(err => {
    console.error('Chart.js failed to load:', err);
  });
}
