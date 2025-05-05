export interface AuthUser {
  id: string,
  name: string,
  role: string[],
  /**
   * the email address of the user
   * @maxLength 320
   * @pattern ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$
   * @example "user@example.com"
   */
  email: string //TODO: use Email type
}

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
