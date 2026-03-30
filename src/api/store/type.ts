export interface StoreGetAllBoosterRS {
    boosters: Booster[];
}

export interface Booster {
    boosterCode: string;
    boosterName: string;
    price: number;
}

export interface StoreGetAllBoosterCardRS {
    cards: BoosterCard[];
}

export interface BoosterCard {
    index: number;
    cardCode: string;
    imageTypeNumber: number;
    cardTypeCode: string;
    cardRarityCode: string;
    price: number;
    origin: string;
    imgURL: string;
    isShow: boolean;
}

export interface StoreGetBoosterRarityRateRS {
    items: BoosterCardPercentage[];
}

export interface BoosterCardPercentage {
    cardRarityCode: string;
    percentage: number;
}

export interface StorePostBuyBoosterPackRQ {
    boosterCode: string;
    qty: number;
}

export interface StorePostBuyBoosterPackRS {
    cards: BoosterCard[][];
}



