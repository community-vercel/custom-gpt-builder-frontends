import axios from 'axios';
import { store } from '../store';
import { setCredentials, clearCredentials } from '../store/authSlice';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});
  

api.interceptors.request.use((config) => {
  const token = store.getState().auth.token;
  console.log('Tokens:', token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.error('Unauthorized: Token may be invalid or expired');
      const refreshToken = store.getState().auth.refreshToken;
      if (refreshToken) {
        try {
          const response = await axios.post('http://localhost:5000/api/auth/refresh', {
            refreshToken,
          });
          const newToken = response.data.token;
          store.dispatch(setCredentials({ token: newToken, user: store.getState().auth.user }));
          error.config.headers.Authorization = `Bearer ${newToken}`;
          return api(error.config); // Retry original request
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          store.dispatch(clearCredentials());
        //   window.location.href = '/login';
        }
      } else {
        store.dispatch(clearCredentials());
        // window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;