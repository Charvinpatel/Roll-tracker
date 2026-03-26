import axios from 'axios';

const API = axios.create({ baseURL: 'https://roll-tracker.onrender.com/api' });

export const vendorAPI = {
  getAll: () => API.get('/vendors'),
  getOne: (id) => API.get(`/vendors/${id}`),
  create: (data) => API.post('/vendors', data),
  update: (id, data) => API.put(`/vendors/${id}`, data),
  delete: (id) => API.delete(`/vendors/${id}`),
};

export const dispatchAPI = {
  getAll: (vendorId) => API.get('/dispatches', { params: vendorId ? { vendor: vendorId } : {} }),
  create: (data) => API.post('/dispatches', data),
  update: (id, data) => API.put(`/dispatches/${id}`, data),
  delete: (id) => API.delete(`/dispatches/${id}`),
};

export const returnAPI = {
  getAll: (vendorId) => API.get('/returns', { params: vendorId ? { vendor: vendorId } : {} }),
  create: (data) => API.post('/returns', data),
  update: (id, data) => API.put(`/returns/${id}`, data),
  delete: (id) => API.delete(`/returns/${id}`),
};

export const inventoryAPI = {
  getSummary: () => API.get('/inventory/summary'),
  getStock: () => API.get('/inventory'),
  setStock: (data) => API.post('/inventory', data),
};
