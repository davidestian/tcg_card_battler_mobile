export interface GetAccountDetailResponse {
    accountID: string
    email: string,
    accountName: string,
    gold: bigint,
    accountLevel: number,
    accountEXP: bigint
}

export interface PutAccountGoldRQ {
    gold: number
}