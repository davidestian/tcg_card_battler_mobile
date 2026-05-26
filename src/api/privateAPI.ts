import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { BASE_URI } from '../config';
import { refreshUser } from './auth/service';
import { APIResponse } from './type';

// ✅ 1. Create a clean instance specifically for handling retries 
// This bypasses response interceptors so data doesn't get double-wrapped
const cleanAxios = axios.create({
    baseURL: BASE_URI,
    timeout: 10000,
});

const privateAPI = axios.create({
    baseURL: BASE_URI,
    timeout: 10000,
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Response Interceptor
privateAPI.interceptors.response.use(
    (response) => {
        return response; // Normal successful requests pass through cleanly
    },
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status !== 401 || originalRequest._retry) {
            return Promise.reject(error);
        }

        // Concurrent Requests Queue
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            })
                .then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    // ✅ 3. Use cleanAxios here for queued requests
                    return cleanAxios(originalRequest);
                })
                .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
            const refreshToken = await SecureStore.getItemAsync('refreshToken');
            if (!refreshToken) {
                return Promise.reject(error);
            }

            const res = await refreshUser({ refreshToken });
            const newAccessToken = res.data.accessToken;

            await SecureStore.setItemAsync('accessToken', newAccessToken);
            await SecureStore.setItemAsync('refreshToken', res.data.refreshToken);

            if (originalRequest.headers) {
                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
            } else {
                originalRequest.headers = { Authorization: `Bearer ${newAccessToken}` };
            }

            processQueue(null, newAccessToken);

            // ✅ 4. Use cleanAxios here for the primary retried request
            // This returns a clean, single-layer Axios response object straight to your frontend
            const reResponse = await privateAPI(originalRequest);
            return reResponse;
        } catch (refreshError) {
            processQueue(refreshError, null);
            await SecureStore.deleteItemAsync('accessToken');
            await SecureStore.deleteItemAsync('refreshToken');
            router.replace('/');
            const r: AxiosResponse<APIResponse> = {
                ...originalRequest,
                data: {
                    success: false,
                    data: null,
                    message: 'expired'
                }
            }
            return Promise.resolve(r);
        } finally {
            isRefreshing = false;
        }
    }
);

export const sendSecureRequest = async <T = any>(
    config: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
    // 1. Fetch token asynchronously from Expo SecureStore
    const token = await SecureStore.getItemAsync('accessToken');

    // 2. Build configuration with token injected safely
    const finalConfig: AxiosRequestConfig = {
        ...config,
        headers: {
            ...config.headers,
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    };

    // 3. Execute using privateAPI so 401 refresh logic applies
    return privateAPI(finalConfig);
};


export default privateAPI;
