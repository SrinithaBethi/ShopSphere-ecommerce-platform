import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function apiErrorMessage(err) {
  if (err.response?.data?.errors?.length) {
    return err.response.data.errors.map((e) => e.msg).join(', ');
  }
  return err.response?.data?.error || 'Something went wrong. Please try again.';
}

export default api;
