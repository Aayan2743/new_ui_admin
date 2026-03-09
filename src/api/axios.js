import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// REQUEST → attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// RESPONSE → handle 401 & 422 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const token = localStorage.getItem("token");

    // 🔥 Redirect ONLY if token exists (session expired case)
    if (status === 401 && token) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      alert("Session expired. Please login again.");
      window.location.href = "/login";
    }

    if (status === 422) {
      alert(error.response.data.message);
    }

    return Promise.reject(error);
  },
);

export default api;
