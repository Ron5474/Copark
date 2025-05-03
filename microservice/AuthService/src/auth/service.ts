
import { SessionUser } from "../index";
import { AuthUser, Credentials, User } from "./index";
import { pool } from "./db";
import { SignJWT } from 'jose'
import * as jwt from "jsonwebtoken";

const encodedKey = new TextEncoder().encode(process.env.MASTER_SECRET)

export class AuthService {

   public async authenticate(credentials: Credentials): Promise<User|undefined> {
    const query = {
      text: `
        SELECT jsonb_build_object(
          'id', id,
          'name', data->>'name',
          'email', data->>'email',
          'role', data->>'role'
        ) AS user
        FROM account
        WHERE data->>'email' = $1
        AND data->>'pwhash' = crypt($2::text, data->>'pwhash')
        AND (data->>'deleted' IS NULL OR data->>'deleted' != 'true');
      `,
      values: [credentials.email, credentials.password]
    }
  
    const { rows } = await pool.query(query)
  
    if (rows.length > 0) {
      const user = rows[0].user
      return { id: await user.id, name: user.name, role: user.role };
    } else {
      return undefined
    }
  }

  public async encrypt(userId: string): Promise<string> {
    return new SignJWT({ id: userId })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('30m')
      .sign(encodedKey)
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
        roles: data.roles,
      };
    }
  }

  public async check(
    authHeader?: string,
    scopes?: string[]
  ): Promise<SessionUser> {
    return new Promise((resolve, reject) => {
      if (!authHeader) {
        reject(new Error("Unauthorized"));
      } else {
        const token = authHeader.split(" ")[1];
        jwt.verify(
          token,
          `${process.env.MASTER_SECRET}`,
          async (err: jwt.VerifyErrors | null, decoded?: object | string) => {
            const uid = decoded as SessionUser;
            if (err) {
              reject(err);
            } else {
              const user = await this.getUserById(uid.id);
              if (user) {
                if (scopes) {
                  if (
                    !user.roles ||
                    !scopes.some((role) => user.roles.includes(role))
                  ) {
                    // CREDITS: TO ALLOW FOR MULTIPLE SCOPES https://chatgpt.com/c/67f1d214-c684-8007-b007-ab0547bad07c
                    reject(new Error("Unauthorized"));
                  }
                }
                resolve({ id: user.id });
              }
              reject(new Error("Unauthorized"));
            }
          }
        );
      }
    });
  }
}