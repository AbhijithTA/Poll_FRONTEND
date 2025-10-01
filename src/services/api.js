import axios from "axios";

const API_BASE_URL = "http://localhost:3000";

const api = axios.create({
  baseURL: API_BASE_URL
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Do not clear local storage here; allow route guards to handle state
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
  getAll: () => api.get("/polls"),
  getAdminPolls: () => api.get("/polls/admin"),
  getById: (id) => api.get(`/polls/${id}`),
  vote: (id, optionIndex) => api.post(`/polls/${id}/vote`, { optionIndex }),
  getResults: (id) => api.get(`/polls/${id}/results`),
  update: (id, data) => api.put(`/polls/${id}`, data),
  delete: (id) => api.delete(`/polls/${id}`),
  getUserVotes: () => api.get("/polls/user/votes")
};

export default api;
