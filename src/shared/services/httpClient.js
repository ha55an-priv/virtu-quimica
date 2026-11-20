import { create } from 'axios';

import { API_BASE_URL } from '../../config/apiConfig';

export const httpClient = create({
  baseURL: API_BASE_URL,
  allowAbsoluteUrls: false,
  timeout: 30000,
});

let authorization;

export function setAccessToken(token) {
  authorization = token ? `Bearer ${token}` : undefined;
}

httpClient.interceptors.request.use((config) => {
  if (authorization && config.url !== '/auth/login') {
    config.headers.set('Authorization', authorization);
  }
  return config;
});

export function onSessionRejected(handler) {
  const interceptor = httpClient.interceptors.response.use(undefined, (error) => {
    const status = error.response?.status;
    const rejected = status === 401 || (status === 403 && error.config?.url === '/auth/me');
    if (rejected && authorization && error.config?.headers.get('Authorization') === authorization) {
      handler();
    }
    return Promise.reject(error);
  });
  return () => httpClient.interceptors.response.eject(interceptor);
}
