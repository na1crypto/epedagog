/**
 * Login page
 */
import { auth } from '../utils/auth.js';
import { router } from '../utils/router.js';
import { showToast } from '../components/toast.js';

export function renderLogin() {
  return `
    <div class="min-h-screen gradient-hero flex items-center justify-center p-4 relative overflow-hidden">
      <!-- Background decoration -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
        <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl"></div>
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl"></div>
      </div>

      <div class="w-full max-w-md relative z-10 animate-scale-in">
        <!-- Logo -->
        <div class="text-center mb-8">
          <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-2xl">
            <svg class="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
            </svg>
          </div>
          <h1 class="text-3xl font-bold text-white tracking-tight">E-PEDAGOG</h1>
          <p class="text-primary-200 text-sm mt-1">Elektron hujjatlar boshqaruv tizimi</p>
        </div>

        <!-- Login Card -->
        <div class="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/50">
          <h2 class="text-xl font-semibold text-dark-800 mb-1">Xush kelibsiz!</h2>
          <p class="text-dark-400 text-sm mb-6">Tizimga kirish uchun ma'lumotlaringizni kiriting</p>

          <form id="login-form" class="space-y-5">
            <div>
              <label for="login-email" class="input-label">Email manzil</label>
              <div class="relative">
                <svg class="w-5 h-5 text-dark-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/></svg>
                <input type="email" id="login-email" class="input pl-11" placeholder="email@epedagog.uz" required value="admin@epedagog.uz" />
              </div>
            </div>

            <div>
              <label for="login-password" class="input-label">Parol</label>
              <div class="relative">
                <svg class="w-5 h-5 text-dark-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                <input type="password" id="login-password" class="input pl-11" placeholder="••••••••" required value="admin123" />
                <button type="button" id="toggle-password" class="absolute right-3.5 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600 transition-colors">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                </button>
              </div>
            </div>

            <div id="login-error" class="hidden text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-3"></div>

            <button type="submit" id="login-submit" class="btn-primary w-full py-3.5 text-base">
              <span id="login-btn-text">Kirish</span>
              <svg id="login-spinner" class="w-5 h-5 animate-spin hidden" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            </button>
          </form>

          <!-- Demo credentials -->
          <div class="mt-6 p-4 bg-primary-50 rounded-xl border border-primary-100">
            <p class="text-xs font-semibold text-primary-700 mb-2">Demo kirish ma'lumotlari:</p>
            <div class="space-y-1 text-xs text-primary-600">
              <p><span class="font-medium">Admin:</span> admin@epedagog.uz / admin123</p>
              <p><span class="font-medium">Pedagog:</span> olimjon@epedagog.uz / pedagog123</p>
              <p><span class="font-medium">Mehmon:</span> mehmon@epedagog.uz / mehmon123</p>
            </div>
          </div>
        </div>

        <p class="text-center text-primary-200/60 text-xs mt-6">&copy; 2026 E-PEDAGOG. Barcha huquqlar himoyalangan.</p>
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
