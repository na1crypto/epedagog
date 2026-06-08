/**
 * Auth utility for managing JWT tokens and user session
 */

const TOKEN_KEY = 'ep_token';
const REFRESH_KEY = 'ep_refresh';
const USER_KEY = 'ep_user';

export const auth = {
  /**
   * Login with email and password
   */
  async login(email, password) {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Ulanishda xatolik yuz berdi' }));
      throw new Error(errorData.error || 'Email yoki parol noto\'g\'ri');
    }

    const data = await response.json();

    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(REFRESH_KEY, data.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));

    return data.user;
  },

  /**
   * Logout
   */
  async logout() {
    const token = this.getToken();
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
      } catch (err) {
        console.warn('Logout API call failed:', err);
      }
    }
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    const token = localStorage.getItem(TOKEN_KEY);
    return !!token;
  },

  /**
   * Get current user
   */
  getUser() {
    try {
      const userStr = localStorage.getItem(USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  /**
   * Get user role
   */
  getRole() {
    const user = this.getUser();
    return user ? user.role : null;
  },

  /**
   * Check if user has a specific role
   */
  hasRole(...roles) {
    const userRole = this.getRole();
    return roles.includes(userRole);
  },

  /**
   * Get token
   */
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Get user initials for avatar
   */
  getInitials(name) {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
};
