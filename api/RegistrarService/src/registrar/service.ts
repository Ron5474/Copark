
import { pool } from "./db";
import { SessionUser } from "../index";
import { AuthUser, Credentials, User, OauthLoginData } from "./index";

import { SignJWT, jwtVerify } from 'jose'

const encodedKey = new TextEncoder().encode(process.env.JWT_SECRET)
const internalKey = new TextEncoder().encode(process.env.MICROSERVICE_INTERNAL_SECRET)
export class RegistrarService {
  public async encrypt(userId: string): Promise<string> {
    return new SignJWT({ id: userId })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('30m')
      .sign(internalKey)
  }

  private async getUserById(id: string): Promise<AuthUser | undefined> {
    const query = {
      text: "SELECT id, data as data FROM account WHERE id = $1 AND data->>'deleted' IS NULL",
      values: [id],
    };

    const res = await pool.query(query);
    if (res.rows.length === 0) {
      return undefined;
    } else {
      const user = res.rows[0];
      const data = user.data;
      return {
        id: user.id,
        name: data.name,
        email: data.email,
        role: data.role,
      };
    }
  }
}