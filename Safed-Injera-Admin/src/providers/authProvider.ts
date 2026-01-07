import { AuthProvider } from 'react-admin';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
    return localStorage.getItem('token') ? Promise.resolve() : Promise.reject();
  },

  getPermissions: () => {
    const user = localStorage.getItem('user');
    if (user) {
      const { role } = JSON.parse(user);
      return Promise.resolve(role);
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


