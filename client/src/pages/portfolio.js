/**
 * Portfolio page
 */
import { auth } from '../utils/auth.js';
import { api } from '../utils/api.js';
import { renderSidebar, initSidebar } from '../components/sidebar.js';
import { renderHeader } from '../components/header.js';
import { openModal } from '../components/modal.js';
import { showToast } from '../components/toast.js';

const typeLabels = {
  sertifikat: { label: 'Sertifikat', class: 'badge-info', icon: '🏆' },
  yutuq: { label: 'Yutuq', class: 'badge-success', icon: '🥇' },
  ishlanma: { label: 'Metodik ishlanma', class: 'badge-warning', icon: '📘' },
};

const typeFilters = ['Barchasi', 'sertifikat', 'yutuq', 'ishlanma'];

export async function renderPortfolio() {
  const user = auth.getUser();
  let items = [];

  try {
    const res = await api.get(`/portfolio/${user.id}`);
    items = res.data || [];
  } catch (error) {
    console.error('Fetch portfolio error:', error);
    showToast('Portfolio yozuvlarini yuklab bo\'lmadi.', 'error');
  }

  const certsCount = items.filter(p => p.type === 'sertifikat').length;
  const achievementsCount = items.filter(p => p.type === 'yutuq').length;
  const worksCount = items.filter(p => p.type === 'ishlanma').length;

  return `
    <div class="flex min-h-screen bg-dark-50">
      ${renderSidebar()}
      <main class="flex-1 lg:ml-64 p-6 lg:p-8">
        ${renderHeader('Elektron Portfolio', `${user?.full_name || 'Pedagog'}ning professional yutuqlari`)}

        <!-- Profile Summary Card -->
        <div class="glass-card p-6 mb-6 bg-gradient-to-r from-primary-500/5 to-accent-500/5">
          <div class="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-2xl font-bold shadow-xl">
              ${auth.getInitials(user?.full_name)}
            </div>
            <div class="flex-1">
              <h2 class="text-xl font-bold text-dark-800">${user?.full_name || 'Pedagog'}</h2>
              <p class="text-dark-500 text-sm">${user?.subject || 'Fan'} o'qituvchisi</p>
              <div class="flex items-center gap-4 mt-3">
                <div class="flex items-center gap-1.5">
                  <span class="text-2xl font-bold text-primary-600" id="count-certs">${certsCount}</span>
                  <span class="text-xs text-dark-400">Sertifikat</span>
                </div>
                <div class="w-px h-8 bg-dark-200"></div>
                <div class="flex items-center gap-1.5">
                  <span class="text-2xl font-bold text-accent-600" id="count-yutuq">${achievementsCount}</span>
                  <span class="text-xs text-dark-400">Yutuq</span>
                </div>
                <div class="w-px h-8 bg-dark-200"></div>
                <div class="flex items-center gap-1.5">
                  <span class="text-2xl font-bold text-amber-600" id="count-ishlanma">${worksCount}</span>
                  <span class="text-xs text-dark-400">Ishlanma</span>
                </div>
              </div>
            </div>
            ${auth.hasRole('admin', 'pedagog') ? `
            <button id="add-portfolio-btn" class="btn-primary">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
              Qo'shish
            </button>` : ''}
          </div>
        </div>

        <!-- Filter Tabs -->
        <div class="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          ${typeFilters.map((t, i) => `
            <button class="portfolio-filter px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${i === 0 ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25' : 'bg-white text-dark-500 hover:bg-dark-100 border border-dark-200'}" data-type="${t}">
              ${t === 'Barchasi' ? 'Barchasi' : typeLabels[t].label}
            </button>
          `).join('')}
        </div>

        <!-- Portfolio Grid -->
        <div id="portfolio-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          ${items.length === 0 ? `
          <div class="col-span-full text-center py-12 text-dark-400 font-medium bg-white rounded-3xl border border-dark-100">
            Portfolio yozuvlari mavjud emas.
          </div>
          ` : items.map((item, i) => renderPortfolioItemCard(item, i)).join('')}
        </div>
      </main>
    </div>
  `;
}

