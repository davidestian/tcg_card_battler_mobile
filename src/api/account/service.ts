import privateAPI from "../privateAPI";
import { APIResponse } from "../type";
import { GetAccountDetailResponse, PutAccountGoldRQ } from "./type";

const PathURL = 'api/v1/account';

export const getUserDetail = async (): Promise<APIResponse<GetAccountDetailResponse>> => {
    const response = await privateAPI.get<APIResponse<GetAccountDetailResponse>>(`${PathURL}`);
    return response.data;
}

export const putAccountGold = async (rq: PutAccountGoldRQ): Promise<APIResponse> => {
    const response = await privateAPI.put<APIResponse>(`${PathURL}/gold`, rq);
    return response.data;
}