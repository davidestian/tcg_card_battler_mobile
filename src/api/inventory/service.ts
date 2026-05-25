import privateAPI from "../privateAPI";
import { APIResponse } from "../type";
import { InvGetAllPlayerCardRS, invGetEligibleUnitsToCreateRS, InvGetPlayerCardByUnitCodeRS, InvGetPlayerUnitDetailByIDRS, InvGetPlayerUnitPrevLevelRS, InvGetPlayerUnitRS, InvPostCreatePlayerUnitRQ, InvPostPlayerUnitLevelChangeImageRQ, InvPostPlayerUnitLevelUpRQ, InvPostUnitUpgradeRQ } from "./type";

const PathURL = 'api/v1/inventory';

export const invGetPlayerUnits = async (limit: number, page: number, name: string, level: number, lastUnitLevel: number, element1: number, element2: number, origin: string, sort: number): Promise<APIResponse<InvGetPlayerUnitRS>> => {
    const response = await privateAPI.get<APIResponse<InvGetPlayerUnitRS>>(`${PathURL}/unit`, {
        params: {
            limit,
            page,
            name,
            level,
            lastUnitLevel,
            element1,
            element2,
            origin,
            sort
        }
    });
    return response.data;
}

export const invGetPlayerUnitDetailByID = async (playerUnitID: string): Promise<APIResponse<InvGetPlayerUnitDetailByIDRS>> => {
    const response = await privateAPI.get<APIResponse<InvGetPlayerUnitDetailByIDRS>>(`${PathURL}/unit/detail?playerUnitID=${playerUnitID}`);
    return response.data;
}

export const invGetAllPlayerCard = async (limit: number, pageNumber: number): Promise<APIResponse<InvGetAllPlayerCardRS>> => {
    const response = await privateAPI.get<APIResponse<InvGetAllPlayerCardRS>>(`${PathURL}/card?limit=${limit}&pageNumber=${pageNumber}`);
    return response.data;
}

export const invGetPlayerUnitCardByUnitCode = async (unitCode: string): Promise<APIResponse<InvGetPlayerCardByUnitCodeRS[]>> => {
    const response = await privateAPI.get<APIResponse<InvGetPlayerCardByUnitCodeRS[]>>(`${PathURL}/card/unit?unitCode=${unitCode}`);
    return response.data;
}

export const invPostPlayerUnitLevelUp = async (rq: InvPostPlayerUnitLevelUpRQ): Promise<APIResponse> => {
    const response = await privateAPI.post<APIResponse>(`${PathURL}/unit/level-up`, rq);
    return response.data;
}

export const invGetPlayerUnitPrevLevel = async (playerUnitID: string): Promise<APIResponse<InvGetPlayerUnitPrevLevelRS[]>> => {
    const response = await privateAPI.get<APIResponse<InvGetPlayerUnitPrevLevelRS[]>>(`${PathURL}/unit/prev-level?playerUnitID=${playerUnitID}`);
    return response.data;
}

export const invPostPlayerUnitLevelChangeImage = async (rq: InvPostPlayerUnitLevelChangeImageRQ): Promise<APIResponse> => {
    const response = await privateAPI.post<APIResponse>(`${PathURL}/unit/level/change-image`, rq);
    return response.data;
}

export const invPostPlayerUnitUpgrade = async (rq: InvPostUnitUpgradeRQ): Promise<APIResponse> => {
    const response = await privateAPI.post<APIResponse>(`${PathURL}/player-unit/upgrade`, rq);
    return response.data;
}

export const invGetEligibleUnitsToCreate = async (limit: number, page: number): Promise<APIResponse<invGetEligibleUnitsToCreateRS>> => {
    const response = await privateAPI.get<APIResponse<invGetEligibleUnitsToCreateRS>>(`${PathURL}/unit/create?limit=${limit}&page=${page}`);
    return response.data;
}

export const invPostCreatePlayerUnit = async (rq: InvPostCreatePlayerUnitRQ): Promise<APIResponse> => {
    const response = await privateAPI.post<APIResponse>(`${PathURL}/player-unit/create`, rq);
    return response.data;
}

export const invGetPlayerUnitPrice = async (playerUnitID: string): Promise<APIResponse<Number>> => {
    const response = await privateAPI.get<APIResponse>(`${PathURL}/player-unit/price?playerUnitID=${playerUnitID}`);
    return response.data;
}

export const invPostSellPlayerUnit = async (playerUnitID: string): Promise<APIResponse> => {
    const response = await privateAPI.post<APIResponse>(`${PathURL}/player-unit/sell?playerUnitID=${playerUnitID}`);
    return response.data;
}