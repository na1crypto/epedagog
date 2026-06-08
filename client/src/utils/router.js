/**
 * Hash-based SPA Router for E-PEDAGOG
 */

class Router {
  constructor() {
    this.routes = {};
    this.currentRoute = null;
    this.beforeEach = null;
    
    window.addEventListener('hashchange', () => this.handleRoute());
    window.addEventListener('load', () => this.handleRoute());
  }

  /**
   * Register a route
   * @param {string} path - Route path (e.g., 'dashboard', 'documents')
   * @param {Function} handler - Async function that returns HTML string
   * @param {Object} options - Route options (requiresAuth, roles)
   */
  on(path, handler, options = {}) {
    this.routes[path] = { handler, options };
    return this;
  }

  /**
   * Set a guard function that runs before each route
   * @param {Function} guard - Returns true to allow, false to block
   */
  guard(guardFn) {
    this.beforeEach = guardFn;
    return this;
  }

  /**
   * Navigate to a path
   * @param {string} path 
   */
  navigate(path) {
    window.location.hash = `#/${path}`;
  }

  /**
   * Get current path from hash
   */
  getPath() {
    const hash = window.location.hash.slice(2) || 'login';
    return hash.split('?')[0];
  }

  /**
   * Get query parameters from hash
   */
  getParams() {
    const hash = window.location.hash.slice(2) || '';
    const queryString = hash.split('?')[1] || '';
    return Object.fromEntries(new URLSearchParams(queryString));
  }

  /**
   * Handle route change
   */
  async handleRoute() {
    const path = this.getPath();
    const route = this.routes[path];

    if (!route) {
      // 404 - redirect to dashboard or login
      const token = localStorage.getItem('ep_token');
      this.navigate(token ? 'dashboard' : 'login');
      return;
    }

    // Run guard
    if (this.beforeEach) {
      const canProceed = await this.beforeEach(path, route.options);
      if (!canProceed) return;
    }

    // Execute route handler
    const app = document.getElementById('app');
    if (app) {
      try {
        app.classList.remove('page-enter');
        void app.offsetWidth; // Trigger reflow
        app.classList.add('page-enter');
        
        const content = await route.handler(this.getParams());
        app.innerHTML = content;
        
        // Dispatch custom event for page-specific init
        window.dispatchEvent(new CustomEvent('route:loaded', { 
          detail: { path, params: this.getParams() } 
        }));
        
        this.currentRoute = path;
      } catch (error) {
        console.error('Route error:', error);
        app.innerHTML = `
          <div class="flex items-center justify-center min-h-screen">
            <div class="text-center">
              <h2 class="text-2xl font-bold text-dark-800 mb-2">Xatolik yuz berdi</h2>
              <p class="text-dark-500">${error.message}</p>
            </div>
          </div>
        `;
      }
    }
  }
}

// Singleton instance
export const router = new Router();
