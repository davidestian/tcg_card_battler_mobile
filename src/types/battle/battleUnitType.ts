import { PlayerUnit } from "../data/PlayerUnit";

export interface BattleUnitType {
    playerUnit: PlayerUnit;
    currLevel: number;
    strength: number;
    currUnitCode: string;
}