import privateAPI from "../privateAPI";
import { APIResponse } from "../type";
import { BattleUnit } from "./type";

const PathURL = 'api/v1/battle';

export const battleGetPlayerTeamUnits = async (playerTeamID: string): Promise<APIResponse<BattleUnit[]>> => {
    const response = await privateAPI.get<APIResponse<BattleUnit[]>>(`${PathURL}/player-team`, {
        params: {
            playerTeamID: playerTeamID
        }
    });
    return response.data;
}

export const battleGetRandomEnemyBattleUnits = async (levels: number[], evoLevels: number[]): Promise<APIResponse<BattleUnit[]>> => {
    const response = await privateAPI.get<APIResponse<BattleUnit[]>>(`${PathURL}/unit-random`, {
        params: {
            levels: levels,
            evoLevels: evoLevels
        },
        paramsSerializer: {
            indexes: null
        }
    });
    return response.data;
}