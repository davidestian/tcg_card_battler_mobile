import { sendSecureRequest } from "../privateAPI";
import { APIResponse } from "../type";
import { InvGetAllPlayerCardRS, invGetEligibleUnitsToCreateRS, InvGetPlayerCardByUnitCodeRS, InvGetPlayerUnitDetailByIDRS, InvGetPlayerUnitPrevLevelRS, InvGetPlayerUnitRS, InvPostCreatePlayerUnitRQ, InvPostPlayerUnitLevelChangeImageRQ, InvPostPlayerUnitLevelUpRQ, InvPostUnitUpgradeRQ } from "./type";

const PathURL = 'api/v1/inventory';

export const invGetPlayerUnits = async (limit: number, page: number, name: string, level: number, lastUnitLevel: number, element1: number, element2: number, origin: string, sort: number): Promise<APIResponse<InvGetPlayerUnitRS>> => {
    const response = await sendSecureRequest<APIResponse<InvGetPlayerUnitRS>>({
        method: 'GET',
        url: `${PathURL}/unit`,
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
    const response = await sendSecureRequest<APIResponse<InvGetPlayerUnitDetailByIDRS>>({
        method: 'GET',
        url: `${PathURL}/unit/detail?playerUnitID=${playerUnitID}`
    });
    return response.data;
}

export const invGetAllPlayerCard = async (limit: number, pageNumber: number): Promise<APIResponse<InvGetAllPlayerCardRS>> => {
    const response = await sendSecureRequest<APIResponse<InvGetAllPlayerCardRS>>({
        method: 'GET',
        url: `${PathURL}/card?limit=${limit}&pageNumber=${pageNumber}`
    });
    return response.data;
}

export const invGetPlayerUnitCardByUnitCode = async (unitCode: string): Promise<APIResponse<InvGetPlayerCardByUnitCodeRS[]>> => {
    const response = await sendSecureRequest<APIResponse<InvGetPlayerCardByUnitCodeRS[]>>({
        method: 'GET',
        url: `${PathURL}/card/unit?unitCode=${unitCode}`
    });
    return response.data;
}

export const invPostPlayerUnitLevelUp = async (rq: InvPostPlayerUnitLevelUpRQ): Promise<APIResponse> => {
    const response = await sendSecureRequest<APIResponse>({
        method: 'POST',
        url: `${PathURL}/unit/level-up`,
        data: rq
    });
    return response.data;
}

export const invGetPlayerUnitPrevLevel = async (playerUnitID: string): Promise<APIResponse<InvGetPlayerUnitPrevLevelRS[]>> => {
    const response = await sendSecureRequest<APIResponse<InvGetPlayerUnitPrevLevelRS[]>>({
        method: 'GET',
        url: `${PathURL}/unit/prev-level?playerUnitID=${playerUnitID}`
    });
    return response.data;
}

export const invPostPlayerUnitLevelChangeImage = async (rq: InvPostPlayerUnitLevelChangeImageRQ): Promise<APIResponse> => {
    const response = await sendSecureRequest<APIResponse>({
        method: 'POST',
        url: `${PathURL}/unit/level/change-image`,
        data: rq
    });
    return response.data;
}

export const invPostPlayerUnitUpgrade = async (rq: InvPostUnitUpgradeRQ): Promise<APIResponse> => {
    const response = await sendSecureRequest<APIResponse>({
        method: 'POST',
        url: `${PathURL}/player-unit/upgrade`,
        data: rq
    });
    return response.data;
}

export const invGetEligibleUnitsToCreate = async (limit: number, page: number): Promise<APIResponse<invGetEligibleUnitsToCreateRS>> => {
    const response = await sendSecureRequest<APIResponse<invGetEligibleUnitsToCreateRS>>({
        method: 'GET',
        url: `${PathURL}/unit/create?limit=${limit}&page=${page}`
    });
    return response.data;
}

export const invPostCreatePlayerUnit = async (rq: InvPostCreatePlayerUnitRQ): Promise<APIResponse> => {
    const response = await sendSecureRequest<APIResponse>({
        method: 'POST',
        url: `${PathURL}/player-unit/create`,
        data: rq
    });
    return response.data;
}

export const invGetPlayerUnitPrice = async (playerUnitID: string): Promise<APIResponse<Number>> => {
    const response = await sendSecureRequest<APIResponse>({
        method: 'GET',
        url: `${PathURL}/player-unit/price?playerUnitID=${playerUnitID}`
    });
    return response.data;
}

export const invPostSellPlayerUnit = async (playerUnitID: string): Promise<APIResponse> => {
    const response = await sendSecureRequest<APIResponse>({
        method: 'POST',
        url: `${PathURL}/player-unit/sell?playerUnitID=${playerUnitID}`
    });
    return response.data;
}