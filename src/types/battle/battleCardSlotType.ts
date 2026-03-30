import { BattleCardType } from "./battleCardType";

export interface BattleCardSlotType {
    idx: number,
    battleCard: BattleCardType | null,
    isShow: boolean
}