(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=new class{constructor(){this.routes={},this.currentRoute=null,this.beforeEach=null,window.addEventListener(`hashchange`,()=>this.handleRoute()),window.addEventListener(`load`,()=>this.handleRoute())}on(e,t,n={}){return this.routes[e]={handler:t,options:n},this}guard(e){return this.beforeEach=e,this}navigate(e){window.location.hash=`#/${e}`}getPath(){return(window.location.hash.slice(2)||`login`).split(`?`)[0]}getParams(){let e=(window.location.hash.slice(2)||``).split(`?`)[1]||``;return Object.fromEntries(new URLSearchParams(e))}async handleRoute(){let e=this.getPath(),t=this.routes[e];if(!t){let e=localStorage.getItem(`ep_token`);this.navigate(e?`dashboard`:`login`);return}if(this.beforeEach&&!await this.beforeEach(e,t.options))return;let n=document.getElementById(`app`);if(n)try{n.classList.remove(`page-enter`),n.offsetWidth,n.classList.add(`page-enter`),n.innerHTML=await t.handler(this.getParams()),window.dispatchEvent(new CustomEvent(`route:loaded`,{detail:{path:e,params:this.getParams()}})),this.currentRoute=e}catch(e){console.error(`Route error:`,e),n.innerHTML=`
          <div class="flex items-center justify-center min-h-screen">
            <div class="text-center">
              <h2 class="text-2xl font-bold text-dark-800 mb-2">Xatolik yuz berdi</h2>
              <p class="text-dark-500">${e.message}</p>
            </div>
          </div>
        `}}},t=`ep_token`,n=`ep_refresh`,r=`ep_user`,i={async login(e,i){let a=await fetch(`/api/auth/login`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({email:e,password:i})});if(!a.ok){let e=await a.json().catch(()=>({error:`Ulanishda xatolik yuz berdi`}));throw Error(e.error||`Email yoki parol noto'g'ri`)}let o=await a.json();return localStorage.setItem(t,o.token),localStorage.setItem(n,o.refreshToken),localStorage.setItem(r,JSON.stringify(o.user)),o.user},async logout(){let e=this.getToken();if(e)try{await fetch(`/api/auth/logout`,{method:`POST`,headers:{"Content-Type":`application/json`,Authorization:`Bearer ${e}`}})}catch(e){console.warn(`Logout API call failed:`,e)}localStorage.removeItem(t),localStorage.removeItem(n),localStorage.removeItem(r)},isAuthenticated(){return!!localStorage.getItem(t)},getUser(){try{let e=localStorage.getItem(r);return e?JSON.parse(e):null}catch{return null}},getRole(){let e=this.getUser();return e?e.role:null},hasRole(...e){let t=this.getRole();return e.includes(t)},getToken(){return localStorage.getItem(t)},getInitials(e){return e?e.split(` `).map(e=>e[0]).join(``).toUpperCase().slice(0,2):`?`}},a=null;function o(e,t=`info`,n=3500){let r=document.getElementById(`toast-notification`);r&&r.remove(),a&&clearTimeout(a);let i={success:`<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,error:`<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,info:`<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,warning:`<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>`},o=document.createElement(`div`);o.id=`toast-notification`,o.className=`toast-${t}`,o.innerHTML=`
    ${i[t]||i.info}
    <span>${e}</span>
    <button onclick="this.parentElement.remove()" class="ml-2 hover:opacity-70 transition-opacity">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
    </button>
  `,document.body.appendChild(o),a=setTimeout(()=>{o.style.opacity=`0`,o.style.transform=`translateX(100%)`,o.style.transition=`all 0.3s ease-out`,setTimeout(()=>o.remove(),300)},n)}function s(){return`
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
  `}function c(){let t=document.getElementById(`login-form`),n=document.getElementById(`toggle-password`);n&&n.addEventListener(`click`,()=>{let e=document.getElementById(`login-password`);e.type=e.type===`password`?`text`:`password`}),t&&t.addEventListener(`submit`,async t=>{t.preventDefault();let n=document.getElementById(`login-email`).value.trim(),r=document.getElementById(`login-password`).value,a=document.getElementById(`login-error`),s=document.getElementById(`login-btn-text`),c=document.getElementById(`login-spinner`),l=document.getElementById(`login-submit`);a.classList.add(`hidden`),s.textContent=`Kirish...`,c.classList.remove(`hidden`),l.disabled=!0;try{await i.login(n,r),o(`Muvaffaqiyatli kirdingiz!`,`success`),e.navigate(`dashboard`)}catch(e){a.textContent=e.message,a.classList.remove(`hidden`)}finally{s.textContent=`Kirish`,c.classList.add(`hidden`),l.disabled=!1}})}var l=`/api`,u=new class{constructor(){this.baseUrl=l}async request(t,n={}){let r=`${this.baseUrl}${t}`,a=i.getToken(),o={"Content-Type":`application/json`};a&&(o.Authorization=`Bearer ${a}`);let s={...n,headers:{...o,...n.headers}};try{let t=await fetch(r,s);if(t.status===401)throw i.logout(),e.navigate(`login`),Error(`Sessiya muddati tugadi. Qaytadan kiring.`);if(!t.ok){let e=await t.json().catch(()=>({message:`Server xatoligi`}));throw Error(e.message)}return await t.json()}catch(e){throw e.name===`TypeError`&&e.message===`Failed to fetch`?Error(`Serverga ulanib bo'lmadi. Internet aloqasini tekshiring.`):e}}get(e){return this.request(e,{method:`GET`})}post(e,t){return this.request(e,{method:`POST`,body:JSON.stringify(t)})}put(e,t){return this.request(e,{method:`PUT`,body:JSON.stringify(t)})}delete(e){return this.request(e,{method:`DELETE`})}async upload(e,t){let n=i.getToken(),r={};n&&(r.Authorization=`Bearer ${n}`);let a=await fetch(`${this.baseUrl}${e}`,{method:`POST`,headers:r,body:t});if(!a.ok)throw Error(`Fayl yuklashda xatolik`);return await a.json()}},d=[{id:`dashboard`,label:`Bosh sahifa`,icon:`<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zm-10 9a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zm10-2a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1h-4a1 1 0 01-1-1v-5z"/></svg>`,roles:[`admin`,`pedagog`,`mehmon`]},{id:`documents`,label:`Hujjatlar`,icon:`<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>`,roles:[`admin`,`pedagog`,`mehmon`]},{id:`portfolio`,label:`Portfolio`,icon:`<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>`,roles:[`admin`,`pedagog`]},{id:`monitoring`,label:`Monitoring`,icon:`<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>`,roles:[`admin`]},{id:`users`,label:`Foydalanuvchilar`,icon:`<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>`,roles:[`admin`]}];function f(){let t=i.getUser(),n=t?.role||`mehmon`,r=e.getPath(),a=i.getInitials(t?.full_name);return`
    <aside id="sidebar" class="fixed left-0 top-0 h-full w-64 gradient-sidebar z-40 flex flex-col transition-transform duration-300 lg:translate-x-0 -translate-x-full">
      <!-- Logo -->
      <div class="p-6 pb-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
            </svg>
          </div>
          <div>
            <h1 class="text-white font-bold text-lg tracking-tight">E-PEDAGOG</h1>
            <p class="text-dark-400 text-[11px] font-medium tracking-wider uppercase">Boshqaruv tizimi</p>
          </div>
        </div>
      </div>

      <!-- Divider -->
      <div class="mx-5 h-px bg-gradient-to-r from-transparent via-dark-600 to-transparent"></div>

      <!-- Navigation -->
      <nav class="flex-1 px-4 py-5 space-y-1 overflow-y-auto">
        ${d.filter(e=>e.roles.includes(n)).map(e=>`
          <a href="#/${e.id}" class="sidebar-link relative ${r===e.id?`active`:``}" data-page="${e.id}">
            ${e.icon}
            <span class="text-sm">${e.label}</span>
          </a>
        `).join(``)}
      </nav>

      <!-- User Profile -->
      <div class="p-4 mx-3 mb-4 rounded-xl bg-white/5 border border-white/5">
        <a href="#/profile" class="flex items-center gap-3 group cursor-pointer">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white font-semibold text-sm shadow-md">
            ${a}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-white text-sm font-medium truncate group-hover:text-primary-300 transition-colors">${t?.full_name||`Foydalanuvchi`}</p>
            <p class="text-dark-400 text-xs">${{admin:`Administrator`,pedagog:`Pedagog`,mehmon:`Mehmon`}[n]||n}</p>
          </div>
        </a>
        <button id="logout-btn" class="mt-3 w-full flex items-center gap-2 px-3 py-2 text-sm text-dark-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
          <span>Chiqish</span>
        </button>
      </div>
    </aside>
  `}function p(){let t=document.getElementById(`logout-btn`);t&&t.addEventListener(`click`,()=>{i.logout(),e.navigate(`login`)});let n=document.getElementById(`mobile-menu-toggle`),r=document.getElementById(`sidebar`);n&&r&&n.addEventListener(`click`,()=>{r.classList.toggle(`-translate-x-full`)})}function m(e,t=``){i.getUser();let n=new Date().toLocaleDateString(`uz-UZ`,{weekday:`long`,year:`numeric`,month:`long`,day:`numeric`});return`
    <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div class="flex items-center gap-4">
        <button id="mobile-menu-toggle" class="lg:hidden p-2 hover:bg-dark-100 rounded-xl transition-colors">
          <svg class="w-6 h-6 text-dark-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
        <div>
          <h1 class="text-2xl font-bold text-dark-800">${e}</h1>
          <p class="text-dark-400 text-sm mt-0.5">${t||n}</p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <div class="relative hidden sm:block">
          <svg class="w-4 h-4 text-dark-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input type="text" id="global-search" placeholder="Qidirish..." class="pl-10 pr-4 py-2.5 rounded-xl border border-dark-200 bg-white/80 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all" />
        </div>
        <button class="relative p-2.5 hover:bg-dark-100 rounded-xl transition-colors">
          <svg class="w-5 h-5 text-dark-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
          <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
      </div>
    </header>
  `}var h=`modulepreload`,g=function(e){return`/`+e},_={},v=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){let e=document.getElementsByTagName(`link`),i=document.querySelector(`meta[property=csp-nonce]`),a=i?.nonce||i?.getAttribute(`nonce`);function o(e){return Promise.all(e.map(e=>Promise.resolve(e).then(e=>({status:`fulfilled`,value:e}),e=>({status:`rejected`,reason:e}))))}r=o(t.map(t=>{if(t=g(t,n),t in _)return;_[t]=!0;let r=t.endsWith(`.css`),i=r?`[rel="stylesheet"]`:``;if(n)for(let n=e.length-1;n>=0;n--){let i=e[n];if(i.href===t&&(!r||i.rel===`stylesheet`))return}else if(document.querySelector(`link[href="${t}"]${i}`))return;let o=document.createElement(`link`);if(o.rel=r?`stylesheet`:h,r||(o.as=`script`),o.crossOrigin=``,o.href=t,a&&o.setAttribute(`nonce`,a),document.head.appendChild(o),r)return new Promise((e,n)=>{o.addEventListener(`load`,e),o.addEventListener(`error`,()=>n(Error(`Unable to preload CSS for ${t}`)))})}))}function i(e){let t=new Event(`vite:preloadError`,{cancelable:!0});if(t.payload=e,window.dispatchEvent(t),!t.defaultPrevented)throw e}return r.then(t=>{for(let e of t||[])e.status===`rejected`&&i(e.reason);return e().catch(i)})},y=[0,0,0,0,0,0,0],b={doc:`<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>`,upload:`<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>`,alert:`<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>`,users:`<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>`},x={uploaded:{label:`Yuklangan`,class:`badge-success`},pending:{label:`Kutilmoqda`,class:`badge-warning`},overdue:{label:`Muddati o'tgan`,class:`badge-danger`}};async function S(){let e=i.getUser(),t={totalDocuments:0,todayUploads:0,overdueDocuments:0,totalPedagog:0},n=[];try{let[e,r]=await Promise.all([u.get(`/monitoring/stats`).catch(e=>(console.warn(`Stats fetch failed, using fallback:`,e),{totalDocuments:0,todayUploads:0,overdueDocuments:0,totalPedagog:0,weeklyActivity:[0,0,0,0,0,0,0]})),u.get(`/documents`).catch(e=>(console.warn(`Documents fetch failed:`,e),{data:[]}))]);t=e,y=e.weeklyActivity||[0,0,0,0,0,0,0],n=(r.data||[]).slice(0,5)}catch(e){console.error(`Dashboard load error:`,e)}let r=[{label:`Jami hujjatlar`,value:t.totalDocuments,change:`+12 bu hafta`,icon:`doc`,color:`from-primary-500 to-primary-600`},{label:`Bugungi yuklamalar`,value:t.todayUploads,change:`Faol kun`,icon:`upload`,color:`from-accent-500 to-accent-600`},{label:`Muddati o'tganlar`,value:t.overdueDocuments,change:`E'tibor talab etiladi`,icon:`alert`,color:`from-red-500 to-red-600`},{label:`Pedagoglar`,value:t.totalPedagog,change:`Faol o'qituvchilar`,icon:`users`,color:`from-violet-500 to-violet-600`}];return`
    <div class="flex min-h-screen bg-dark-50">
      ${f()}
      <main class="flex-1 lg:ml-64 p-6 lg:p-8">
        ${m(`Salom, ${e?.full_name?.split(` `)[0]||`Foydalanuvchi`}! 👋`)}
 
        <!-- Stats Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          ${r.map((e,t)=>`
            <div class="stat-card animate-scale-in" style="animation-delay: ${t*80}ms">
              <div class="flex items-start justify-between">
                <div>
                  <p class="text-dark-400 text-sm font-medium">${e.label}</p>
                  <p class="text-3xl font-bold text-dark-800 mt-2">${e.value}</p>
                  <p class="text-xs mt-2 ${e.label.includes(`o'tgan`)?`text-red-500`:`text-accent-600`}">${e.change}</p>
                </div>
                <div class="w-12 h-12 rounded-xl bg-gradient-to-br ${e.color} flex items-center justify-center text-white shadow-lg">
                  ${b[e.icon]}
                </div>
              </div>
            </div>
          `).join(``)}
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
              ${i.hasRole(`admin`)?`
              <a href="#/monitoring" class="flex items-center gap-4 p-4 rounded-xl bg-violet-50 hover:bg-violet-100 transition-colors group">
                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center text-white shadow-md">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                </div>
                <div>
                  <p class="font-medium text-dark-800 text-sm group-hover:text-violet-700 transition-colors">Monitoring</p>
                  <p class="text-xs text-dark-400">Hisobotlarni ko'rish</p>
                </div>
              </a>`:``}
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
                ${n.length===0?`
                <tr>
                  <td colspan="5" class="px-6 py-8 text-center text-dark-400 font-medium bg-white">Hujjatlar yuklanmagan</td>
                </tr>
                `:n.map(e=>`
                <tr class="border-t border-dark-100 hover:bg-primary-50/50 transition-colors">
                  <td class="px-6 py-4 font-medium text-dark-800">${e.title}</td>
                  <td class="px-6 py-4 text-dark-600">${e.author_name||`Muallif topilmadi`}</td>
                  <td class="px-6 py-4"><span class="badge-info">${e.category}</span></td>
                  <td class="px-6 py-4 text-dark-500">${new Date(e.created_at).toLocaleDateString(`uz-UZ`)}</td>
                  <td class="px-6 py-4"><span class="${x[e.status]?.class||`badge-warning`}">${x[e.status]?.label||e.status}</span></td>
                </tr>`).join(``)}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  `}function C(){p(),w()}function w(){let e=document.getElementById(`activity-chart`);e&&v(async()=>{let{Chart:e,registerables:t}=await import(`./chart-vM59ydkj.js`);return{Chart:e,registerables:t}},[]).then(({Chart:t,registerables:n})=>{t.register(...n);let r=t.getChart(e);r&&r.destroy(),new t(e,{type:`bar`,data:{labels:[`Dush`,`Sesh`,`Chor`,`Pay`,`Jum`,`Shan`,`Yak`],datasets:[{label:`Yuklangan hujjatlar`,data:y,backgroundColor:`rgba(59, 130, 246, 0.15)`,borderColor:`rgba(59, 130, 246, 0.8)`,borderWidth:2,borderRadius:8,borderSkipped:!1}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!1}},scales:{y:{beginAtZero:!0,grid:{color:`rgba(0,0,0,0.04)`},ticks:{font:{family:`Inter`},stepSize:1}},x:{grid:{display:!1},ticks:{font:{family:`Inter`}}}}}})})}function T(e,t,n={}){let{onConfirm:r,onCancel:i,confirmText:a=`Tasdiqlash`,cancelText:o=`Bekor qilish`,size:s=`md`}=n,c={sm:`max-w-sm`,md:`max-w-lg`,lg:`max-w-2xl`,xl:`max-w-4xl`},l=document.createElement(`div`);l.id=`modal-overlay`,l.className=`modal-overlay`,l.innerHTML=`
    <div class="modal-content ${c[s]||c.md}">
      <div class="flex items-center justify-between mb-5">
        <h3 class="text-lg font-semibold text-dark-800">${e}</h3>
        <button id="modal-close-btn" class="p-2 hover:bg-dark-100 rounded-lg transition-colors">
          <svg class="w-5 h-5 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
      <div id="modal-body">${t}</div>
      ${r?`
        <div class="flex items-center justify-end gap-3 mt-6 pt-5 border-t border-dark-100">
          <button id="modal-cancel-btn" class="btn-secondary">${o}</button>
          <button id="modal-confirm-btn" class="btn-primary">${a}</button>
        </div>
      `:``}
    </div>
  `,document.body.appendChild(l);let u=()=>{l.style.opacity=`0`,l.style.transition=`opacity 0.2s ease-out`,setTimeout(()=>l.remove(),200)};l.querySelector(`#modal-close-btn`).addEventListener(`click`,()=>{i&&i(),u()}),l.addEventListener(`click`,e=>{e.target===l&&(i&&i(),u())});let d=l.querySelector(`#modal-cancel-btn`);d&&d.addEventListener(`click`,()=>{i&&i(),u()});let f=l.querySelector(`#modal-confirm-btn`);f&&f.addEventListener(`click`,()=>{r&&r(u)});let p=e=>{e.key===`Escape`&&(i&&i(),u(),document.removeEventListener(`keydown`,p))};return document.addEventListener(`keydown`,p),{close:u,overlay:l}}var E=[`Barchasi`,`Dars ishlanma`,`Taqvim reja`,`Hisobot`,`O'quv dastur`,`Metodik qo'llanma`,`Boshqa`],D={uploaded:{label:`Yuklangan`,class:`badge-success`},pending:{label:`Kutilmoqda`,class:`badge-warning`},overdue:{label:`Muddati o'tgan`,class:`badge-danger`}},O={pdf:{color:`text-red-500 bg-red-50`,label:`PDF`},docx:{color:`text-primary-500 bg-primary-50`,label:`DOCX`},doc:{color:`text-primary-500 bg-primary-50`,label:`DOC`},xlsx:{color:`text-accent-500 bg-accent-50`,label:`XLSX`},xls:{color:`text-accent-500 bg-accent-50`,label:`XLS`},pptx:{color:`text-amber-500 bg-amber-50`,label:`PPTX`},ppt:{color:`text-amber-500 bg-amber-50`,label:`PPT`}};function k(e){return e?e<1024?e+` B`:e<1048576?(e/1024).toFixed(1)+` KB`:(e/1048576).toFixed(1)+` MB`:`—`}async function A(){let e=[];try{e=(await u.get(`/documents`)).data||[]}catch(e){console.error(`Initial documents load error:`,e),o(`Hujjatlarni yuklashda xatolik yuz berdi.`,`error`)}return`
    <div class="flex min-h-screen bg-dark-50">
      ${f()}
      <main class="flex-1 lg:ml-64 p-6 lg:p-8">
        ${m(`Hujjatlar ombori`,`Barcha hujjatlarni boshqaring va saralang`)}

        <!-- Toolbar -->
        <div class="glass-card p-4 mb-6">
          <div class="flex flex-col md:flex-row md:items-center gap-4">
            <div class="relative flex-1">
              <svg class="w-4 h-4 text-dark-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <input type="text" id="doc-search" placeholder="Hujjat nomini qidiring..." class="input pl-10" />
            </div>
            <div class="flex items-center gap-3">
              <select id="doc-category-filter" class="input w-auto">
                ${E.map(e=>`<option value="${e}">${e}</option>`).join(``)}
              </select>
              <select id="doc-status-filter" class="input w-auto">
                <option value="">Barcha holatlar</option>
                <option value="uploaded">Yuklangan</option>
                <option value="pending">Kutilmoqda</option>
                <option value="overdue">Muddati o'tgan</option>
              </select>
              ${i.hasRole(`admin`,`pedagog`)?`
              <button id="upload-btn" class="btn-primary whitespace-nowrap">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                Yuklash
              </button>`:``}
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
              ${e.length===0?`
              <tr>
                <td colspan="8" class="text-center py-8 text-dark-400 font-medium">Hujjatlar topilmadi</td>
              </tr>`:e.map(e=>j(e)).join(``)}
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="flex items-center justify-between mt-6 px-2">
          <p class="text-sm text-dark-400">Jami: <span class="font-medium text-dark-700" id="total-count">${e.length}</span> ta hujjat</p>
          <div class="flex items-center gap-1">
            <button class="px-3 py-1.5 rounded-lg text-sm bg-primary-500 text-white font-medium">1</button>
          </div>
        </div>
      </main>
    </div>
  `}function j(e){let t=O[e.file_type]||{color:`text-dark-500 bg-dark-50`,label:e.file_type?.toUpperCase()||`FAYL`},n=D[e.status]||{label:e.status,class:`badge-warning`},r=i.getUser(),a=i.hasRole(`admin`)||i.hasRole(`pedagog`)&&e.uploaded_by===r.id;return`
    <tr class="border-t border-dark-100 hover:bg-primary-50/50 transition-colors">
      <td>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg ${t.color} flex items-center justify-center text-xs font-bold flex-shrink-0">${t.label}</div>
          <span class="font-medium text-dark-800">${e.title}</span>
        </div>
      </td>
      <td><span class="text-xs uppercase font-medium text-dark-400">${e.file_type}</span></td>
      <td><span class="badge-info">${e.category}</span></td>
      <td class="text-dark-500">${k(e.file_size)}</td>
      <td class="text-dark-600">${e.author_name||`—`}</td>
      <td class="text-dark-500">${new Date(e.created_at).toLocaleDateString(`uz-UZ`)}</td>
      <td><span class="${n.class}">${n.label}</span></td>
      <td>
        <div class="flex items-center gap-1">
          <button class="p-1.5 hover:bg-primary-50 rounded-lg transition-colors download-doc-btn" data-link="${e.drive_link}" title="Ko'rish / Yuklab olish">
            <svg class="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
          </button>
          ${a?`
          <button class="p-1.5 hover:bg-red-50 rounded-lg transition-colors delete-doc-btn" data-id="${e.id}" title="O'chirish">
            <svg class="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>`:``}
        </div>
      </td>
    </tr>`}async function M(){let e=document.getElementById(`doc-search`)?.value||``,t=document.getElementById(`doc-category-filter`)?.value||`Barchasi`,n=document.getElementById(`doc-status-filter`)?.value||``,r=document.getElementById(`documents-table-body`);if(r)try{let i=`/documents?search=${encodeURIComponent(e)}&category=${encodeURIComponent(t)}`;n&&(i+=`&status=${encodeURIComponent(n)}`);let a=(await u.get(i)).data||[];a.length===0?r.innerHTML=`
        <tr>
          <td colspan="8" class="text-center py-8 text-dark-400 font-medium">Hujjatlar topilmadi</td>
        </tr>`:r.innerHTML=a.map(e=>j(e)).join(``);let o=document.getElementById(`total-count`);o&&(o.textContent=a.length)}catch(e){console.error(`Table reload error:`,e)}}function N(){p();let e=document.getElementById(`upload-btn`);e&&e.addEventListener(`click`,()=>{T(`Yangi hujjat yuklash`,`
        <form id="upload-form" class="space-y-4">
          <div>
            <label class="input-label">Hujjat nomi</label>
            <input type="text" class="input" id="upload-title" placeholder="Masalan: Matematika dars ishlanma" required />
          </div>
          <div>
            <label class="input-label">Kategoriya</label>
            <select class="input" id="upload-category">${E.slice(1).map(e=>`<option>${e}</option>`).join(``)}</select>
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
      `,{confirmText:`Yuklash`,onConfirm:async e=>{let t=document.getElementById(`upload-title`)?.value.trim(),n=document.getElementById(`upload-category`)?.value,r=document.getElementById(`upload-deadline`)?.value,i=document.getElementById(`file-input`)?.files[0];if(!t||!n){o(`Hujjat nomi va kategoriyasi talab etiladi`,`warning`);return}if(!i){o(`Fayl tanlang`,`warning`);return}let a=new FormData;a.append(`title`,t),a.append(`category`,n),r&&a.append(`deadline`,r),a.append(`file`,i);let s=document.querySelector(`.modal-confirm-btn`);s&&(s.disabled=!0,s.textContent=`Yuklanmoqda...`);try{await u.upload(`/documents/upload`,a),o(`Hujjat muvaffaqiyatli yuklandi!`,`success`),e(),M()}catch(e){o(e.message||`Yuklashda xatolik yuz berdi`,`error`),s&&(s.disabled=!1,s.textContent=`Yuklash`)}}}),setTimeout(()=>{let e=document.getElementById(`drop-zone`),t=document.getElementById(`file-input`),n=document.getElementById(`drop-zone-text`);e&&t&&(e.addEventListener(`click`,()=>t.click()),e.addEventListener(`dragover`,t=>{t.preventDefault(),e.classList.add(`dragover`)}),e.addEventListener(`dragleave`,()=>e.classList.remove(`dragover`)),e.addEventListener(`drop`,r=>{r.preventDefault(),e.classList.remove(`dragover`),r.dataTransfer.files.length&&(t.files=r.dataTransfer.files,n&&(n.innerHTML=`Fayl tanlandi: <span class="text-primary-600 font-semibold">${r.dataTransfer.files[0].name}</span>`),o(`Fayl yuklashga tayyor`,`info`))}),t.addEventListener(`change`,()=>{t.files.length&&(n&&(n.innerHTML=`Fayl tanlandi: <span class="text-primary-600 font-semibold">${t.files[0].name}</span>`),o(`Fayl yuklashga tayyor`,`info`))}))},100)}),document.getElementById(`doc-search`)?.addEventListener(`input`,M),document.getElementById(`doc-category-filter`)?.addEventListener(`change`,M),document.getElementById(`doc-status-filter`)?.addEventListener(`change`,M);let t=document.getElementById(`documents-table-body`);t&&t.addEventListener(`click`,async e=>{let t=e.target.closest(`.delete-doc-btn`),n=e.target.closest(`.download-doc-btn`);if(t){let e=t.dataset.id;if(confirm(`Ushbu hujjatni o'chirishni tasdiqlaysizmi?`))try{await u.delete(`/documents/${e}`),o(`Hujjat o'chirildi`,`success`),M()}catch(e){o(e.message||`Hujjatni o'chirishda xatolik yuz berdi`,`error`)}}if(n){let e=n.dataset.link;e?window.open(e,`_blank`):o(`Fayl havolasi topilmadi`,`warning`)}})}var P={sertifikat:{label:`Sertifikat`,class:`badge-info`,icon:`🏆`},yutuq:{label:`Yutuq`,class:`badge-success`,icon:`🥇`},ishlanma:{label:`Metodik ishlanma`,class:`badge-warning`,icon:`📘`}},F=[`Barchasi`,`sertifikat`,`yutuq`,`ishlanma`];async function I(){let e=i.getUser(),t=[];try{t=(await u.get(`/portfolio/${e.id}`)).data||[]}catch(e){console.error(`Fetch portfolio error:`,e),o(`Portfolio yozuvlarini yuklab bo'lmadi.`,`error`)}let n=t.filter(e=>e.type===`sertifikat`).length,r=t.filter(e=>e.type===`yutuq`).length,a=t.filter(e=>e.type===`ishlanma`).length;return`
    <div class="flex min-h-screen bg-dark-50">
      ${f()}
      <main class="flex-1 lg:ml-64 p-6 lg:p-8">
        ${m(`Elektron Portfolio`,`${e?.full_name||`Pedagog`}ning professional yutuqlari`)}

        <!-- Profile Summary Card -->
        <div class="glass-card p-6 mb-6 bg-gradient-to-r from-primary-500/5 to-accent-500/5">
          <div class="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-2xl font-bold shadow-xl">
              ${i.getInitials(e?.full_name)}
            </div>
            <div class="flex-1">
              <h2 class="text-xl font-bold text-dark-800">${e?.full_name||`Pedagog`}</h2>
              <p class="text-dark-500 text-sm">${e?.subject||`Fan`} o'qituvchisi</p>
              <div class="flex items-center gap-4 mt-3">
                <div class="flex items-center gap-1.5">
                  <span class="text-2xl font-bold text-primary-600" id="count-certs">${n}</span>
                  <span class="text-xs text-dark-400">Sertifikat</span>
                </div>
                <div class="w-px h-8 bg-dark-200"></div>
                <div class="flex items-center gap-1.5">
                  <span class="text-2xl font-bold text-accent-600" id="count-yutuq">${r}</span>
                  <span class="text-xs text-dark-400">Yutuq</span>
                </div>
                <div class="w-px h-8 bg-dark-200"></div>
                <div class="flex items-center gap-1.5">
                  <span class="text-2xl font-bold text-amber-600" id="count-ishlanma">${a}</span>
                  <span class="text-xs text-dark-400">Ishlanma</span>
                </div>
              </div>
            </div>
            ${i.hasRole(`admin`,`pedagog`)?`
            <button id="add-portfolio-btn" class="btn-primary">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
              Qo'shish
            </button>`:``}
          </div>
        </div>

        <!-- Filter Tabs -->
        <div class="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          ${F.map((e,t)=>`
            <button class="portfolio-filter px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${t===0?`bg-primary-500 text-white shadow-lg shadow-primary-500/25`:`bg-white text-dark-500 hover:bg-dark-100 border border-dark-200`}" data-type="${e}">
              ${e===`Barchasi`?`Barchasi`:P[e].label}
            </button>
          `).join(``)}
        </div>

        <!-- Portfolio Grid -->
        <div id="portfolio-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          ${t.length===0?`
          <div class="col-span-full text-center py-12 text-dark-400 font-medium bg-white rounded-3xl border border-dark-100">
            Portfolio yozuvlari mavjud emas.
          </div>
          `:t.map((e,t)=>L(e,t)).join(``)}
        </div>
      </main>
    </div>
  `}function L(e,t=0){let n=P[e.type]||{label:e.type,class:`badge-info`,icon:`📝`},r=i.getUser(),a=i.hasRole(`admin`)||e.user_id===r.id,o=e.issue_date?new Date(e.issue_date).toLocaleDateString(`uz-UZ`):`—`;return`
    <div class="glass-card p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 portfolio-item-card animate-scale-in" data-type="${e.type}" style="animation-delay: ${t*60}ms">
      <div class="flex items-start justify-between mb-4">
        <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center text-2xl">${n.icon}</div>
        <span class="${n.class}">${n.label}</span>
      </div>
      <h3 class="font-semibold text-dark-800 mb-1.5">${e.title}</h3>
      <p class="text-sm text-dark-400 mb-4">${e.description||`Tavsif kiritilmagan`}</p>
      <div class="flex items-center justify-between pt-3 border-t border-dark-100">
        <span class="text-xs text-dark-400">${o}</span>
        <div class="flex items-center gap-1">
          ${e.drive_link?`
          <button class="p-1.5 hover:bg-primary-50 rounded-lg transition-colors view-portfolio-file" data-link="${e.drive_link}" title="Ko'rish">
            <svg class="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
          </button>`:``}
          ${a?`
          <button class="p-1.5 hover:bg-red-50 rounded-lg transition-colors delete-portfolio-btn" data-id="${e.id}" title="O'chirish">
            <svg class="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>`:``}
        </div>
      </div>
    </div>`}async function R(e=`Barchasi`){let t=i.getUser(),n=document.getElementById(`portfolio-grid`);if(n)try{let r=`/portfolio/${t.id}`;e!==`Barchasi`&&(r+=`?type=${e}`);let i=(await u.get(r)).data||[];if(i.length===0?n.innerHTML=`
        <div class="col-span-full text-center py-12 text-dark-400 font-medium bg-white rounded-3xl border border-dark-100">
          Portfolio yozuvlari mavjud emas.
        </div>`:n.innerHTML=i.map((e,t)=>L(e,t)).join(``),e===`Barchasi`){let e=i.filter(e=>e.type===`sertifikat`).length,t=i.filter(e=>e.type===`yutuq`).length,n=i.filter(e=>e.type===`ishlanma`).length,r=document.getElementById(`count-certs`),a=document.getElementById(`count-yutuq`),o=document.getElementById(`count-ishlanma`);r&&(r.textContent=e),a&&(a.textContent=t),o&&(o.textContent=n)}}catch(e){console.error(`Grid reload error:`,e)}}function z(){p(),document.querySelectorAll(`.portfolio-filter`).forEach(e=>{e.addEventListener(`click`,()=>{document.querySelectorAll(`.portfolio-filter`).forEach(e=>{e.className=`portfolio-filter px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap bg-white text-dark-500 hover:bg-dark-100 border border-dark-200`}),e.className=`portfolio-filter px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap bg-primary-500 text-white shadow-lg shadow-primary-500/25`;let t=e.dataset.type;R(t)})});let e=document.getElementById(`add-portfolio-btn`);e&&e.addEventListener(`click`,()=>{T(`Yangi yozuv qo'shish`,`
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
      `,{confirmText:`Saqlash`,onConfirm:async e=>{let t=document.getElementById(`portfolio-title`)?.value.trim(),n=document.getElementById(`portfolio-type`)?.value,r=document.getElementById(`portfolio-desc`)?.value.trim(),i=document.getElementById(`portfolio-date`)?.value;if(!t||!n){o(`Sarlavha va tur majburiy`,`warning`);return}let a=document.querySelector(`.modal-confirm-btn`);a&&(a.disabled=!0,a.textContent=`Saqlanmoqda...`);try{await u.post(`/portfolio`,{title:t,type:n,description:r,issue_date:i||null}),o(`Portfolio yozuvi qo'shildi!`,`success`),e(),R()}catch(e){o(e.message||`Saqlashda xatolik yuz berdi`,`error`),a&&(a.disabled=!1,a.textContent=`Saqlash`)}}})});let t=document.getElementById(`portfolio-grid`);t&&t.addEventListener(`click`,async e=>{let t=e.target.closest(`.delete-portfolio-btn`),n=e.target.closest(`.view-portfolio-file`);if(t){let e=t.dataset.id;if(confirm(`Ushbu yozuvni o'chirishni xohlaysizmi?`))try{await u.delete(`/portfolio/${e}`),o(`Portfolio yozuvi o'chirildi`,`success`),R()}catch(e){o(e.message||`O'chirishda xatolik yuz berdi`,`error`)}}if(n){let e=n.dataset.link;e&&window.open(e,`_blank`)}})}var B=[0,0,0,0,0,0,0],V={excellent:{label:`A'lo`,dot:`status-online`,bg:`bg-accent-100 text-accent-700`},good:{label:`Yaxshi`,dot:`status-online`,bg:`bg-primary-100 text-primary-700`},warning:{label:`O'rtacha`,dot:`status-warning`,bg:`bg-amber-100 text-amber-700`},danger:{label:`Past`,dot:`status-offline`,bg:`bg-red-100 text-red-700`}};async function H(){let e={totalDocuments:0,totalUsers:0,totalPedagog:0,todayUploads:0,overdueDocuments:0,weeklyActivity:[0,0,0,0,0,0,0],teachersStats:[]};try{let t=await u.get(`/monitoring/stats`);e=t,B=t.weeklyActivity||[0,0,0,0,0,0,0]}catch(e){console.error(`Fetch monitoring stats error:`,e)}let t=e.teachersStats||[],n=t.reduce((e,t)=>e+t.uploaded,0),r=t.reduce((e,t)=>e+t.required,0)||1,i=Math.round(n/r*100),a=t.filter(e=>e.status===`excellent`).length,o=t.filter(e=>e.status===`danger`||e.status===`warning`).length;return`
    <div class="flex min-h-screen bg-dark-50">
      ${f()}
      <main class="flex-1 lg:ml-64 overflow-y-auto">
        <div class="p-6 lg:p-8">
        ${m(`Monitoring paneli`,`Pedagoglar faoliyatini kuzating`)}

        <!-- Summary Stats -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div class="stat-card">
            <p class="text-dark-400 text-sm">Umumiy bajarilish</p>
            <div class="flex items-end gap-2 mt-2">
              <span class="text-3xl font-bold text-dark-800">${i}%</span>
            </div>
            <div class="w-full bg-dark-100 rounded-full h-2 mt-3">
              <div class="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all" style="width: ${i}%"></div>
            </div>
          </div>
          <div class="stat-card">
            <p class="text-dark-400 text-sm">Jami yuklangan</p>
            <p class="text-3xl font-bold text-dark-800 mt-2">${n}<span class="text-lg text-dark-400 font-normal">/${r}</span></p>
            <p class="text-xs text-accent-600 mt-2">hujjat topshirildi</p>
          </div>
          <div class="stat-card">
            <p class="text-dark-400 text-sm">A'lo baholangan</p>
            <p class="text-3xl font-bold text-accent-600 mt-2">${a}</p>
            <p class="text-xs text-dark-400 mt-2">pedagog</p>
          </div>
          <div class="stat-card">
            <p class="text-dark-400 text-sm">Diqqat talab etadi</p>
            <p class="text-3xl font-bold text-red-500 mt-2">${o}</p>
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
              ${Object.entries(V).map(([e,n])=>{let r=t.filter(t=>t.status===e).length,i=t.length>0?Math.round(r/t.length*100):0;return`
                <div>
                  <div class="flex items-center justify-between mb-1.5">
                    <div class="flex items-center gap-2">
                      <span class="${n.dot}"></span>
                      <span class="text-sm font-medium text-dark-700">${n.label}</span>
                    </div>
                    <span class="text-sm font-semibold text-dark-800">${r} ta (${i}%)</span>
                  </div>
                  <div class="w-full bg-dark-100 rounded-full h-2">
                    <div class="h-2 rounded-full transition-all ${e===`excellent`?`bg-accent-500`:e===`good`?`bg-primary-500`:e===`warning`?`bg-amber-500`:`bg-red-500`}" style="width: ${i}%"></div>
                  </div>
                </div>`}).join(``)}
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
                ${t.length===0?`
                <tr>
                  <td colspan="7" class="text-center py-8 text-dark-400 font-medium">Pedagoglar topilmadi</td>
                </tr>
                `:t.map(e=>{let t=Math.round(e.uploaded/e.required*100),n=V[e.status]||V.danger;return`
                  <tr class="border-t border-dark-100 hover:bg-primary-50/50 transition-colors">
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                          ${e.name?e.name.split(` `).map(e=>e[0]).join(``).slice(0,2).toUpperCase():`?`}
                        </div>
                        <span class="font-medium text-dark-800 whitespace-nowrap">${e.name}</span>
                      </div>
                    </td>
                    <td class="px-6 py-4 text-dark-600">${e.subject}</td>
                    <td class="px-6 py-4 font-medium text-dark-700">${e.uploaded}/${e.required}</td>
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-2">
                        <div class="w-20 bg-dark-100 rounded-full h-1.5">
                          <div class="h-1.5 rounded-full ${t>=90?`bg-accent-500`:t>=60?`bg-primary-500`:t>=40?`bg-amber-500`:`bg-red-500`}" style="width: ${t}%"></div>
                        </div>
                        <span class="text-xs font-medium text-dark-500">${t}%</span>
                      </div>
                    </td>
                    <td class="px-6 py-4 text-accent-600 font-medium">${e.onTime}</td>
                    <td class="px-6 py-4 text-red-500 font-medium">${e.late}</td>
                    <td class="px-6 py-4"><span class="badge ${n.bg}">${n.label}</span></td>
                  </tr>`}).join(``)}
              </tbody>
            </table>
          </div>
        </div>
        </div>
      </main>
    </div>
  `}function U(){p(),W()}function W(){let e=document.getElementById(`monitoring-chart`);e&&v(async()=>{let{Chart:e,registerables:t}=await import(`./chart-vM59ydkj.js`);return{Chart:e,registerables:t}},[]).then(({Chart:t,registerables:n})=>{t.register(...n);let r=t.getChart(e);r&&r.destroy(),new t(e,{type:`line`,data:{labels:[`Dush`,`Sesh`,`Chor`,`Pay`,`Jum`,`Shan`,`Yak`],datasets:[{label:`Yuklangan`,data:B,borderColor:`#3b82f6`,backgroundColor:`rgba(59,130,246,0.1)`,fill:!0,tension:.4,borderWidth:2,pointBackgroundColor:`#3b82f6`,pointBorderColor:`#fff`,pointBorderWidth:2,pointRadius:5,pointHoverRadius:7}]},options:{responsive:!0,maintainAspectRatio:!1,interaction:{intersect:!1,mode:`index`},plugins:{legend:{display:!1},tooltip:{backgroundColor:`rgba(15, 23, 42, 0.9)`,titleFont:{family:`Inter`,size:13},bodyFont:{family:`Inter`,size:12},padding:12,cornerRadius:10,displayColors:!0}},scales:{y:{beginAtZero:!0,grid:{color:`rgba(0,0,0,0.04)`},ticks:{font:{family:`Inter`,size:11},stepSize:1}},x:{grid:{display:!1},ticks:{font:{family:`Inter`,size:11}}}}}})}).catch(e=>{console.error(`Chart.js failed to load:`,e)})}var G={admin:`Administrator`,pedagog:`Pedagog`,mehmon:`Mehmon`},K={admin:`bg-violet-100 text-violet-700`,pedagog:`bg-primary-100 text-primary-700`,mehmon:`bg-dark-100 text-dark-600`};async function q(){let e=[];try{e=(await u.get(`/users`)).data||[]}catch(e){console.error(`Fetch users error:`,e),o(`Foydalanuvchilar ro'yxatini yuklab bo'lmadi.`,`error`)}return`
    <div class="flex min-h-screen bg-dark-50">
      ${f()}
      <main class="flex-1 lg:ml-64 p-6 lg:p-8">
        ${m(`Foydalanuvchilar`,`Tizim foydalanuvchilarini boshqaring`)}

        <!-- Stats -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
          <div class="stat-card">
            <p class="text-dark-400 text-sm">Jami foydalanuvchilar</p>
            <p class="text-3xl font-bold text-dark-800 mt-2" id="total-users-count">${e.length}</p>
          </div>
          <div class="stat-card">
            <p class="text-dark-400 text-sm">Pedagoglar</p>
            <p class="text-3xl font-bold text-primary-600 mt-2" id="pedagog-users-count">${e.filter(e=>e.role===`pedagog`).length}</p>
          </div>
          <div class="stat-card">
            <p class="text-dark-400 text-sm">Adminlar</p>
            <p class="text-3xl font-bold text-violet-600 mt-2" id="admin-users-count">${e.filter(e=>e.role===`admin`).length}</p>
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
              ${e.length===0?`
              <tr>
                <td colspan="7" class="text-center py-8 text-dark-400 font-medium">Foydalanuvchilar topilmadi</td>
              </tr>
              `:e.map(e=>J(e)).join(``)}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  `}function J(e){let t=i.getUser()?.id===e.id;return`
    <tr class="border-t border-dark-100 hover:bg-primary-50/50 transition-colors">
      <td class="px-6 py-4">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-xs font-semibold">${i.getInitials(e.full_name)}</div>
          <span class="font-medium text-dark-800">${e.full_name} ${t?`<span class="text-xs text-primary-500 font-normal ml-1">(O'zingiz)</span>`:``}</span>
        </div>
      </td>
      <td class="px-6 py-4 text-dark-500">${e.email}</td>
      <td class="px-6 py-4"><span class="badge ${K[e.role]}">${G[e.role]}</span></td>
      <td class="px-6 py-4 text-dark-600">${e.subject||`—`}</td>
      <td class="px-6 py-4 text-dark-500">${e.phone||`—`}</td>
      <td class="px-6 py-4">
        <span class="flex items-center gap-1.5">
          <span class="${e.is_active?`status-online`:`status-offline`}"></span>
          <span class="text-sm ${e.is_active?`text-accent-600`:`text-red-500`}">${e.is_active?`Faol`:`Bloklangan`}</span>
        </span>
      </td>
      <td class="px-6 py-4">
        <div class="flex items-center gap-1">
          <button class="p-1.5 hover:bg-primary-50 rounded-lg transition-colors edit-user-btn" 
            data-id="${e.id}" 
            data-fullname="${e.full_name}" 
            data-email="${e.email}" 
            data-role="${e.role}" 
            data-subject="${e.subject||``}" 
            data-phone="${e.phone||``}"
            data-active="${e.is_active}"
            title="Tahrirlash">
            <svg class="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
          </button>
          ${t?``:`
          <button class="p-1.5 hover:bg-red-50 rounded-lg transition-colors delete-user-btn" data-id="${e.id}" title="O'chirish">
            <svg class="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>`}
        </div>
      </td>
    </tr>`}async function Y(){let e=document.getElementById(`user-search`)?.value||``,t=document.getElementById(`users-table-body`);if(t)try{let n=(await u.get(`/users?search=${encodeURIComponent(e)}`)).data||[];n.length===0?t.innerHTML=`
        <tr>
          <td colspan="7" class="text-center py-8 text-dark-400 font-medium">Foydalanuvchilar topilmadi</td>
        </tr>`:t.innerHTML=n.map(e=>J(e)).join(``);let r=document.getElementById(`total-users-count`),i=document.getElementById(`pedagog-users-count`),a=document.getElementById(`admin-users-count`);r&&(r.textContent=n.length),i&&(i.textContent=n.filter(e=>e.role===`pedagog`).length),a&&(a.textContent=n.filter(e=>e.role===`admin`).length)}catch(e){console.error(`Table reload error:`,e)}}function X(){p(),document.getElementById(`user-search`)?.addEventListener(`input`,Y),document.getElementById(`add-user-btn`)?.addEventListener(`click`,()=>{T(`Yangi foydalanuvchi yaratish`,`
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
    `,{confirmText:`Saqlash`,onConfirm:async e=>{let t=document.getElementById(`user-fullname`)?.value.trim(),n=document.getElementById(`user-email`)?.value.trim(),r=document.getElementById(`user-password`)?.value,i=document.getElementById(`user-role`)?.value,a=document.getElementById(`user-subject`)?.value.trim(),s=document.getElementById(`user-phone`)?.value.trim();if(!t||!n||!r||!i){o(`Barcha majburiy maydonlarni to'ldiring`,`warning`);return}let c=document.querySelector(`.modal-confirm-btn`);c&&(c.disabled=!0,c.textContent=`Saqlanmoqda...`);try{await u.post(`/users`,{full_name:t,email:n,password:r,role:i,subject:i===`pedagog`?a:null,phone:s}),o(`Foydalanuvchi muvaffaqiyatli yaratildi!`,`success`),e(),Y()}catch(e){o(e.message||`Xatolik yuz berdi`,`error`),c&&(c.disabled=!1,c.textContent=`Saqlash`)}}})});let e=document.getElementById(`users-table-body`);e&&e.addEventListener(`click`,async e=>{let t=e.target.closest(`.delete-user-btn`),n=e.target.closest(`.edit-user-btn`);if(t){let e=t.dataset.id;if(confirm(`Ushbu foydalanuvchini tizimdan butunlay o'chirib tashlamoqchimisiz?`))try{await u.delete(`/users/${e}`),o(`Foydalanuvchi muvaffaqiyatli o'chirildi`,`success`),Y()}catch(e){o(e.message||`O'chirishda xatolik yuz berdi`,`error`)}}if(n){let{id:e,fullname:t,email:r,role:i,subject:a,phone:s,active:c}=n.dataset,l=c===`true`;T(`Foydalanuvchini tahrirlash`,`
          <form class="space-y-4" id="edit-user-form">
            <div>
              <label class="input-label">To'liq ism</label>
              <input type="text" class="input" id="edit-fullname" value="${t}" required />
            </div>
            <div>
              <label class="input-label">Email</label>
              <input type="email" class="input" id="edit-email" value="${r}" required />
            </div>
            <div>
              <label class="input-label">Yangi parol (o'zgartirmaslik uchun bo'sh qoldiring)</label>
              <input type="password" class="input" id="edit-password" placeholder="Yangi parol..." />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="input-label">Rol</label>
                <select class="input" id="edit-role">
                  <option value="pedagog" ${i===`pedagog`?`selected`:``}>Pedagog</option>
                  <option value="admin" ${i===`admin`?`selected`:``}>Admin</option>
                  <option value="mehmon" ${i===`mehmon`?`selected`:``}>Mehmon</option>
                </select>
              </div>
              <div>
                <label class="input-label">Fan</label>
                <input type="text" class="input" id="edit-subject" value="${a}" placeholder="Masalan: Matematika" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="input-label">Telefon</label>
                <input type="tel" class="input" id="edit-phone" value="${s}" placeholder="+998901234567" />
              </div>
              <div>
                <label class="input-label">Holat</label>
                <select class="input" id="edit-active">
                  <option value="true" ${l?`selected`:``}>Faol</option>
                  <option value="false" ${l?``:`selected`}>Bloklangan</option>
                </select>
              </div>
            </div>
          </form>
        `,{confirmText:`Yangilash`,onConfirm:async t=>{let n=document.getElementById(`edit-fullname`)?.value.trim(),r=document.getElementById(`edit-email`)?.value.trim(),i=document.getElementById(`edit-password`)?.value,a=document.getElementById(`edit-role`)?.value,s=document.getElementById(`edit-subject`)?.value.trim(),c=document.getElementById(`edit-phone`)?.value.trim(),l=document.getElementById(`edit-active`)?.value===`true`;if(!n||!r||!a){o(`Ism, email va rol majburiy`,`warning`);return}let d=document.querySelector(`.modal-confirm-btn`);d&&(d.disabled=!0,d.textContent=`Yangilanmoqda...`);try{let d={full_name:n,email:r,role:a,subject:a===`pedagog`?s:null,phone:c,is_active:l};i&&(d.password=i),await u.put(`/users/${e}`,d),o(`Foydalanuvchi muvaffaqiyatli yangilandi!`,`success`),t(),Y()}catch(e){o(e.message||`Yangilashda xatolik yuz berdi`,`error`),d&&(d.disabled=!1,d.textContent=`Yangilash`)}}})}})}function Z(){let e=i.getUser();return`
    <div class="flex min-h-screen bg-dark-50">
      ${f()}
      <main class="flex-1 lg:ml-64 p-6 lg:p-8">
        ${m(`Profil`,`Shaxsiy ma'lumotlaringizni boshqaring`)}

        <div class="max-w-3xl">
          <!-- Profile Header -->
          <div class="glass-card p-8 mb-6 bg-gradient-to-r from-primary-500/5 to-accent-500/5">
            <div class="flex flex-col sm:flex-row items-center gap-6">
              <div class="relative">
                <div class="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-3xl font-bold shadow-xl">
                  ${i.getInitials(e?.full_name)}
                </div>
              </div>
              <div class="text-center sm:text-left">
                <h2 class="text-2xl font-bold text-dark-800" id="profile-display-name">${e?.full_name||``}</h2>
                <p class="text-dark-500 mt-1" id="profile-display-subject">${e?.subject?e.subject+` o'qituvchisi`:{admin:`Administrator`,pedagog:`Pedagog`,mehmon:`Mehmon`}[e?.role]||``}</p>
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
                  <input type="text" class="input" id="profile-fullname" value="${e?.full_name||``}" required />
                </div>
                <div>
                  <label class="input-label">Email</label>
                  <input type="email" class="input" id="profile-email" value="${e?.email||``}" required />
                </div>
                <div>
                  <label class="input-label">Telefon</label>
                  <input type="tel" class="input" id="profile-phone" value="${e?.phone||``}" placeholder="+998XXXXXXXXX" />
                </div>
                <div>
                  <label class="input-label">Fan</label>
                  <input type="text" class="input" id="profile-subject" value="${e?.subject||``}" placeholder="Fan nomi" ${e?.role===`pedagog`?``:`disabled`} />
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
  `}function Q(){p();let e=i.getUser();e&&(document.getElementById(`profile-form`)?.addEventListener(`submit`,async t=>{t.preventDefault();let n=document.getElementById(`profile-fullname`)?.value.trim(),r=document.getElementById(`profile-email`)?.value.trim(),i=document.getElementById(`profile-phone`)?.value.trim(),a=document.getElementById(`profile-subject`)?.value.trim();if(!n||!r){o(`Ism va Email bo'sh bo'lishi mumkin emas.`,`warning`);return}let s=document.getElementById(`profile-submit-btn`);s&&(s.disabled=!0,s.textContent=`Saqlanmoqda...`);try{let t=await u.put(`/users/${e.id}`,{full_name:n,email:r,phone:i||null,subject:e.role===`pedagog`&&a||null});localStorage.setItem(`ep_user`,JSON.stringify(t.user));let s=document.getElementById(`profile-display-name`),c=document.getElementById(`profile-display-subject`);s&&(s.textContent=t.user.full_name),c&&(c.textContent=t.user.role===`pedagog`&&t.user.subject?`${t.user.subject} o'qituvchisi`:t.user.role===`admin`?`Administrator`:`Mehmon`),o(`Ma'lumotlaringiz muvaffaqiyatli saqlandi!`,`success`)}catch(e){o(e.message||`Xatolik yuz berdi`,`error`)}finally{s&&(s.disabled=!1,s.textContent=`Saqlash`)}}),document.getElementById(`password-form`)?.addEventListener(`submit`,async t=>{t.preventDefault();let n=document.getElementById(`profile-new-password`)?.value,r=document.getElementById(`profile-confirm-password`)?.value;if(!n||n.length<6){o(`Yangi parol kamida 6 ta belgidan iborat bo'lishi kerak.`,`warning`);return}if(n!==r){o(`Yangi parollar bir-biriga mos kelmadi.`,`warning`);return}let i=document.getElementById(`password-submit-btn`);i&&(i.disabled=!0,i.textContent=`Yangilanmoqda...`);try{await u.put(`/users/${e.id}`,{password:n}),o(`Parolingiz muvaffaqiyatli o'zgartirildi!`,`success`);let t=document.getElementById(`profile-new-password`),r=document.getElementById(`profile-confirm-password`);t&&(t.value=``),r&&(r.value=``)}catch(e){o(e.message||`Xatolik yuz berdi`,`error`)}finally{i&&(i.disabled=!1,i.textContent=`Parolni yangilash`)}}))}e.guard(async(t,n)=>{let r=[`login`].includes(t),a=i.isAuthenticated();return!r&&!a?(e.navigate(`login`),!1):r&&a||n.roles&&!i.hasRole(...n.roles)?(e.navigate(`dashboard`),!1):!0}),e.on(`login`,s),e.on(`dashboard`,S,{roles:[`admin`,`pedagog`,`mehmon`]}),e.on(`documents`,A,{roles:[`admin`,`pedagog`,`mehmon`]}),e.on(`portfolio`,I,{roles:[`admin`,`pedagog`]}),e.on(`monitoring`,H,{roles:[`admin`]}),e.on(`users`,q,{roles:[`admin`]}),e.on(`profile`,Z,{roles:[`admin`,`pedagog`,`mehmon`]}),window.addEventListener(`route:loaded`,e=>{let{path:t}=e.detail,n={login:c,dashboard:C,documents:N,portfolio:z,monitoring:U,users:X,profile:Q};n[t]&&setTimeout(()=>n[t](),0)}),document.addEventListener(`click`,e=>{let t=document.getElementById(`sidebar`),n=document.getElementById(`mobile-menu-toggle`);t&&!t.contains(e.target)&&n&&!n.contains(e.target)&&window.innerWidth<1024&&t.classList.add(`-translate-x-full`)}),console.log(`🎓 E-PEDAGOG tizimi ishga tushdi`);