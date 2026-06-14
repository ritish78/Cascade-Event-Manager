import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api/v1",
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: undefined) => void;
  reject: (value: Error) => void;
}> = [];

const processsQueue = (error: Error | null) => {
  failedQueue.forEach((promis) => {
    if (error) {
      promis.reject(error);
    } else {
      //if I was using Authorization: Bearer token, then I would have to resolve
      // with new token and inject it into the queued requests header.
      // since, we are using cookies, we can reolve it to be anything.
      promis.resolve(undefined);
    }
  });
  failedQueue = [];
};

//response interceptor - if accessToken is expired we use refreshToken
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/refresh") &&
      !originalRequest.url.includes("/auth/login")
    ) {
      if (isRefreshing) {
        //requests that come up when refresh is in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post("/auth/refresh");
        processsQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        //if there is an error while refreshing token, we then change to login page
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
