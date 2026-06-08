/**
 * Profile page
 */
import { auth } from '../utils/auth.js';
import { api } from '../utils/api.js';
import { renderSidebar, initSidebar } from '../components/sidebar.js';
import { renderHeader } from '../components/header.js';
import { showToast } from '../components/toast.js';

export function renderProfile() {
  const user = auth.getUser();
  const roleLabels = { admin: 'Administrator', pedagog: 'Pedagog', mehmon: 'Mehmon' };

  return `
    <div class="flex min-h-screen bg-dark-50">
      ${renderSidebar()}
      <main class="flex-1 lg:ml-64 p-6 lg:p-8">
        ${renderHeader('Profil', 'Shaxsiy ma\'lumotlaringizni boshqaring')}

        <div class="max-w-3xl">
          <!-- Profile Header -->
          <div class="glass-card p-8 mb-6 bg-gradient-to-r from-primary-500/5 to-accent-500/5">
            <div class="flex flex-col sm:flex-row items-center gap-6">
              <div class="relative">
                <div class="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-3xl font-bold shadow-xl">
                  ${auth.getInitials(user?.full_name)}
                </div>
              </div>
              <div class="text-center sm:text-left">
                <h2 class="text-2xl font-bold text-dark-800" id="profile-display-name">${user?.full_name || ''}</h2>
                <p class="text-dark-500 mt-1" id="profile-display-subject">${user?.subject ? user.subject + ' o\'qituvchisi' : roleLabels[user?.role] || ''}</p>
                <div class="flex items-center gap-2 mt-2">
                  <span class="status-online"></span>
                  <span class="text-sm text-accent-600">Faol</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Profile Form -->
          <div class="glass-card p-6 mb-6">
            <h3 class="text-lg font-semibold text-dark-800 mb-5">Shaxsiy ma'lumotlar</h3>
            <form id="profile-form" class="space-y-5">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label class="input-label">To'liq ism</label>
                  <input type="text" class="input" id="profile-fullname" value="${user?.full_name || ''}" required />
                </div>
                <div>
                  <label class="input-label">Email</label>
                  <input type="email" class="input" id="profile-email" value="${user?.email || ''}" required />
                </div>
                <div>
                  <label class="input-label">Telefon</label>
                  <input type="tel" class="input" id="profile-phone" value="${user?.phone || ''}" placeholder="+998XXXXXXXXX" />
                </div>
                <div>
                  <label class="input-label">Fan</label>
                  <input type="text" class="input" id="profile-subject" value="${user?.subject || ''}" placeholder="Fan nomi" ${user?.role !== 'pedagog' ? 'disabled' : ''} />
                </div>
              </div>
              <div class="flex justify-end">
                <button type="submit" class="btn-primary" id="profile-submit-btn">Saqlash</button>
              </div>
            </form>
          </div>

          <!-- Password Change -->
          <div class="glass-card p-6">
            <h3 class="text-lg font-semibold text-dark-800 mb-5">Parolni o'zgartirish</h3>
            <form id="password-form" class="space-y-5">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label class="input-label">Yangi parol</label>
                  <input type="password" class="input" id="profile-new-password" placeholder="Kamida 6 ta belgi" required />
                </div>
                <div>
                  <label class="input-label">Parolni tasdiqlang</label>
                  <input type="password" class="input" id="profile-confirm-password" placeholder="Yangi parolni qaytaring" required />
                </div>
              </div>
              <div class="flex justify-end">
                <button type="submit" class="btn-secondary" id="password-submit-btn">Parolni yangilash</button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  `;
}

export function initProfile() {
  initSidebar();

  const user = auth.getUser();
  if (!user) return;

  // Handle Profile Update submit
  document.getElementById('profile-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const full_name = document.getElementById('profile-fullname')?.value.trim();
    const email = document.getElementById('profile-email')?.value.trim();
    const phone = document.getElementById('profile-phone')?.value.trim();
    const subject = document.getElementById('profile-subject')?.value.trim();

    if (!full_name || !email) {
      showToast('Ism va Email bo\'sh bo\'lishi mumkin emas.', 'warning');
      return;
    }

    const btn = document.getElementById('profile-submit-btn');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Saqlanmoqda...';
    }

    try {
      const res = await api.put(`/users/${user.id}`, {
        full_name,
        email,
        phone: phone || null,
        subject: user.role === 'pedagog' ? (subject || null) : null,
      });

      // Update localStorage session
      localStorage.setItem('ep_user', JSON.stringify(res.user));

      // Update DOM values
      const displayName = document.getElementById('profile-display-name');
      const displaySubject = document.getElementById('profile-display-subject');
      if (displayName) displayName.textContent = res.user.full_name;
      if (displaySubject) {
        displaySubject.textContent = res.user.role === 'pedagog' && res.user.subject
          ? `${res.user.subject} o'qituvchisi`
          : (res.user.role === 'admin' ? 'Administrator' : 'Mehmon');
      }

      showToast('Ma\'lumotlaringiz muvaffaqiyatli saqlandi!', 'success');
    } catch (err) {
      showToast(err.message || 'Xatolik yuz berdi', 'error');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Saqlash';
      }
    }
  });

  // Handle Password Update submit
  document.getElementById('password-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const newPass = document.getElementById('profile-new-password')?.value;
    const confirmPass = document.getElementById('profile-confirm-password')?.value;

    if (!newPass || newPass.length < 6) {
      showToast('Yangi parol kamida 6 ta belgidan iborat bo\'lishi kerak.', 'warning');
      return;
    }

    if (newPass !== confirmPass) {
      showToast('Yangi parollar bir-biriga mos kelmadi.', 'warning');
      return;
    }

    const btn = document.getElementById('password-submit-btn');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Yangilanmoqda...';
    }

    try {
      await api.put(`/users/${user.id}`, {
        password: newPass
      });

      showToast('Parolingiz muvaffaqiyatli o\'zgartirildi!', 'success');
      
      // Clear inputs
      const newPassInput = document.getElementById('profile-new-password');
      const confirmPassInput = document.getElementById('profile-confirm-password');
      if (newPassInput) newPassInput.value = '';
      if (confirmPassInput) confirmPassInput.value = '';
    } catch (err) {
      showToast(err.message || 'Xatolik yuz berdi', 'error');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Parolni yangilash';
      }
    }
  });
}
