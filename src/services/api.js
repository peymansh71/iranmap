import axios from "axios";

const API_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: async (username, password) => {
    const response = await api.post("/auth/login", { username, password });
    return response.data;
  },
  register: async (username, password) => {
    const response = await api.post("/auth/register", { username, password });
    return response.data;
  },
  getCurrentUser: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },
};

// Provinces API
export const provincesAPI = {
  getAll: async () => {
    const response = await api.get("/provinces");
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/provinces/${id}`);
    return response.data;
  },
  createOrUpdate: async (provinceData) => {
    const response = await api.post("/provinces", provinceData);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/provinces/${id}`);
    return response.data;
  },
};

// Indexes API
export const indexesAPI = {
  getAll: async () => {
    const response = await api.get("/indexes");
    return response.data;
  },
  create: async (indexData) => {
    const response = await api.post("/indexes", indexData);
    return response.data;
  },
  update: async (id, indexData) => {
    const response = await api.put(`/indexes/${id}`, indexData);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/indexes/${id}`);
    return response.data;
  },
};

export default api;
