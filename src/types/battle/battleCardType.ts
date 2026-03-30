import { BattleCardTypeEnums } from "@/src/enums/battleEnum";

export interface BattleCardType {
    id: number,
    cardID: string,
    cardType: BattleCardTypeEnums,
    playerID: string,
    imageURL: string
}