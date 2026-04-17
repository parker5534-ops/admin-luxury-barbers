const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function getToken() { return localStorage.getItem('lbc_admin_token'); }

async function req(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`);
  return data;
}

async function upload(path, file) {
  const token = getToken();
  const fd = new FormData();
  fd.append('image', file);
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: fd,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Upload failed');
  return data;
}

// Auth
export const login = (email, password) => req('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
export const getMe = () => req('/api/auth/me');
export const changePassword = (currentPassword, newPassword) => req('/api/auth/change-password', { method: 'POST', body: JSON.stringify({ currentPassword, newPassword }) });

// Settings
export const getSettings = () => req('/api/settings');
export const saveSettings = (data) => req('/api/settings', { method: 'PUT', body: JSON.stringify(data) });

// Services
export const getServices = () => req('/api/services/all');
export const createService = (data) => req('/api/services', { method: 'POST', body: JSON.stringify(data) });
export const updateService = (id, data) => req(`/api/services/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteService = (id) => req(`/api/services/${id}`, { method: 'DELETE' });

// Gallery
export const getGallery = () => req('/api/gallery/all');
export const uploadGalleryImage = (file) => upload('/api/uploads/gallery', file);
export const createGalleryImage = (data) => req('/api/gallery', { method: 'POST', body: JSON.stringify(data) });
export const updateGalleryImage = (id, data) => req(`/api/gallery/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteGalleryImage = (id) => req(`/api/gallery/${id}`, { method: 'DELETE' });

// Barbers
export const getBarbers = () => req('/api/barbers/all');
export const uploadBarberPhoto = (file) => upload('/api/uploads/barber', file);
export const createBarber = (data) => req('/api/barbers', { method: 'POST', body: JSON.stringify(data) });
export const updateBarber = (id, data) => req(`/api/barbers/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteBarber = (id) => req(`/api/barbers/${id}`, { method: 'DELETE' });

// Testimonials
export const getTestimonials = () => req('/api/testimonials/all');
export const createTestimonial = (data) => req('/api/testimonials', { method: 'POST', body: JSON.stringify(data) });
export const updateTestimonial = (id, data) => req(`/api/testimonials/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteTestimonial = (id) => req(`/api/testimonials/${id}`, { method: 'DELETE' });

// FAQs
export const getFaqs = () => req('/api/faqs/all');
export const createFaq = (data) => req('/api/faqs', { method: 'POST', body: JSON.stringify(data) });
export const updateFaq = (id, data) => req(`/api/faqs/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteFaq = (id) => req(`/api/faqs/${id}`, { method: 'DELETE' });

// Leads
export const getLeads = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return req(`/api/leads?${qs}`);
};
export const updateLead = (id, data) => req(`/api/leads/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteLead = (id) => req(`/api/leads/${id}`, { method: 'DELETE' });

// Analytics
export const getAnalytics = (days = 30) => req(`/api/analytics/overview?days=${days}`);
