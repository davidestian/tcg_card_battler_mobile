import { sendSecureRequest } from "../privateAPI";
import { APIResponse } from "../type";
import { GetAccountDetailResponse, PutAccountGoldRQ } from "./type";

const PathURL = 'api/v1/account';

export const getUserDetail = async (): Promise<APIResponse<GetAccountDetailResponse>> => {
    const response = await sendSecureRequest<APIResponse<GetAccountDetailResponse>>({
        method: 'GET',
        url: PathURL
    });
    return response.data;
};

export const putAccountGold = async (rq: PutAccountGoldRQ): Promise<APIResponse> => {

    const response = await sendSecureRequest<APIResponse<GetAccountDetailResponse>>({
        method: 'PUT',
        url: `${PathURL}/gold`,
        data: rq
    });
    return response.data;
}