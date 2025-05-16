

export interface SessionUser {
  id: string
}

export interface Checkout {
  item: string,
  locale: string
}

export interface User {
  id: string
  name: string
  role: string[]
}

export interface Authenticated {
  name: string
}

