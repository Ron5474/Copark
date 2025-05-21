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

export interface OauthSignup {
  authToken: string
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
  email?:string
}

export interface Authenticated {
  name: string
}

export interface OauthUser {
  id: string,
  name: string,
  email: string,
  role: string[],
  picture: string,
  sub: string,
}

export interface OauthLoginData {
  "name": string,
  "email": string,
  /**
   * the picture url of the user
   * @maxLength 2048
   * @pattern ^https?:\/\/.*$
   * @example "https://example.com/user.jpg"
   */
  "picture": string,
  "sub": string,
}
