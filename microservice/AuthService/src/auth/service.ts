
import { pool } from "./db";
import { SessionUser } from "../index";
import { AuthUser, Credentials, User, OauthLoginData } from "./index";

import { SignJWT, jwtVerify } from 'jose'


const encodedKey = new TextEncoder().encode(process.env.JWT_SECRET)
const internalKey = new TextEncoder().encode(process.env.MICROSERVICE_INTERNAL_SECRET)
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
      const retid = await new SignJWT({ id: user.id })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('30m')
      .sign(encodedKey)
      console.log("JWT:", retid)
      return { id: retid, name: user.name, role: user.role };
    } else {
      return undefined
    }
  }

  public async getOauthUser(data: OauthLoginData|SessionUser|undefined): Promise<string| undefined> {
    if (data === undefined) {
      throw new Error("Unauthorized");
    }
    if ('id' in data) {
      throw new Error("Unauthorized");
    }
    const query = {
      text: "SELECT id, data as data FROM account WHERE data->>'sub' = $1 AND data->>'deleted' IS NULL",
      values: [data.sub],
    };

    const res = await pool.query(query);
    if (res.rows.length === 0) {
      return undefined;
    } else {
      const user = res.rows[0];
      return this.encrypt(user.id)
    }
  }

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

  public async check(
  authHeader?: string,
  scopes?: string[]
): Promise<SessionUser|OauthLoginData> {
  if (!authHeader) {
    throw new Error("Unauthorized");
  }

  try {
    const token = authHeader.split(" ")[1];

    // console.log(token, encodedKey)

    const { payload } = await jwtVerify(token, encodedKey);
    if (payload.id) {
      if (typeof payload.id !== 'string') {
        throw new Error("Invalid token payload");
      }
      const uid = payload as unknown as SessionUser;

      const user = await this.getUserById(uid.id);
      if (!user) throw new Error("Unauthorized1");

      console.log(scopes, user)
      if (scopes && scopes.length > 0) {
        if (!user.role || !scopes.some(role => user.role.includes (role))) {
          throw new Error("Unauthorized2");
        }
      }

      return { id: user.id };
    } else {
      if (payload.name && payload.email && payload.picture && payload.sub) {
        const uid = payload as unknown as OauthLoginData;
        return { name: uid.name, email: uid.email, picture: uid.picture, sub: uid.sub };
      } else {
        throw new Error("Invalid token payload");
      }
    }
  } catch (err) {
    void err;
    console.log("JWT ERROR:", err);
    throw new Error("Unauthorized3");
  }
  }

  public async driverLogin(data: OauthLoginData|SessionUser|undefined): Promise<string| undefined> {
    if (data === undefined) {
      throw new Error("Unauthorized");
    }
    if ('id' in data) {
      throw new Error("Unauthorized");
    }

    const query = {
      text: "INSERT INTO account (data) " +
"SELECT jsonb_build_object(" +
  "'name', $1::text, " +
  "'email', $2::text, " +
  "'picture', $3::text, " +
  "'sub', $4::text, " +
  "'role', jsonb_build_array('driver')) " +
  "WHERE NOT EXISTS (" +
  "SELECT 1 FROM account WHERE data->>'sub' = $4::text OR (data->>'email' = $2::text AND data->'role' @> '[\"driver\"]'::jsonb)) RETURNING id",
  values: [
    data.name,
    data.email,
    data.picture,
    data.sub]
  }

    const { rows } = await pool.query(query)
  
    if (rows.length > 0) {
      const userId = rows[0].id
      const retid = await this.encrypt(userId)
      return retid
    } else {
      return undefined
    }
  }
}