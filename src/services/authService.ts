import * as SecureStore from 'expo-secure-store';
import { LoginRS } from "../api/auth/type";
import privateAPI from '../api/privateAPI';

export const checkAlreadyLogin = async (): Promise<boolean> => {
    const token = await SecureStore.getItemAsync("accessToken");

    if (token) return true;

    return false;
}

export const onLoginSuccess = async (data: LoginRS) => {
    if (!data.accessToken || !data.refreshToken) {
        console.error("Login failed: Missing tokens in response");
        return;
    }

    try {
        // 1. Store them securely
        await SecureStore.setItemAsync('accessToken', data.accessToken);
        await SecureStore.setItemAsync('refreshToken', data.refreshToken);

        // 2. Update the private instance header immediately
        privateAPI.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;

        // 3. Navigate to the Game Home
        //navigation.navigate('Home');

    } catch (error) {
        console.error("SecureStore Error:", error);
    }
};

export const logout = async () => {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
}