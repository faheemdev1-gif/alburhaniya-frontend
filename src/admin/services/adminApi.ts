import api from '../../services/api';

// ── Articles ─────────────────────────────────────────────────────
export const adminArticles = {
  list: (params?: Record<string, unknown>) =>
    api.get('/articles', { params: { published: 'all', limit: 50, ...params } }),
  get: (id: string) => api.get(`/articles/${id}`),
  create: (data: unknown) => api.post('/articles', data),
  update: (id: string, data: unknown) => api.put(`/articles/${id}`, data),
  delete: (id: string) => api.delete(`/articles/${id}`),
};

// ── Events ───────────────────────────────────────────────────────
export const adminEvents = {
  list: (params?: Record<string, unknown>) =>
    api.get('/events', { params: { limit: 50, ...params } }),
  get: (id: string) => api.get(`/events/${id}`),
  create: (data: unknown) => api.post('/events', data),
  update: (id: string, data: unknown) => api.put(`/events/${id}`, data),
  delete: (id: string) => api.delete(`/events/${id}`),
};

// ── Gallery ──────────────────────────────────────────────────────
export const adminGallery = {
  list: () => api.get('/gallery'),
  create: (data: FormData) =>
    api.post('/gallery', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: string, data: unknown) => api.put(`/gallery/${id}`, data),
  delete: (id: string) => api.delete(`/gallery/${id}`),
};

// ── Users (admin only) ───────────────────────────────────────────
export const adminUsers = {
  list: () => api.get('/users'),
  create: (data: unknown) => api.post('/users', data),
  update: (id: string, data: unknown) => api.put(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
};