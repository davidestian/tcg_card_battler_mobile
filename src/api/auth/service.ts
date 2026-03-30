import { AxiosError } from "axios";
import publicAPI from "../publicAPI";
import { APIResponse } from "../type";
import { LoginRQ, LoginRS, RefreshRQ } from "./type";

const PathURL = 'api/v1/auth';

export const loginUser = async (rq: LoginRQ): Promise<APIResponse<LoginRS>> => {
    try {
        const response = await publicAPI.post<APIResponse<LoginRS>>(`${PathURL}/login`, rq);
        return response.data;
    } catch (error) {
        const axiosError = error as AxiosError;
        console.error('Login Error:', axiosError.response?.data || axiosError.message);
        throw error;
    }
};

export const refreshUser = async (rq: RefreshRQ): Promise<APIResponse<LoginRS>> => {
    try {
        const response = await publicAPI.post<APIResponse<LoginRS>>(`${PathURL}/refresh`, rq);
        return response.data;
    } catch (error) {
        const axiosError = error as AxiosError;
        console.error('Login Error:', axiosError.response?.data || axiosError.message);
        throw error;
    }
};
