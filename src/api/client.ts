import axios, { AxiosInstance } from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api/proxy";

export const client: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    Accept: "application/xml",
    "Content-Type": "application/xml",
    "ngrok-skip-browser-warning": "true",
  },
});

// Attach JWT on every request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401 — clear storage and redirect to login
client.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default client;
