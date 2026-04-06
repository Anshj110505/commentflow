import axios from 'axios';

// Base URL from .env file
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL
});

// Automatically attach token to every request
// So we don't have to manually add it every time
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Auth API calls ─────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

// ── Comments API calls ──────────────────────────────────
export const commentsAPI = {
  getAll: () => api.get('/comments'),
  schedule: (data) => api.post('/comments/schedule', data),
  postNow: (data) => api.post('/comments/post-now', data),
  delete: (id) => api.delete(`/comments/${id}`),
};

// ── AI API calls ────────────────────────────────────────
export const aiAPI = {
  generate: (data) => api.post('/ai/generate', data),
};

// ── Accounts API calls ──────────────────────────────────
export const accountsAPI = {
  getAll: () => api.get('/accounts'),
  add: (data) => api.post('/accounts', data),
  delete: (id) => api.delete(`/accounts/${id}`),
};
export const campaignsAPI = {
  getAll: () => api.get('/campaigns'),
  create: (data) => api.post('/campaigns', data),
  toggle: (id) => api.patch(`/campaigns/${id}/toggle`),
  delete: (id) => api.delete(`/campaigns/${id}`),
  getLogs: () => api.get('/campaigns/logs'),
};
export default api;