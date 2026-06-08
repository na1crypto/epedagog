/**
 * Documents page
 */
import { auth } from '../utils/auth.js';
import { api } from '../utils/api.js';
import { renderSidebar, initSidebar } from '../components/sidebar.js';
import { renderHeader } from '../components/header.js';
import { openModal } from '../components/modal.js';
import { showToast } from '../components/toast.js';

const categories = ['Barchasi', 'Dars ishlanma', 'Taqvim reja', 'Hisobot', 'O\'quv dastur', 'Metodik qo\'llanma', 'Boshqa'];

const statusMap = {
  uploaded: { label: 'Yuklangan', class: 'badge-success' },
  pending: { label: 'Kutilmoqda', class: 'badge-warning' },
  overdue: { label: 'Muddati o\'tgan', class: 'badge-danger' },
};

const fileIcons = {
  pdf: { color: 'text-red-500 bg-red-50', label: 'PDF' },
  docx: { color: 'text-primary-500 bg-primary-50', label: 'DOCX' },
  doc: { color: 'text-primary-500 bg-primary-50', label: 'DOC' },
  xlsx: { color: 'text-accent-500 bg-accent-50', label: 'XLSX' },
  xls: { color: 'text-accent-500 bg-accent-50', label: 'XLS' },
  pptx: { color: 'text-amber-500 bg-amber-50', label: 'PPTX' },
  ppt: { color: 'text-amber-500 bg-amber-50', label: 'PPT' },
};

