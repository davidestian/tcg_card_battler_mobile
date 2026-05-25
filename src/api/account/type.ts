export interface GetAccountDetailResponse {
    accountID: string
    email: string,
    accountName: string,
    gold: bigint,
}

export interface PutAccountGoldRQ {
    gold: number
}