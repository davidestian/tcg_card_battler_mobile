import { BattleCardSlotType } from "./battleCardSlotType";
import { BattlePlayerAreaType } from "./battlePlayerAreaType";

export interface BattleIndexType {
    player1: BattlePlayerAreaType,
    player2: BattlePlayerAreaType,
    cardSlots: BattleCardSlotType[],
}