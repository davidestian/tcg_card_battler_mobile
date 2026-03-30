export interface BattleUnit {
    battleUnitID: string;
    level: number;
    paths: BattleUnitPath[];
    currLevel: number;
    unitCode: string;
    imgURL: string;
    offense: number;
    defense: number;
    technique: number;
    speed: number;
    spirit: number;
    elementID1: number;
    elementID2: number;
}

export interface BattleUnitPath {
    unitCode: string;
    unitName: string;
    unitLevel: number;
    origin: string;
    imageTypeNumber: number;
    offense: number;
    defense: number;
    technique: number;
    speed: number;
    spirit: number;
    elementID1: number;
    elementID2: number;
    imgURL: string;
}