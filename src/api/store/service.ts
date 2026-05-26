import { sendSecureRequest } from "../privateAPI";
import { APIResponse } from "../type";
import { StoreGetAllBoosterCardRS, StoreGetAllBoosterRS, StoreGetBoosterRarityRateRS, StorePostBuyBoosterPackRQ, StorePostBuyBoosterPackRS } from "./type";

const PathURL = 'api/v1/store';

export const storeGetAllBooster = async (limit: number): Promise<APIResponse<StoreGetAllBoosterRS>> => {
    const response = await sendSecureRequest<APIResponse<StoreGetAllBoosterRS>>({
        method: 'GET',
        url: `${PathURL}/booster?limit=${limit}`
    });
    return response.data;
}

export const storeGetAllBoosterCard = async (boosterCode: string): Promise<APIResponse<StoreGetAllBoosterCardRS>> => {
    const response = await sendSecureRequest<APIResponse<StoreGetAllBoosterCardRS>>({
        method: 'GET',
        url: `${PathURL}/booster/card?boosterCode=${boosterCode}`
    });
    return response.data;
}

export const storeGetBoosterRarityRate = async (boosterCode: string): Promise<APIResponse<StoreGetBoosterRarityRateRS>> => {
    const response = await sendSecureRequest<APIResponse<StoreGetBoosterRarityRateRS>>({
        method: 'GET',
        url: `${PathURL}/booster/rarity-rate?boosterCode=${boosterCode}`
    });
    return response.data;
}

export const storePostBuyBoosterPack = async (rq: StorePostBuyBoosterPackRQ): Promise<APIResponse<StorePostBuyBoosterPackRS>> => {
    const response = await sendSecureRequest<APIResponse<StorePostBuyBoosterPackRS>>({
        method: 'POST',
        url: `${PathURL}/booster/buy-pack`,
        data: rq
    });
    return response.data;
}