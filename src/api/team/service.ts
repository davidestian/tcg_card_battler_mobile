import { sendSecureRequest } from "../privateAPI";
import { APIResponse } from "../type";
import { GetPlayerTeamRS, PlayerTeam, PostPlayerTeamRQ, PutActivePlayerTeamRQ } from "./type";

const PathURL = 'api/v1/team';

export const GetPlayerTeamList = async (limit: number, page: number): Promise<APIResponse<GetPlayerTeamRS>> => {
    const response = await sendSecureRequest<APIResponse<GetPlayerTeamRS>>({
        method: 'GET',
        url: `${PathURL}/list?limit=${limit}&page=${page}`,
    });
    return response.data;
}

export const GetPlayerTeamByTeamID = async (teamID: string): Promise<APIResponse<PlayerTeam>> => {
    const response = await sendSecureRequest<APIResponse<PlayerTeam>>({
        method: 'GET',
        url: `${PathURL}?teamID=${teamID}`,
    });
    return response.data;
}

export const GetActivePlayerTeamID = async (): Promise<APIResponse<string>> => {
    const response = await sendSecureRequest<APIResponse<string>>({
        method: 'GET',
        url: `${PathURL}/active/id`,
    });
    return response.data;
}

export const PostPlayerTeam = async (rq: PostPlayerTeamRQ): Promise<APIResponse> => {
    const response = await sendSecureRequest<APIResponse>({
        method: 'POST',
        url: `${PathURL}`,
        data: rq
    });
    return response.data;
}

export const PutActivePlayerTeam = async (rq: PutActivePlayerTeamRQ): Promise<APIResponse> => {
    const response = await sendSecureRequest<APIResponse>({
        method: 'PUT',
        url: `${PathURL}/active`,
        data: rq
    });
    return response.data;
}

export const DeletePlayerTeam = async (teamID: string): Promise<APIResponse> => {
    const response = await sendSecureRequest<APIResponse>({
        method: 'DELETE',
        url: `${PathURL}?playerTeamID=${teamID}`
    });
    return response.data;
}