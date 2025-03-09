import axios, { InternalAxiosRequestConfig, AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse, ApiError } from './errorHandler';

// Import the ApiErrorCode from errorHandler instead of redefining it

const API_BASE_URL = 'http://dev.rocket:8080/api/v1';

// Create the axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Version': '1.0'
  }
});

// Configure request interceptor with proper types
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('authToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }
);

// Backend API response structure
interface BackendResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
}

// Create a wrapper around axios that returns our API response format
const apiClient = {
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<BackendResponse<T>> = await axiosInstance.get(url, config);
      return {
        success: true,
        data: response.data.data,
        meta: response.data.meta || {}
      };
    } catch (error) {
      return handleAxiosError(error as AxiosError);
    }
  },
  
  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<BackendResponse<T>> = await axiosInstance.post(url, data, config);
      return {
        success: true,
        data: response.data.data,
        meta: response.data.meta || {}
      };
    } catch (error) {
      return handleAxiosError(error as AxiosError);
    }
  },
  
  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<BackendResponse<T>> = await axiosInstance.put(url, data, config);
      return {
        success: true,
        data: response.data.data,
        meta: response.data.meta || {}
      };
    } catch (error) {
      return handleAxiosError(error as AxiosError);
    }
  },
  
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<BackendResponse<T>> = await axiosInstance.delete(url, config);
      return {
        success: true,
        data: response.data.data,
        meta: response.data.meta || {}
      };
    } catch (error) {
      return handleAxiosError(error as AxiosError);
    }
  }
};

// Helper function to handle axios errors
function handleAxiosError(error: AxiosError): ApiResponse<never> {
  const errorData = error.response?.data as { error?: ApiError } | undefined;
  
  return {
    success: false,
    error: errorData?.error || {
      code: 'NETWORK_ERROR',
      message: error.message || 'Connection problem'
    }
  };
}

export default apiClient;
