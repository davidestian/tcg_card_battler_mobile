export interface LoginRQ {
    email: string,
    password: string
}

export interface LoginRS {
    accessToken: string,
    refreshToken: string
}
export interface RefreshRQ {
    refreshToken: string
}