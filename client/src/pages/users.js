/**
 * Users management page (Admin only)
 */
import { auth } from '../utils/auth.js';
import { api } from '../utils/api.js';
import { renderSidebar, initSidebar } from '../components/sidebar.js';
import { renderHeader } from '../components/header.js';
import { openModal } from '../components/modal.js';
import { showToast } from '../components/toast.js';

const roleLabels = { admin: 'Administrator', pedagog: 'Pedagog', mehmon: 'Mehmon' };
const roleBadge = { admin: 'bg-violet-100 text-violet-700', pedagog: 'bg-primary-100 text-primary-700', mehmon: 'bg-dark-100 text-dark-600' };

export async function renderUsers() {
  let users = [];
  try {
    const res = await api.get('/users');
    users = res.data || [];
  } catch (error) {
    console.error('Fetch users error:', error);
    showToast('Foydalanuvchilar ro\'yxatini yuklab bo\'lmadi.', 'error');
  }

  return `
    <div class="flex min-h-screen bg-dark-50">
      ${renderSidebar()}
      <main class="flex-1 lg:ml-64 p-6 lg:p-8">
        ${renderHeader('Foydalanuvchilar', 'Tizim foydalanuvchilarini boshqaring')}

        <!-- Stats -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
          <div class="stat-card">
            <p class="text-dark-400 text-sm">Jami foydalanuvchilar</p>
            <p class="text-3xl font-bold text-dark-800 mt-2" id="total-users-count">${users.length}</p>
          </div>
          <div class="stat-card">
            <p class="text-dark-400 text-sm">Pedagoglar</p>
            <p class="text-3xl font-bold text-primary-600 mt-2" id="pedagog-users-count">${users.filter(u => u.role === 'pedagog').length}</p>
          </div>
          <div class="stat-card">
            <p class="text-dark-400 text-sm">Adminlar</p>
            <p class="text-3xl font-bold text-violet-600 mt-2" id="admin-users-count">${users.filter(u => u.role === 'admin').length}</p>
          </div>
        </div>

        <!-- Toolbar -->
        <div class="flex items-center justify-between mb-5">
          <div class="relative">
            <svg class="w-4 h-4 text-dark-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input type="text" id="user-search" placeholder="Ism, email yoki fan bo'yicha qidirish..." class="input pl-10 w-80" />
          </div>
          <button id="add-user-btn" class="btn-primary">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            Qo'shish
          </button>
        </div>

        <!-- Users Table -->
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Foydalanuvchi</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Fan</th>
                <th>Telefon</th>
                <th>Holat</th>
                <th>Harakatlar</th>
              </tr>
            </thead>
            <tbody id="users-table-body">
              ${users.length === 0 ? `
              <tr>
                <td colspan="7" class="text-center py-8 text-dark-400 font-medium">Foydalanuvchilar topilmadi</td>
              </tr>
              ` : users.map(u => renderUserRow(u)).join('')}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  `;
}

