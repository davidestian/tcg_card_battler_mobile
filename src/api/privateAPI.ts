import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { BASE_URI } from '../config';
import { refreshUser } from './auth/service';
import { APIResponse } from './type';

const privateAPI = axios.create({
    baseURL: BASE_URI,
    timeout: 10000,
});

let isRefreshing = false;
// CHANGE: Store execution callbacks instead of raw resolve objects
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

privateAPI.interceptors.request.use(
    async (config) => {
        const token = await SecureStore.getItemAsync('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

privateAPI.interceptors.response.use(
    (response) => {
        console.log(response.data)
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status !== 401 || originalRequest._retry) {
            return Promise.reject(error);
        }
        // If a refresh operation is already running
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            })
                .then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return privateAPI(originalRequest);
                })
                .catch((err) => Promise.reject(err));
        }
        // Mark request as retried and lock the refresh state
        originalRequest._retry = true;
        isRefreshing = true;
        try {
            const refreshToken = await SecureStore.getItemAsync('refreshToken');
            if (!refreshToken) {
                return Promise.reject(error);
            }
            // 1. Await token generation
            const res = await refreshUser({ refreshToken });
            const newAccessToken = res.data.accessToken;
            // 2. Save tokens securely
            await SecureStore.setItemAsync('accessToken', newAccessToken);
            await SecureStore.setItemAsync('refreshToken', res.data.refreshToken);
            // 3. Update authorization headers for the initial failing request
            if (originalRequest.headers) {
                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
            } else {
                originalRequest.headers = { Authorization: `Bearer ${newAccessToken}` };
            }

            // 4. Fire the queue first so concurrent requests get processed
            processQueue(null, newAccessToken);

            // 5. CRITICAL: Execute and directly return the result of the original call
            const reResponse = await privateAPI.request<APIResponse>(originalRequest);
            return reResponse;
        } catch (refreshError) {
            processQueue(refreshError, null);
            await SecureStore.deleteItemAsync('accessToken');
            await SecureStore.deleteItemAsync('refreshToken');
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);
export default privateAPI;
