import { UnitBase } from "./UnitBase";

export interface PlayerUnitBase {
    id: string;
    playerID: string;
    unitBaseCode: string;
    level: number;
    unitBase: UnitBase;
}