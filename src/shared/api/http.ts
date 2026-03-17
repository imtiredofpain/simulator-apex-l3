import axios, { type AxiosInstance } from 'axios';

let _axios: AxiosInstance | null = null;

const getAxios = () => {
  if (_axios) return _axios;
  _axios = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://chekyshka.mrdn.cloud/api',
    timeout: 15000,
  });
  // Интерсепторы: авторизация/ошибки
  _axios.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
  _axios.interceptors.response.use(
    (r) => {
      const d = r?.data;
      const headers = r?.headers || {};
      // 1) Серверный envelope об ошибке
      if (
        d &&
        typeof d === 'object' &&
        'isSuccess' in d &&
        d?.isSuccess === false
      ) {
        const apiErr = {
          response: { data: d, status: d?.statusCode ?? r?.status },
        };
        return Promise.reject(apiErr);
      }
      // 2) Ошибка сигнализируется через заголовки (например, X-Error-Code)
      const hdrErrorCode =
        headers['x-error-code'] || headers['x-error'] || headers['x-app-error'];
      if (hdrErrorCode) {
        const apiErr = {
          response: {
            data: {
              message: headers['x-error-message'] || 'Server error',
              errorCode: String(hdrErrorCode),
              statusCode: r?.status,
            },
            status: r?.status,
          },
        };
        return Promise.reject(apiErr);
      }
      return r;
    },
    (err) => Promise.reject(err)
  );
  return _axios;
};

export default getAxios;
