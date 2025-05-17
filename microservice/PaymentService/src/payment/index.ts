

export interface SessionUser {
  id: string
}

export interface Checkout {
  type: string,
  item: string,
  currency: string,
  amount: number,
  description: string,
  locale: string,
  image?: string
}

export interface User {
  id: string
  name: string
  role: string[]
}

export interface Authenticated {
  name: string
}