function renderUserRow(u) {
  const currentUser = auth.getUser();
  const isSelf = currentUser?.id === u.id;

  return `
    <tr class="border-t border-dark-100 hover:bg-primary-50/50 transition-colors">
      <td class="px-6 py-4">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-xs font-semibold">${auth.getInitials(u.full_name)}</div>
          <span class="font-medium text-dark-800">${u.full_name} ${isSelf ? '<span class="text-xs text-primary-500 font-normal ml-1">(O\'zingiz)</span>' : ''}</span>
        </div>
      </td>
      <td class="px-6 py-4 text-dark-500">${u.email}</td>
      <td class="px-6 py-4"><span class="badge ${roleBadge[u.role]}">${roleLabels[u.role]}</span></td>
      <td class="px-6 py-4 text-dark-600">${u.subject || '—'}</td>
      <td class="px-6 py-4 text-dark-500">${u.phone || '—'}</td>
      <td class="px-6 py-4">
        <span class="flex items-center gap-1.5">
          <span class="${u.is_active ? 'status-online' : 'status-offline'}"></span>
          <span class="text-sm ${u.is_active ? 'text-accent-600' : 'text-red-500'}">${u.is_active ? 'Faol' : 'Bloklangan'}</span>
        </span>
      </td>
      <td class="px-6 py-4">
        <div class="flex items-center gap-1">
          <button class="p-1.5 hover:bg-primary-50 rounded-lg transition-colors edit-user-btn" 
            data-id="${u.id}" 
            data-fullname="${u.full_name}" 
            data-email="${u.email}" 
            data-role="${u.role}" 
            data-subject="${u.subject || ''}" 
            data-phone="${u.phone || ''}"
            data-active="${u.is_active}"
            title="Tahrirlash">
            <svg class="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
          </button>
          ${!isSelf ? `
          <button class="p-1.5 hover:bg-red-50 rounded-lg transition-colors delete-user-btn" data-id="${u.id}" title="O'chirish">
            <svg class="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>` : ''}
        </div>
      </td>
    </tr>`;
}

// Reload users table body dynamically
async function reloadUsersTable() {
  const searchVal = document.getElementById('user-search')?.value || '';
  const tbody = document.getElementById('users-table-body');
  if (!tbody) return;

  try {
    const res = await api.get(`/users?search=${encodeURIComponent(searchVal)}`);
    const users = res.data || [];

    if (users.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-8 text-dark-400 font-medium">Foydalanuvchilar topilmadi</td>
        </tr>`;
    } else {
      tbody.innerHTML = users.map(u => renderUserRow(u)).join('');
    }

    // Update stats
    const totalEl = document.getElementById('total-users-count');
    const pedEl = document.getElementById('pedagog-users-count');
    const admEl = document.getElementById('admin-users-count');

    if (totalEl) totalEl.textContent = users.length;
    if (pedEl) pedEl.textContent = users.filter(u => u.role === 'pedagog').length;
    if (admEl) admEl.textContent = users.filter(u => u.role === 'admin').length;
  } catch (err) {
    console.error('Table reload error:', err);
  }
}

