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

export interface CreateUserRQ {
    email: string;
    username: string;
    password: string;
}

export interface ForgotPasswordRQ {
    email: string;
    password: string;
}