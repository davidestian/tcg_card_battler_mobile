import privateAPI from "../privateAPI";
import { APIResponse } from "../type";
import { StoreGetAllBoosterCardRS, StoreGetAllBoosterRS, StoreGetBoosterRarityRateRS, StorePostBuyBoosterPackRQ, StorePostBuyBoosterPackRS } from "./type";

const PathURL = 'api/v1/store';

export const storeGetAllBooster = async (): Promise<APIResponse<StoreGetAllBoosterRS>> => {
    const response = await privateAPI.get<APIResponse<StoreGetAllBoosterRS>>(`${PathURL}/booster`);
    return response.data;
}

export const storeGetAllBoosterCard = async (boosterCode: string): Promise<APIResponse<StoreGetAllBoosterCardRS>> => {
    const response = await privateAPI.get<APIResponse<StoreGetAllBoosterCardRS>>(`${PathURL}/booster/card?boosterCode=${boosterCode}`);
    return response.data;
}

export const storeGetBoosterRarityRate = async (boosterCode: string): Promise<APIResponse<StoreGetBoosterRarityRateRS>> => {
    const response = await privateAPI.get<APIResponse<StoreGetBoosterRarityRateRS>>(`${PathURL}/booster/rarity-rate?boosterCode=${boosterCode}`);
    return response.data;
}

export const storePostBuyBoosterPack = async (rq: StorePostBuyBoosterPackRQ): Promise<APIResponse<StorePostBuyBoosterPackRS>> => {
    const response = await privateAPI.post<APIResponse<StorePostBuyBoosterPackRS>>(`${PathURL}/booster/buy-pack`, rq);
    return response.data;
}