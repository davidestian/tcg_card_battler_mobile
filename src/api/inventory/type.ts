export interface InvGetPlayerUnitRS {
    totalPage: number;
    units: PlayerUnit[];
}

export interface PlayerUnit {
    playerUnitID: string;
    level: number;
    unitCode: string;
    origin: string;
    imageTypeNumber: number;
    imgURL: string;
    elementID1: number;
    elementID2: number;
}

export interface InvGetPlayerUnitDetailByIDRS {
    playerUnitID: string;
    firstUnitCode: string;
    lastUnitCode: string;
    origin: string;
    unitName: string;
    playerUnitLevel: number;
    tags: string[];
    imageTypeNumber: number;
}

export interface InvGetPlayerCardByUnitCodeRS {
    cardCode: string;
    origin: string;
    imageTypeNumber: number;
    qty: number;
    currQTY: number;
    imgURL: string;
}

export interface InvPostPlayerUnitLevelUpRQ {
    playerUnitID: string;
    items: CostCardItemRQ[];
}

export interface InvPostUnitUpgradeRQ {
    playerUnitID: string;
    targetUnitCode: string;
    items: CostCardItemRQ[];
}

export interface InvPostCreatePlayerUnitRQ {
    unitCode: string;
    items: CostCardItemRQ[];
}

export interface CostCardItemRQ {
    imageTypeNumber: number;
    qty: number;
}

export interface InvGetPlayerUnitPrevLevelRS {
    playerUnitID: string;
    targetLevel: number;
    imageTypeCount: number;
    unitName: string;
    unitCode: string;
    origin: string;
    imageTypeNumber: number;
    offense: number;
    defense: number;
    technique: number;
    speed: number;
    spirit: number;
    imgURL: string;
}

export interface InvPostPlayerUnitLevelChangeImageRQ {
    playerUnitID: string;
    targetLevel: number;
    unitCode: string;
    imageTypeNumber: number;
}

export interface InvGetAllPlayerCardRS {
    totalPage: number;
    currPage: number;
    cards: PlayerCard[];
}

export interface PlayerCard {
    cardCode: string;
    imageTypeNumber: number;
    origin: string;
    qty: number;
    cardRarityCode: string;
    price: number;
    imgURL: string;
}

export interface invGetEligibleUnitsToCreateRS {
    totalPage: number;
    currPage: number;
    units: EligibleUnit[];
}

export interface EligibleUnit {
    unitCode: string;
    origin: string;
    imgURL: string;
}