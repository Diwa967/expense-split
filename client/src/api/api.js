import axios from "axios";

export const backendUrl =
  import.meta.env.VITE_BACKEND_URL ||
  "https://expense-split-nlrm.onrender.com";

const api = axios.create({
  baseURL: backendUrl,
  withCredentials: true, // ✅ Important for cookies
});

export default api;