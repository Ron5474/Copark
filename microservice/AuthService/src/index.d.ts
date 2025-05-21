export interface SessionUser {
  id: string
}

export interface OauthUser {
  id: string,
  name: string,
  email?: string,
  role: string[],
  picture?: string,
  sub?: string,
}


declare global {
  namespace Express {
    export interface Request {
      user?: SessionUser|OauthUser
    }
  }
}