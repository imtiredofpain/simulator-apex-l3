// import { useOrganizationsStore } from '@features/Organizations/store/useOrganizationsStore';
// import { PATHS } from '@shared/config/pathRoute';
import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';
import { handleApiError } from './handleApiError';

let currentInn: string | null = null;

// Функция для обновления INN (вызывается из Zustand store)
export const setAxiosInn = (inn: string | null) => {
  currentInn = inn;
};

export const apiClientInn: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://chekyshka.mrdn.cloud/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor - автоматически добавляем INN
apiClientInn.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Добавляем INN только если он установлен
    if (currentInn && config.headers) {
      config.headers['Inn'] = currentInn;
    }
    // Можно добавить токен авторизации
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor - обработка ошибок
apiClientInn.interceptors.response.use(
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
  (error) => {
    // if (error.response?.status === 401) {
    //   window.location.href = PATHS.signIn;
    // }
    // if (error.response?.status === 403) {
    //   // Если нет прав на организацию - сбрасываем выбор
    //   useOrganizationsStore.getState().clearSelectedInn();
    // }
    handleApiError(error); // Централизованная обработка
    return Promise.reject(error);
  }
);
