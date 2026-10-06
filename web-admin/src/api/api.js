import axios from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";
export const SERVER_BASE_URL =
  import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

// Create Axios Instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach JWT Token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Optional: handle unauthorized access
      console.warn("Unauthorized request or session expired");
    }
    return Promise.reject(error);
  }
);

// Backend Health Check
export const checkBackendHealth = async () => {
  try {
    const res = await axios.get(SERVER_BASE_URL, { timeout: 3000 });
    return { online: true, message: res.data };
  } catch (error) {
    return { online: false, error: error.message };
  }
};

// Auth APIs
export const authApi = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (userData) => api.post("/auth/register", userData),
  getProfile: () => api.get("/auth/profile"),
};

// Songs APIs
export const songsApi = {
  getAll: (params) => api.get("/songs", { params }),
  getById: (id) => api.get(`/songs/${id}`),
  create: (songData) => api.post("/songs", songData),
  update: (id, songData) => api.put(`/songs/${id}`, songData),
  delete: (id) => api.delete(`/songs/${id}`),
};

// Categories APIs
export const categoriesApi = {
  getAll: () => api.get("/categories"),
  getById: (id) => api.get(`/categories/${id}`),
  create: (categoryData) => api.post("/categories", categoryData),
  update: (id, categoryData) => api.put(`/categories/${id}`, categoryData),
  delete: (id) => api.delete(`/categories/${id}`),
};

// Users APIs (Admin only)
export const usersApi = {
  getAll: () => api.get("/auth/users"),
  delete: (id) => api.delete(`/auth/users/${id}`),
  create: (userData) => api.post("/auth/register", userData),
};

export default api;
