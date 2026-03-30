import publicAPI from "../publicAPI";
import { APIResponse } from "../type";
import { Unit, UnitGetNextLevelPathRS } from "./type";

const PathURL = 'api/v1/unit';

export const GetUnitByCode = async (unitCode: string): Promise<APIResponse<Unit>> => {
    const response = await publicAPI.get<APIResponse<Unit>>(`${PathURL}?unitCode=${unitCode}`);
    return response.data;
}

export const UnitGetNextLevelPath = async (unitCode: string): Promise<APIResponse<UnitGetNextLevelPathRS[]>> => {
    const response = await publicAPI.get<APIResponse<UnitGetNextLevelPathRS[]>>(`${PathURL}/next-level-path?unitCode=${unitCode}`);
    return response.data;
}