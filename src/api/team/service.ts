import privateAPI from "../privateAPI";
import { APIResponse } from "../type";
import { GetPlayerTeamRS, PlayerTeam, PostPlayerTeamRQ, PutActivePlayerTeamRQ } from "./type";

const PathURL = 'api/v1/team';

export const GetPlayerTeamList = async (limit: number, page: number): Promise<APIResponse<GetPlayerTeamRS>> => {
    const response = await privateAPI.get<APIResponse<GetPlayerTeamRS>>(`${PathURL}/list?limit=${limit}&page=${page}`);
    return response.data;
}

export const GetPlayerTeamByTeamID = async (teamID: string): Promise<APIResponse<PlayerTeam>> => {
    const response = await privateAPI.get<APIResponse<PlayerTeam>>(`${PathURL}?teamID=${teamID}`);
    return response.data;
}

export const GetActivePlayerTeamID = async (): Promise<APIResponse<string>> => {
    const response = await privateAPI.get<APIResponse<string>>(`${PathURL}/active/id`);
    return response.data;
}

export const PostPlayerTeam = async (rq: PostPlayerTeamRQ): Promise<APIResponse> => {
    const response = await privateAPI.post<APIResponse>(`${PathURL}`, rq);
    return response.data;
}

export const PutActivePlayerTeam = async (rq: PutActivePlayerTeamRQ): Promise<APIResponse> => {
    const response = await privateAPI.put<APIResponse>(`${PathURL}/active`, rq);
    return response.data;
}

export const DeletePlayerTeam = async (teamID: string): Promise<APIResponse> => {
    const response = await privateAPI.delete<APIResponse>(`${PathURL}?playerTeamID=${teamID}`);
    return response.data;
}