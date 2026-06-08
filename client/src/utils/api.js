/**
 * API utility - Fetch wrapper with JWT interceptor
 * Will be connected to real backend later
 */

import { auth } from './auth.js';
import { router } from './router.js';

const BASE_URL = '/api';

class ApiClient {
  constructor() {
    this.baseUrl = BASE_URL;
  }

  /**
   * Make an API request
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const token = auth.getToken();

    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (response.status === 401) {
        auth.logout();
        router.navigate('login');
        throw new Error('Sessiya muddati tugadi. Qaytadan kiring.');
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Server xatoligi' }));
        throw new Error(error.message);
      }

      return await response.json();
    } catch (error) {
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        throw new Error('Serverga ulanib bo\'lmadi. Internet aloqasini tekshiring.');
      }
      throw error;
    }
  }

  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  /**
   * Upload file
   */
  async upload(endpoint, formData) {
    const token = auth.getToken();
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Fayl yuklashda xatolik');
    }

    return await response.json();
  }
}

export const api = new ApiClient();
