import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { BASE_URI } from '../config';
import { refreshUser } from './auth/service';


const privateAPI = axios.create({
    baseURL: BASE_URI, // Auto-loaded from .env
    timeout: 10000,
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

privateAPI.interceptors.response.use(response => response, async error => {
    const { response, config } = error;

    if (response?.status !== 401 || config._retry) {
        return Promise.reject(error);
    }

    if (isRefreshing) {
        // If a refresh is already in progress, add this request to a queue
        return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
        })
            .then(token => {
                config.headers.Authorization = `Bearer ${token}`;
                return privateAPI(config);
            })
            .catch(err => Promise.reject(err));
    }

    config._retry = true;
    isRefreshing = true;

    try {
        const refreshToken = await SecureStore.getItemAsync('refreshToken');

        if (!refreshToken) return;

        const res = await refreshUser({ refreshToken });

        const newAccessToken = res.data.accessToken;
        await SecureStore.setItemAsync('accessToken', newAccessToken);
        await SecureStore.setItemAsync('refreshToken', res.data.refreshToken);

        config.headers.Authorization = `Bearer ${newAccessToken}`;

        // Process all queued requests with the new token
        processQueue(null, newAccessToken);

        return privateAPI(config);
    } catch (refreshError) {
        processQueue(refreshError, null);
        // Optional: Logout user here
        return Promise.reject(refreshError);
    } finally {
        isRefreshing = false;
    }
});


export default privateAPI;