export function initUsers() {
  initSidebar();

  // Search input filter
  document.getElementById('user-search')?.addEventListener('input', reloadUsersTable);

  // Add user button click listener
  document.getElementById('add-user-btn')?.addEventListener('click', () => {
    openModal('Yangi foydalanuvchi yaratish', `
      <form class="space-y-4" id="add-user-form">
        <div>
          <label class="input-label">To'liq ism</label>
          <input type="text" class="input" id="user-fullname" placeholder="Masalan: Karimov Olimjon" required />
        </div>
        <div>
          <label class="input-label">Email</label>
          <input type="email" class="input" id="user-email" placeholder="email@epedagog.uz" required />
        </div>
        <div>
          <label class="input-label">Parol</label>
          <input type="password" class="input" id="user-password" placeholder="Kamida 6 ta belgi" required />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="input-label">Rol</label>
            <select class="input" id="user-role">
              <option value="pedagog">Pedagog</option>
              <option value="admin">Admin</option>
              <option value="mehmon">Mehmon</option>
            </select>
          </div>
          <div>
            <label class="input-label">Fan (faqat pedagoglar uchun)</label>
            <input type="text" class="input" id="user-subject" placeholder="Masalan: Matematika" />
          </div>
        </div>
        <div>
          <label class="input-label">Telefon</label>
          <input type="tel" class="input" id="user-phone" placeholder="+998901234567" />
        </div>
      </form>
    `, {
      confirmText: 'Saqlash',
      onConfirm: async (close) => {
        const full_name = document.getElementById('user-fullname')?.value.trim();
        const email = document.getElementById('user-email')?.value.trim();
        const password = document.getElementById('user-password')?.value;
        const role = document.getElementById('user-role')?.value;
        const subject = document.getElementById('user-subject')?.value.trim();
        const phone = document.getElementById('user-phone')?.value.trim();

        if (!full_name || !email || !password || !role) {
          showToast('Barcha majburiy maydonlarni to\'ldiring', 'warning');
          return;
        }

        const submitBtn = document.querySelector('.modal-confirm-btn');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Saqlanmoqda...';
        }

        try {
          await api.post('/users', {
            full_name,
            email,
            password,
            role,
            subject: role === 'pedagog' ? subject : null,
            phone,
          });
          showToast('Foydalanuvchi muvaffaqiyatli yaratildi!', 'success');
          close();
          reloadUsersTable();
        } catch (err) {
          showToast(err.message || 'Xatolik yuz berdi', 'error');
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Saqlash';
          }
        }
      }
    });
  });

  // Table action clicks (Delete and Edit) using event delegation
  const tbody = document.getElementById('users-table-body');
  if (tbody) {
    tbody.addEventListener('click', async (e) => {
      const deleteBtn = e.target.closest('.delete-user-btn');
      const editBtn = e.target.closest('.edit-user-btn');

      if (deleteBtn) {
        const id = deleteBtn.dataset.id;
        if (confirm('Ushbu foydalanuvchini tizimdan butunlay o\'chirib tashlamoqchimisiz?')) {
          try {
            await api.delete(`/users/${id}`);
            showToast('Foydalanuvchi muvaffaqiyatli o\'chirildi', 'success');
            reloadUsersTable();
          } catch (err) {
            showToast(err.message || 'O\'chirishda xatolik yuz berdi', 'error');
          }
        }
      }

      if (editBtn) {
        const { id, fullname, email, role, subject, phone, active } = editBtn.dataset;
        const isActive = active === 'true';

        openModal('Foydalanuvchini tahrirlash', `
          <form class="space-y-4" id="edit-user-form">
            <div>
              <label class="input-label">To'liq ism</label>
              <input type="text" class="input" id="edit-fullname" value="${fullname}" required />
            </div>
            <div>
              <label class="input-label">Email</label>
              <input type="email" class="input" id="edit-email" value="${email}" required />
            </div>
            <div>
              <label class="input-label">Yangi parol (o'zgartirmaslik uchun bo'sh qoldiring)</label>
              <input type="password" class="input" id="edit-password" placeholder="Yangi parol..." />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="input-label">Rol</label>
                <select class="input" id="edit-role">
                  <option value="pedagog" ${role === 'pedagog' ? 'selected' : ''}>Pedagog</option>
                  <option value="admin" ${role === 'admin' ? 'selected' : ''}>Admin</option>
                  <option value="mehmon" ${role === 'mehmon' ? 'selected' : ''}>Mehmon</option>
                </select>
              </div>
              <div>
                <label class="input-label">Fan</label>
                <input type="text" class="input" id="edit-subject" value="${subject}" placeholder="Masalan: Matematika" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="input-label">Telefon</label>
                <input type="tel" class="input" id="edit-phone" value="${phone}" placeholder="+998901234567" />
              </div>
              <div>
                <label class="input-label">Holat</label>
                <select class="input" id="edit-active">
                  <option value="true" ${isActive ? 'selected' : ''}>Faol</option>
                  <option value="false" ${!isActive ? 'selected' : ''}>Bloklangan</option>
                </select>
              </div>
            </div>
          </form>
        `, {
          confirmText: 'Yangilash',
          onConfirm: async (close) => {
            const upName = document.getElementById('edit-fullname')?.value.trim();
            const upEmail = document.getElementById('edit-email')?.value.trim();
            const upPass = document.getElementById('edit-password')?.value;
            const upRole = document.getElementById('edit-role')?.value;
            const upSubject = document.getElementById('edit-subject')?.value.trim();
            const upPhone = document.getElementById('edit-phone')?.value.trim();
            const upActive = document.getElementById('edit-active')?.value === 'true';

            if (!upName || !upEmail || !upRole) {
              showToast('Ism, email va rol majburiy', 'warning');
              return;
            }

            const submitBtn = document.querySelector('.modal-confirm-btn');
            if (submitBtn) {
              submitBtn.disabled = true;
              submitBtn.textContent = 'Yangilanmoqda...';
            }

            try {
              const payload = {
                full_name: upName,
                email: upEmail,
                role: upRole,
                subject: upRole === 'pedagog' ? upSubject : null,
                phone: upPhone,
                is_active: upActive,
              };
              if (upPass) payload.password = upPass;

              await api.put(`/users/${id}`, payload);
              showToast('Foydalanuvchi muvaffaqiyatli yangilandi!', 'success');
              close();
              reloadUsersTable();
            } catch (err) {
              showToast(err.message || 'Yangilashda xatolik yuz berdi', 'error');
              if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Yangilash';
              }
            }
          }
        });
      }
    });
  }
}
