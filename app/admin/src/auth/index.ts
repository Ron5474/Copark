export interface SessionUser {
    id: string
}

export interface Credentials {
    email: string,
    password: string
}

export interface User {
    id: string
    name: string
}

export interface Authenticated {
    name: string
}
