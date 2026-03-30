export interface UnitGetNextLevelPathRS {
    unitCode: string;
    unitName: string;
    origin: string;
    tags: string[];
    targetLevel: number;
    cost: number;
    offense: number;
    defense: number;
    technique: number;
    speed: number;
    spirit: number;
    elementID1: number;
    elementID2: number;
    imgURL: string;
}
export interface Unit {
    unitCode: string;
    unitName: string;
    origin: string;
    tags: string[];
    unitLevel: number;
    offense: number;
    defense: number;
    technique: number;
    speed: number;
    spirit: number;
    elementID1: number;
    elementID2: number;
    imgURL: string;
}