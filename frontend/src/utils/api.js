import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://telehealthpro.onrender.com',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach Auth Header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Token Refresh on 401 Expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const rToken = localStorage.getItem('refreshToken');
        if (rToken) {
          // Attempt to renew access token using refresh token
          const res = await axios.post('https://telehealthpro.onrender.com/auth/refresh-token', { token: rToken });
          if (res.data && res.data.success) {
            const { accessToken, refreshToken } = res.data.tokens;
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return axios(originalRequest);
          }
        }
      } catch (refreshErr) {
        console.error('Refresh token expired or failed:', refreshErr);
        // Clear tokens and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
