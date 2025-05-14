

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
  role: string[]
}

export interface Authenticated {
  name: string
}