function formatSize(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

export async function renderDocuments() {
  let docs = [];
  try {
    const res = await api.get('/documents');
    docs = res.data || [];
  } catch (error) {
    console.error('Initial documents load error:', error);
    showToast('Hujjatlarni yuklashda xatolik yuz berdi.', 'error');
  }

  return `
    <div class="flex min-h-screen bg-dark-50">
      ${renderSidebar()}
      <main class="flex-1 lg:ml-64 p-6 lg:p-8">
        ${renderHeader('Hujjatlar ombori', 'Barcha hujjatlarni boshqaring va saralang')}

        <!-- Toolbar -->
        <div class="glass-card p-4 mb-6">
          <div class="flex flex-col md:flex-row md:items-center gap-4">
            <div class="relative flex-1">
              <svg class="w-4 h-4 text-dark-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <input type="text" id="doc-search" placeholder="Hujjat nomini qidiring..." class="input pl-10" />
            </div>
            <div class="flex items-center gap-3">
              <select id="doc-category-filter" class="input w-auto">
                ${categories.map(c => `<option value="${c}">${c}</option>`).join('')}
              </select>
              <select id="doc-status-filter" class="input w-auto">
                <option value="">Barcha holatlar</option>
                <option value="uploaded">Yuklangan</option>
                <option value="pending">Kutilmoqda</option>
                <option value="overdue">Muddati o'tgan</option>
              </select>
              ${auth.hasRole('admin', 'pedagog') ? `
              <button id="upload-btn" class="btn-primary whitespace-nowrap">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                Yuklash
              </button>` : ''}
            </div>
          </div>
        </div>

        <!-- Documents Table -->
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Hujjat nomi</th>
                <th>Tur</th>
                <th>Kategoriya</th>
                <th>Hajm</th>
                <th>Muallif</th>
                <th>Sana</th>
                <th>Holat</th>
                <th>Harakatlar</th>
              </tr>
            </thead>
            <tbody id="documents-table-body">
              ${docs.length === 0 ? `
              <tr>
                <td colspan="8" class="text-center py-8 text-dark-400 font-medium">Hujjatlar topilmadi</td>
              </tr>` : docs.map(doc => renderDocRow(doc)).join('')}
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="flex items-center justify-between mt-6 px-2">
          <p class="text-sm text-dark-400">Jami: <span class="font-medium text-dark-700" id="total-count">${docs.length}</span> ta hujjat</p>
          <div class="flex items-center gap-1">
            <button class="px-3 py-1.5 rounded-lg text-sm bg-primary-500 text-white font-medium">1</button>
          </div>
        </div>
      </main>
    </div>
  `;
}

function renderDocRow(doc) {
  const fi = fileIcons[doc.file_type] || { color: 'text-dark-500 bg-dark-50', label: doc.file_type?.toUpperCase() || 'FAYL' };
  const st = statusMap[doc.status] || { label: doc.status, class: 'badge-warning' };
  const currentUser = auth.getUser();
  const canDelete = auth.hasRole('admin') || (auth.hasRole('pedagog') && doc.uploaded_by === currentUser.id);

  return `
    <tr class="border-t border-dark-100 hover:bg-primary-50/50 transition-colors">
      <td>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg ${fi.color} flex items-center justify-center text-xs font-bold flex-shrink-0">${fi.label}</div>
          <span class="font-medium text-dark-800">${doc.title}</span>
        </div>
      </td>
      <td><span class="text-xs uppercase font-medium text-dark-400">${doc.file_type}</span></td>
      <td><span class="badge-info">${doc.category}</span></td>
      <td class="text-dark-500">${formatSize(doc.file_size)}</td>
      <td class="text-dark-600">${doc.author_name || '—'}</td>
      <td class="text-dark-500">${new Date(doc.created_at).toLocaleDateString('uz-UZ')}</td>
      <td><span class="${st.class}">${st.label}</span></td>
      <td>
        <div class="flex items-center gap-1">
          <button class="p-1.5 hover:bg-primary-50 rounded-lg transition-colors download-doc-btn" data-link="${doc.drive_link}" title="Ko'rish / Yuklab olish">
            <svg class="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
          </button>
          ${canDelete ? `
          <button class="p-1.5 hover:bg-red-50 rounded-lg transition-colors delete-doc-btn" data-id="${doc.id}" title="O'chirish">
            <svg class="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>` : ''}
        </div>
      </td>
    </tr>`;
}

// Reload table body dynamically
async function reloadTable() {
  const searchVal = document.getElementById('doc-search')?.value || '';
  const categoryVal = document.getElementById('doc-category-filter')?.value || 'Barchasi';
  const statusVal = document.getElementById('doc-status-filter')?.value || '';

  const tbody = document.getElementById('documents-table-body');
  if (!tbody) return;

  try {
    let endpoint = `/documents?search=${encodeURIComponent(searchVal)}&category=${encodeURIComponent(categoryVal)}`;
    if (statusVal) endpoint += `&status=${encodeURIComponent(statusVal)}`;

    const res = await api.get(endpoint);
    const docs = res.data || [];

    if (docs.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center py-8 text-dark-400 font-medium">Hujjatlar topilmadi</td>
        </tr>`;
    } else {
      tbody.innerHTML = docs.map(doc => renderDocRow(doc)).join('');
    }

    const totalCount = document.getElementById('total-count');
    if (totalCount) totalCount.textContent = docs.length;
  } catch (error) {
    console.error('Table reload error:', error);
  }
}