function renderPortfolioItemCard(item, i = 0) {
  const tl = typeLabels[item.type] || { label: item.type, class: 'badge-info', icon: '📝' };
  const user = auth.getUser();
  const canDelete = auth.hasRole('admin') || item.user_id === user.id;
  const formattedDate = item.issue_date ? new Date(item.issue_date).toLocaleDateString('uz-UZ') : '—';

  return `
    <div class="glass-card p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 portfolio-item-card animate-scale-in" data-type="${item.type}" style="animation-delay: ${i * 60}ms">
      <div class="flex items-start justify-between mb-4">
        <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center text-2xl">${tl.icon}</div>
        <span class="${tl.class}">${tl.label}</span>
      </div>
      <h3 class="font-semibold text-dark-800 mb-1.5">${item.title}</h3>
      <p class="text-sm text-dark-400 mb-4">${item.description || 'Tavsif kiritilmagan'}</p>
      <div class="flex items-center justify-between pt-3 border-t border-dark-100">
        <span class="text-xs text-dark-400">${formattedDate}</span>
        <div class="flex items-center gap-1">
          ${item.drive_link ? `
          <button class="p-1.5 hover:bg-primary-50 rounded-lg transition-colors view-portfolio-file" data-link="${item.drive_link}" title="Ko'rish">
            <svg class="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
          </button>` : ''}
          ${canDelete ? `
          <button class="p-1.5 hover:bg-red-50 rounded-lg transition-colors delete-portfolio-btn" data-id="${item.id}" title="O'chirish">
            <svg class="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>` : ''}
        </div>
      </div>
    </div>`;
}

// Reload portfolio grid dynamically
async function reloadPortfolioGrid(selectedType = 'Barchasi') {
  const user = auth.getUser();
  const grid = document.getElementById('portfolio-grid');
  if (!grid) return;

  try {
    let endpoint = `/portfolio/${user.id}`;
    if (selectedType !== 'Barchasi') {
      endpoint += `?type=${selectedType}`;
    }

    const res = await api.get(endpoint);
    const items = res.data || [];

    if (items.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full text-center py-12 text-dark-400 font-medium bg-white rounded-3xl border border-dark-100">
          Portfolio yozuvlari mavjud emas.
        </div>`;
    } else {
      grid.innerHTML = items.map((item, i) => renderPortfolioItemCard(item, i)).join('');
    }

    // Update counts if viewing all
    if (selectedType === 'Barchasi') {
      const certsCount = items.filter(p => p.type === 'sertifikat').length;
      const achievementsCount = items.filter(p => p.type === 'yutuq').length;
      const worksCount = items.filter(p => p.type === 'ishlanma').length;

      const certsEl = document.getElementById('count-certs');
      const achEl = document.getElementById('count-yutuq');
      const worksEl = document.getElementById('count-ishlanma');

      if (certsEl) certsEl.textContent = certsCount;
      if (achEl) achEl.textContent = achievementsCount;
      if (worksEl) worksEl.textContent = worksCount;
    }
  } catch (err) {
    console.error('Grid reload error:', err);
  }
}

export function initPortfolio() {
  initSidebar();

  // Filter tabs click listener
  document.querySelectorAll('.portfolio-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.portfolio-filter').forEach(b => {
        b.className = 'portfolio-filter px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap bg-white text-dark-500 hover:bg-dark-100 border border-dark-200';
      });
      btn.className = 'portfolio-filter px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap bg-primary-500 text-white shadow-lg shadow-primary-500/25';

      const type = btn.dataset.type;
      reloadPortfolioGrid(type);
    });
  });

  // Add portfolio item button
  const addBtn = document.getElementById('add-portfolio-btn');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      openModal('Yangi yozuv qo\'shish', `
        <form class="space-y-4" id="portfolio-form">
          <div>
            <label class="input-label">Sarlavha</label>
            <input type="text" class="input" id="portfolio-title" placeholder="Masalan: IELTS sertifikati" required />
          </div>
          <div>
            <label class="input-label">Turi</label>
            <select class="input" id="portfolio-type">
              <option value="sertifikat">Sertifikat</option>
              <option value="yutuq">Yutuq</option>
              <option value="ishlanma">Metodik ishlanma</option>
            </select>
          </div>
          <div>
            <label class="input-label">Tavsif</label>
            <textarea class="input" id="portfolio-desc" rows="3" placeholder="Qisqacha tavsif..."></textarea>
          </div>
          <div>
            <label class="input-label">Sana</label>
            <input type="date" class="input" id="portfolio-date" />
          </div>
        </form>
      `, {
        confirmText: 'Saqlash',
        onConfirm: async (close) => {
          const title = document.getElementById('portfolio-title')?.value.trim();
          const type = document.getElementById('portfolio-type')?.value;
          const description = document.getElementById('portfolio-desc')?.value.trim();
          const issue_date = document.getElementById('portfolio-date')?.value;

          if (!title || !type) {
            showToast('Sarlavha va tur majburiy', 'warning');
            return;
          }

          const submitBtn = document.querySelector('.modal-confirm-btn');
          if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Saqlanmoqda...';
          }

          try {
            await api.post('/portfolio', {
              title,
              type,
              description,
              issue_date: issue_date || null
            });
            showToast('Portfolio yozuvi qo\'shildi!', 'success');
            close();
            reloadPortfolioGrid();
          } catch (err) {
            showToast(err.message || 'Saqlashda xatolik yuz berdi', 'error');
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.textContent = 'Saqlash';
            }
          }
        }
      });
    });
  }

  // Set up grid delete & view clicks using event delegation
  const grid = document.getElementById('portfolio-grid');
  if (grid) {
    grid.addEventListener('click', async (e) => {
      const deleteBtn = e.target.closest('.delete-portfolio-btn');
      const viewBtn = e.target.closest('.view-portfolio-file');

      if (deleteBtn) {
        const id = deleteBtn.dataset.id;
        if (confirm('Ushbu yozuvni o\'chirishni xohlaysizmi?')) {
          try {
            await api.delete(`/portfolio/${id}`);
            showToast('Portfolio yozuvi o\'chirildi', 'success');
            reloadPortfolioGrid();
          } catch (err) {
            showToast(err.message || 'O\'chirishda xatolik yuz berdi', 'error');
          }
        }
      }

      if (viewBtn) {
        const link = viewBtn.dataset.link;
        if (link) {
          window.open(link, '_blank');
        }
      }
    });
  }
}
