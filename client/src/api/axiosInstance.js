import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4500/admin',
});

api.interceptors.request.use((config) => {
  if (config.url.includes('/login')) return config;

  const userData = JSON.parse(localStorage.getItem('user')) || {};
  const userId = userData.id;

  const accessToken = userId
    ? localStorage.getItem(`accessToken_${userId}`)
    : null;

  if (accessToken) {
    config.headers['Authorization'] = `Bearer ${accessToken}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const userData = JSON.parse(localStorage.getItem('user')) || {};
      const userId = userData.id;

      localStorage.removeItem(`accessToken_${userId}`);
      localStorage.removeItem(`user_${userId}`);
      localStorage.removeItem(`isLoggedIn_${userId}`);
      localStorage.removeItem(`lastActivityUpdate_${userId}`);

      localStorage.clear();
      window.location.href = '/admin/login';
    }

    return Promise.reject(error);
  }
);

export default api;
