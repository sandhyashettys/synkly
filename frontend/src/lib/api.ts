import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor — attach JWT
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('synkly_token');
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('synkly_refresh_token');
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_URL}/auth/refresh-token`, { refreshToken });
          localStorage.setItem('synkly_token', data.token);
          originalRequest.headers.Authorization = `Bearer ${data.token}`;
          return api(originalRequest);
        } catch (_) {
          localStorage.removeItem('synkly_token');
          localStorage.removeItem('synkly_refresh_token');
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login';
          }
        }
      } else {
        localStorage.removeItem('synkly_token');
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

// ── Typed API helpers
export const authApi = {
  register:       (data: any)    => api.post('/auth/register', data),
  login:          (data: any)    => api.post('/auth/login', data),
  me:             ()             => api.get('/auth/me'),
  logout:         ()             => api.post('/auth/logout'),
  forgotPassword: (email: string)=> api.post('/auth/forgot-password', { email }),
  resetPassword:  (token: string, password: string) => api.put(`/auth/reset-password/${token}`, { password }),
  updatePassword: (data: any)    => api.put('/auth/update-password', data),
};

export const usersApi = {
  list:   (params?: any) => api.get('/users', { params }),
  get:    (id: string)   => api.get(`/users/${id}`),
  create: (data: any)    => api.post('/users', data),
  update: (id: string, data: any) => api.put(`/users/${id}`, data),
  delete: (id: string)   => api.delete(`/users/${id}`),
};

export const modulesApi = {
  list:   (params?: any) => api.get('/modules', { params }),
  get:    (slug: string) => api.get(`/modules/${slug}`),
  create: (data: any)    => api.post('/modules', data),
  update: (id: string, data: any) => api.put(`/modules/${id}`, data),
  delete: (id: string)   => api.delete(`/modules/${id}`),
};

export const pricingApi = {
  list:   ()             => api.get('/pricing'),
  get:    (id: string)   => api.get(`/pricing/${id}`),
  create: (data: any)    => api.post('/pricing', data),
  update: (id: string, data: any) => api.put(`/pricing/${id}`, data),
  delete: (id: string)   => api.delete(`/pricing/${id}`),
};

export const blogApi = {
  list:       (params?: any) => api.get('/blog', { params }),
  categories: ()             => api.get('/blog/categories'),
  get:        (slug: string) => api.get(`/blog/${slug}`),
  create:     (data: any)    => api.post('/blog', data),
  update:     (id: string, data: any) => api.put(`/blog/${id}`, data),
  delete:     (id: string)   => api.delete(`/blog/${id}`),
};

export const contactApi = {
  submit: (data: any)  => api.post('/contact', data),
  list:   (params?: any)=> api.get('/contact', { params }),
  update: (id: string, data: any) => api.put(`/contact/${id}`, data),
  delete: (id: string) => api.delete(`/contact/${id}`),
};

export const settingsApi = {
  get:    ()             => api.get('/settings'),
  getAll: ()             => api.get('/settings/all'),
  update: (data: any)    => api.put('/settings', data),
};

export const adminApi = {
  stats:     ()             => api.get('/admin/stats'),
  companies: (params?: any) => api.get('/admin/companies', { params }),
  auditLogs: (params?: any) => api.get('/admin/audit-logs', { params }),
};

export const clientApi = {
  dashboard: ()             => api.get('/client/dashboard'),
  records:   {
    list:   (module: string, params?: any) => api.get(`/client/records/${module}`, { params }),
    create: (module: string, data: any)    => api.post(`/client/records/${module}`, data),
    update: (module: string, id: string, data: any) => api.put(`/client/records/${module}/${id}`, data),
    delete: (module: string, id: string)   => api.delete(`/client/records/${module}/${id}`),
  },
  company: {
    get:    ()          => api.get('/client/company'),
    update: (data: any) => api.put('/client/company', data),
  },
  reports: (module: string, params?: any) => api.get(`/client/reports/${module}`, { params }),
};

export default api;
