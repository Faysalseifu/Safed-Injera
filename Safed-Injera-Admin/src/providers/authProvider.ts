import { AuthProvider } from 'react-admin';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const isJwtExpired = (token: string): boolean => {
  try {
    const payloadBase64 = token.split('.')[1];
    if (!payloadBase64) return true;

    const payloadJson = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(payloadJson) as { exp?: number };

    if (!payload.exp) return false;

    const currentEpochSeconds = Math.floor(Date.now() / 1000);
    return payload.exp <= currentEpochSeconds;
  } catch {
    return true;
  }
};

const authProvider: AuthProvider = {
  login: async ({ username, password }) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        let errorMessage = 'Login failed';
        try {
          const error = await response.json();
          errorMessage = error.message || errorMessage;
        } catch (e) {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      if (!data.token || !data.id) {
        throw new Error('Invalid response from server');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({
        id: data.id,
        username: data.username,
        email: data.email,
        role: data.role,
        branchId: data.branchId ?? null,
      }));
    } catch (error: any) {
      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please check if the backend is running.');
      }
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return Promise.resolve();
  },

  checkError: ({ status }) => {
    if (status === 401 || status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return Promise.reject();
    }
    return Promise.resolve();
  },

  checkAuth: () => {
    const token = localStorage.getItem('token');
    if (!token) return Promise.reject();

    if (isJwtExpired(token)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return Promise.reject();
    }

    return Promise.resolve();
  },

  getPermissions: () => {
    const user = localStorage.getItem('user');
    if (user) {
      const { role, branchId } = JSON.parse(user);
      return Promise.resolve({ role, branchId });
    }
    return Promise.reject();
  },

  getIdentity: () => {
    const user = localStorage.getItem('user');
    if (user) {
      const { id, username } = JSON.parse(user);
      return Promise.resolve({ id, fullName: username });
    }
    return Promise.reject();
  },
};

export default authProvider;


