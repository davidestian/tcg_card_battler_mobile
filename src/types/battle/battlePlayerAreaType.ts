import { PlayerUnitBase } from "../data/PlayerUnitBase";
import { BattleUnitType } from "./battleUnitType";

export interface BattlePlayerAreaType {
    id: string;
    isPlayer: boolean;
    battleUnits: BattleUnitType[];
    playerUnitBase: PlayerUnitBase;
    maxHP: number;
    currHP: number;
    currScore: number;
}