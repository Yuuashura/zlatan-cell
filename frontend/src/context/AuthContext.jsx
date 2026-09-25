import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCsrfToken = useCallback(async () => {
    try {
      await api.get('/auth/csrf');
    } catch (err) {
      console.warn('Failed to fetch CSRF token:', err);
    }
  }, []);

  const fetchCurrentUser = useCallback(async (retryCount = 0) => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
      return res.data;
    } catch (err) {
      if (retryCount > 0) {
        await new Promise((resolve) => setTimeout(resolve, 600));
        return fetchCurrentUser(retryCount - 1);
      }
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Cek apakah baru saja redirect dari Google OAuth2 (?oauth_success=true)
    const urlParams = new URLSearchParams(window.location.search);
    const hasOAuthSuccess = urlParams.get('oauth_success') === 'true';

    const initAuth = async () => {
      // Fetch CSRF token first to ensure cookie is set
      await fetchCsrfToken();
      
      if (hasOAuthSuccess) {
        // Hapus query param dari URL agar bersih tanpa reload
        const urlParams = new URLSearchParams(window.location.search);
        urlParams.delete('oauth_success');
        const newSearch = urlParams.toString();
        const newUrl = window.location.pathname + (newSearch ? `?${newSearch}` : '') + window.location.hash;
        window.history.replaceState({}, document.title, newUrl);
      }
      
      // Ambil data user dengan retry jika cookie sedang sinkronisasi
      await fetchCurrentUser(hasOAuthSuccess ? 2 : 0);
    };

    initAuth();
  }, [fetchCurrentUser, fetchCsrfToken]);

  const login = async (username, password) => {
    await fetchCsrfToken();
    const res = await api.post('/auth/login', { username, password });
    await fetchCurrentUser(0);
    return res.data;
  };

  const register = async (userData) => {
    await fetchCsrfToken();
    const res = await api.post('/auth/register', userData);
    return res.data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setUser(null);
    }
  };

  const refreshUser = () => {
    return fetchCurrentUser(1);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}