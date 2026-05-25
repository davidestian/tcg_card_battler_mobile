import publicAPI from "../publicAPI";
import { APIResponse } from "../type";
import { CreateUserRQ, ForgotPasswordRQ, LoginRQ, LoginRS, RefreshRQ } from "./type";

const PathURL = 'api/v1/auth';

export const loginUser = async (rq: LoginRQ): Promise<APIResponse<LoginRS>> => {
    try {
        const response = await publicAPI.post<APIResponse<LoginRS>>(`${PathURL}/login`, rq);
        return response.data;
    } catch (error) {
        return {
            success: false,
            message: "Failed to get token",
            data: {
                accessToken: '',
                refreshToken: ''
            }
        };
    }
};

export const refreshUser = async (rq: RefreshRQ): Promise<APIResponse<LoginRS>> => {
    try {
        const response = await publicAPI.post<APIResponse<LoginRS>>(`${PathURL}/refresh`, rq);
        return response.data;
    } catch (error) {
        return {
            success: false,
            message: "Failed to refresh token",
            data: {
                accessToken: '',
                refreshToken: ''
            }
        };
    }
};

export const createUser = async (rq: CreateUserRQ): Promise<APIResponse> => {
    try {
        const response = await publicAPI.post<APIResponse>(`${PathURL}/create`, rq);
        return response.data;
    } catch (error) {
        return {
            success: false,
            message: "Failed to create new user",
            data: null
        };
    }
};

export const forgot = async (rq: ForgotPasswordRQ): Promise<APIResponse> => {
    try {
        const response = await publicAPI.post<APIResponse>(`${PathURL}/forgot`, rq);
        return response.data;
    } catch (error) {
        return {
            success: false,
            message: "Failed to create new user",
            data: null
        };
    }
};