export function initDocuments() {
  initSidebar();

  const uploadBtn = document.getElementById('upload-btn');
  if (uploadBtn) {
    uploadBtn.addEventListener('click', () => {
      openModal('Yangi hujjat yuklash', `
        <form id="upload-form" class="space-y-4">
          <div>
            <label class="input-label">Hujjat nomi</label>
            <input type="text" class="input" id="upload-title" placeholder="Masalan: Matematika dars ishlanma" required />
          </div>
          <div>
            <label class="input-label">Kategoriya</label>
            <select class="input" id="upload-category">${categories.slice(1).map(c => `<option>${c}</option>`).join('')}</select>
          </div>
          <div>
            <label class="input-label">Topshirish muddati</label>
            <input type="date" class="input" id="upload-deadline" />
          </div>
          <div>
            <label class="input-label">Fayl</label>
            <div class="upload-zone" id="drop-zone">
              <svg class="w-10 h-10 text-dark-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
              <p class="text-sm text-dark-500" id="drop-zone-text">Faylni shu yerga tashlang yoki <span class="text-primary-500 font-medium">tanlang</span></p>
              <p class="text-xs text-dark-400">PDF, DOCX, XLSX, PPTX (max 10MB)</p>
              <input type="file" class="hidden" id="file-input" accept=".pdf,.docx,.xlsx,.pptx" />
            </div>
          </div>
        </form>
      `, {
        confirmText: 'Yuklash',
        onConfirm: async (close) => {
          const title = document.getElementById('upload-title')?.value.trim();
          const category = document.getElementById('upload-category')?.value;
          const deadline = document.getElementById('upload-deadline')?.value;
          const fileInput = document.getElementById('file-input');
          const file = fileInput?.files[0];

          if (!title || !category) {
            showToast('Hujjat nomi va kategoriyasi talab etiladi', 'warning');
            return;
          }

          if (!file) {
            showToast('Fayl tanlang', 'warning');
            return;
          }

          const formData = new FormData();
          formData.append('title', title);
          formData.append('category', category);
          if (deadline) formData.append('deadline', deadline);
          formData.append('file', file);

          const submitBtn = document.querySelector('.modal-confirm-btn');
          if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Yuklanmoqda...';
          }

          try {
            await api.upload('/documents/upload', formData);
            showToast('Hujjat muvaffaqiyatli yuklandi!', 'success');
            close();
            reloadTable();
          } catch (err) {
            showToast(err.message || 'Yuklashda xatolik yuz berdi', 'error');
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.textContent = 'Yuklash';
            }
          }
        }
      });

      // Drop zone handlers
      setTimeout(() => {
        const zone = document.getElementById('drop-zone');
        const input = document.getElementById('file-input');
        const text = document.getElementById('drop-zone-text');
        if (zone && input) {
          zone.addEventListener('click', () => input.click());
          zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('dragover'); });
          zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
          zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('dragover');
            if (e.dataTransfer.files.length) {
              input.files = e.dataTransfer.files;
              if (text) text.innerHTML = `Fayl tanlandi: <span class="text-primary-600 font-semibold">${e.dataTransfer.files[0].name}</span>`;
              showToast('Fayl yuklashga tayyor', 'info');
            }
          });
          input.addEventListener('change', () => {
            if (input.files.length) {
              if (text) text.innerHTML = `Fayl tanlandi: <span class="text-primary-600 font-semibold">${input.files[0].name}</span>`;
              showToast('Fayl yuklashga tayyor', 'info');
            }
          });
        }
      }, 100);
    });
  }

  // Set up filters
  document.getElementById('doc-search')?.addEventListener('input', reloadTable);
  document.getElementById('doc-category-filter')?.addEventListener('change', reloadTable);
  document.getElementById('doc-status-filter')?.addEventListener('change', reloadTable);

  // Set up table actions (Delete and Download)
  const tbody = document.getElementById('documents-table-body');
  if (tbody) {
    tbody.addEventListener('click', async (e) => {
      const deleteBtn = e.target.closest('.delete-doc-btn');
      const downloadBtn = e.target.closest('.download-doc-btn');

      if (deleteBtn) {
        const id = deleteBtn.dataset.id;
        if (confirm('Ushbu hujjatni o\'chirishni tasdiqlaysizmi?')) {
          try {
            await api.delete(`/documents/${id}`);
            showToast('Hujjat o\'chirildi', 'success');
            reloadTable();
          } catch (err) {
            showToast(err.message || 'Hujjatni o\'chirishda xatolik yuz berdi', 'error');
          }
        }
      }

      if (downloadBtn) {
        const link = downloadBtn.dataset.link;
        if (link) {
          window.open(link, '_blank');
        } else {
          showToast('Fayl havolasi topilmadi', 'warning');
        }
      }
    });
  }
}
