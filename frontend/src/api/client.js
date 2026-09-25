import axios from 'axios';

// Helper untuk membaca cookie CSRF dari Spring Security
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = getCookie('XSRF-TOKEN');
  if (token && ['post', 'put', 'delete', 'patch'].includes(config.method?.toLowerCase())) {
    config.headers['X-XSRF-TOKEN'] = token;
  }
  return config;
});

// Interceptor to handle 403 (e.g. CSRF token expired or missing)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response &&
      error.response.status === 403 &&
      !originalRequest._retry &&
      ['post', 'put', 'delete', 'patch'].includes(originalRequest.method?.toLowerCase())
    ) {
      originalRequest._retry = true;
      try {
        // Fetch new CSRF token
        await api.get('/auth/csrf');
        const token = getCookie('XSRF-TOKEN');
        if (token) {
          originalRequest.headers['X-XSRF-TOKEN'] = token;
        }
        return api(originalRequest);
      } catch (e) {
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
