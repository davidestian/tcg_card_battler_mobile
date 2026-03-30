import { PlayerUnitLevel } from "./PlayerUnitLevel";

export interface PlayerUnit {
    id: string;
    playerId: string;
    level: number;
    playerUnitLevel: PlayerUnitLevel[];
}