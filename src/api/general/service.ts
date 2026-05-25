import publicAPI from "../publicAPI";
import { APIResponse } from "../type";
import { Elements, Origins } from "./type";

const PathURL = 'api/v1/general';

export const getElements = async (): Promise<APIResponse<Elements[]>> => {
    try {
        const response = await publicAPI.get<APIResponse<Elements[]>>(`${PathURL}/elements`);
        return response.data;
    } catch (error) {
        return {
            success: false,
            message: "failed get",
            data: []
        };
    }
};

export const getOrigins = async (): Promise<APIResponse<Origins[]>> => {
    try {
        const response = await publicAPI.get<APIResponse<Origins[]>>(`${PathURL}/origins`);
        return response.data;
    } catch (error) {
        return {
            success: false,
            message: "failed get",
            data: []
        };
    }
};