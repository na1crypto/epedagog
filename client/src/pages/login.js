/**
 * Login page - split layout redesign
 */
import { auth } from '../utils/auth.js';
import { router } from '../utils/router.js';
import { showToast } from '../components/toast.js';

export function renderLogin() {
  return `
    <div class="min-h-screen flex">
      <!-- LEFT PANEL: Branded (hidden on mobile) -->
      <div class="hidden lg:flex lg:w-2/5 flex-col justify-between p-10" style="background: linear-gradient(180deg, #1a2e4a 0%, #0f1d31 100%);">
        <!-- Logo area -->
        <div>
          <div class="flex items-center gap-3 mb-12">
            <div class="w-10 h-10 rounded-lg flex items-center justify-center" style="background: #0891b2;">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
              </svg>
            </div>
            <span class="text-white font-bold text-xl tracking-tight">E-PEDAGOG</span>
          </div>

          <!-- Geometric pattern / illustration -->
          <div class="mb-10">
            <svg viewBox="0 0 300 200" class="w-full max-w-xs opacity-20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="20" y="20" width="260" height="160" rx="8" stroke="white" stroke-width="1.5"/>
              <line x1="20" y1="55" x2="280" y2="55" stroke="white" stroke-width="1"/>
              <rect x="40" y="75" width="80" height="50" rx="4" fill="white" fill-opacity="0.2"/>
              <rect x="140" y="75" width="120" height="10" rx="2" fill="white" fill-opacity="0.3"/>
              <rect x="140" y="93" width="80" height="10" rx="2" fill="white" fill-opacity="0.2"/>
              <rect x="140" y="111" width="100" height="10" rx="2" fill="white" fill-opacity="0.2"/>
              <rect x="40" y="140" width="200" height="8" rx="2" fill="white" fill-opacity="0.15"/>
              <circle cx="250" cy="37" r="6" fill="white" fill-opacity="0.5"/>
              <circle cx="232" cy="37" r="6" fill="white" fill-opacity="0.3"/>
            </svg>
          </div>

          <h2 class="text-3xl font-bold text-white mb-3 leading-tight">
            Ta'lim muassasalari uchun<br/>elektron hujjat boshqaruvi
          </h2>
          <p class="text-slate-400 text-sm leading-relaxed mb-10">
            Pedagoglar, hujjatlar va portfolio boshqaruvini bitta tizimda markazlashtiring.
          </p>

          <!-- Feature bullets -->
          <div class="space-y-4">
            <div class="flex items-start gap-3">
              <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style="background: rgba(8,145,178,0.2);">
                <svg class="w-4 h-4" style="color: #0891b2;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <div>
                <p class="text-white text-sm font-medium">Hujjatlarni tartibli saqlash</p>
                <p class="text-slate-500 text-xs mt-0.5">Barcha dars ishlanma va rejalar bir joyda</p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style="background: rgba(8,145,178,0.2);">
                <svg class="w-4 h-4" style="color: #0891b2;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                </svg>
              </div>
              <div>
                <p class="text-white text-sm font-medium">Pedagoglar portfoliosini boshqarish</p>
                <p class="text-slate-500 text-xs mt-0.5">Sertifikat, diplom va yutuqlar ro'yxati</p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style="background: rgba(8,145,178,0.2);">
                <svg class="w-4 h-4" style="color: #0891b2;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
              </div>
              <div>
                <p class="text-white text-sm font-medium">Faollikni monitoring qilish</p>
                <p class="text-slate-500 text-xs mt-0.5">Muddatlar va holat nazorati</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom -->
        <div>
          <div class="h-px bg-white/10 mb-4"></div>
          <p class="text-slate-600 text-xs">&copy; 2026 E-PEDAGOG &mdash; v1.0.0</p>
        </div>
      </div>

      <!-- RIGHT PANEL: Login form -->
      <div class="flex-1 flex items-center justify-center p-6 sm:p-10 bg-[#f8f9fa]">
        <div class="w-full max-w-md animate-scale-in">
          <!-- Mobile logo -->
          <div class="lg:hidden text-center mb-8">
            <div class="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center" style="background: #1a2e4a;">
              <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
              </svg>
            </div>
            <h1 class="text-2xl font-bold text-dark-800">E-PEDAGOG</h1>
          </div>

          <div class="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
            <div class="mb-6">
              <h2 class="text-2xl font-bold text-dark-800">Tizimga kirish</h2>
              <p class="text-dark-400 text-sm mt-1">Hisobingizga kirish uchun ma'lumotlarni kiriting</p>
            </div>

            <form id="login-form" class="space-y-5">
              <div>
                <label for="login-email" class="input-label">Email manzil</label>
                <input type="email" id="login-email" class="input" placeholder="email@epedagog.uz" required value="admin@epedagog.uz" />
              </div>

              <div>
                <label for="login-password" class="input-label">Parol</label>
                <div class="relative">
                  <input type="password" id="login-password" class="input pr-11" placeholder="••••••••" required value="admin123" />
                  <button type="button" id="toggle-password" class="absolute right-3.5 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600 transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                  </button>
                </div>
              </div>

              <div id="login-error" class="hidden text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3"></div>

              <button type="submit" id="login-submit" class="btn-primary w-full py-3 text-sm">
                <span id="login-btn-text">Kirish</span>
                <svg id="login-spinner" class="w-4 h-4 animate-spin hidden" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              </button>
            </form>

            <!-- Demo credentials -->
            <div class="mt-6 border border-gray-200 rounded-lg overflow-hidden">
              <div class="px-4 py-2 bg-gray-50 border-b border-gray-200">
                <p class="text-xs font-semibold text-dark-500 uppercase tracking-wide">Demo kirish ma'lumotlari</p>
              </div>
              <div class="divide-y divide-gray-100">
                <div class="px-4 py-2.5 flex items-center justify-between text-xs">
                  <span class="font-medium text-dark-600">Admin</span>
                  <span class="text-dark-400 font-mono">admin@epedagog.uz / admin123</span>
                </div>
                <div class="px-4 py-2.5 flex items-center justify-between text-xs">
                  <span class="font-medium text-dark-600">Pedagog</span>
                  <span class="text-dark-400 font-mono">olimjon@epedagog.uz / pedagog123</span>
                </div>
                <div class="px-4 py-2.5 flex items-center justify-between text-xs">
                  <span class="font-medium text-dark-600">Mehmon</span>
                  <span class="text-dark-400 font-mono">mehmon@epedagog.uz / mehmon123</span>
                </div>
              </div>
            </div>
          </div>

          <p class="text-center text-dark-400 text-xs mt-5">&copy; 2026 E-PEDAGOG. Barcha huquqlar himoyalangan.</p>
        </div>
      </div>
    </div>
  `;
}

export function initLogin() {
  const form = document.getElementById('login-form');
  const toggleBtn = document.getElementById('toggle-password');

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const input = document.getElementById('login-password');
      input.type = input.type === 'password' ? 'text' : 'password';
    });
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;
      const errorDiv = document.getElementById('login-error');
      const btnText = document.getElementById('login-btn-text');
      const spinner = document.getElementById('login-spinner');
      const submitBtn = document.getElementById('login-submit');

      errorDiv.classList.add('hidden');
      btnText.textContent = 'Kirish...';
      spinner.classList.remove('hidden');
      submitBtn.disabled = true;

      try {
        await auth.login(email, password);
        showToast('Muvaffaqiyatli kirdingiz!', 'success');
        router.navigate('dashboard');
      } catch (err) {
        errorDiv.textContent = err.message;
        errorDiv.classList.remove('hidden');
      } finally {
        btnText.textContent = 'Kirish';
        spinner.classList.add('hidden');
        submitBtn.disabled = false;
      }
    });
  }
}
