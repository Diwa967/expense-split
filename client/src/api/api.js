

import axios from "axios";

export const backendUrl =
  import.meta.env.VITE_BACKEND_URL || "https://expense-split-nlrm.onrender.com";

const api = axios.create({
  baseURL: backendUrl,
  withCredentials: true,
});

// ✅ Attach token to EVERY request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
