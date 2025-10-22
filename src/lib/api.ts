import axios from "axios";

export const lastTrace = {
  req: null as any,
  res: null as any,
};

export const api = axios.create({
  baseURL: "/api",
  timeout: 8000,
});

// Capture request
api.interceptors.request.use((config) => {
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
    lastTrace.res = {
      status: error.response?.status,
      data: error.response?.data || error.message,
    };
    return Promise.reject(error);
  }
);
