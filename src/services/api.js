import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL
});

// Token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (userData) => api.post("/auth/register", userData),
  login: (credentials) => api.post("/auth/login", credentials),
  logout: () => api.post("/auth/logout"),
  searchUsers: (query) =>
    api.get(`/auth/search-users?q=${encodeURIComponent(query)}`)
};

export const pollsAPI = {
  create: (pollData) => api.post("/polls", pollData),
  getAll: (page = 1, limit = 10) =>
    api.get(`/polls?page=${page}&limit=${limit}`),
  getAdminPolls: () => api.get("/polls/admin"),
  getById: (id) => api.get(`/polls/${id}`),
  vote: (id, optionIndex) => api.post(`/polls/${id}/vote`, { optionIndex }),
  getResults: (id) => api.get(`/polls/${id}/results`),
  update: (id, data) => api.put(`/polls/${id}`, data),
  delete: (id) => api.delete(`/polls/${id}`),
  getUserVotes: () => api.get("/polls/user/votes")
};

export default api;
