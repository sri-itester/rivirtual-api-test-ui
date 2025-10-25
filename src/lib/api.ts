import axios from "axios";

export const lastTrace = {
  req: null as any,
  res: null as any,
};

// baseURL
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
  timeout: 8000,
});

// Capture request
api.interceptors.request.use((config) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Debug trace
  lastTrace.req = {
    url: config.url,
    method: config.method,
    data: config.data,
  };

  return config;
});

// Capture response or error
api.interceptors.response.use(
  (response) => {
    lastTrace.res = {
      status: response.status,
      data: response.data,
    };
    return response;
  },
  (error) => {
    // If unauthorized → redirect to login
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    lastTrace.res = {
      status: error.response?.status,
      data: error.response?.data || error.message,
    };

    return Promise.reject(error);
  }
);
