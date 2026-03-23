import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:8000",
  timeout: 10000,
  headers: {},
  withCredentials: true,
});

// Request Interceptor: Add Authorization header
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Token Refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes("/api/auth/login")) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        // Attempt to refresh token
        const res = await axios.post("http://localhost:8000/api/auth/refresh", { refreshToken });

        if (res.data.success) {
          const { token: newToken, refreshToken: newRefreshToken } = res.data;

          localStorage.setItem("accessToken", newToken);
          localStorage.setItem("refreshToken", newRefreshToken);
          window.dispatchEvent(new Event("auth-sync"));

          // Update the header and retry
          apiClient.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
          originalRequest.headers["Authorization"] = `Bearer ${newToken}`;

          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed - clean up and redirect to login
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        window.dispatchEvent(new Event("auth-sync"));
        window.location.href = "/auth?mode=login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export { apiClient };
