export interface SessionUser {
  id: string
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


declare global {
  namespace Express {
    export interface Request {
      user?: SessionUser|OauthLoginData
    }
  }
}