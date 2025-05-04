
import { SessionUser } from "../index";
import { AuthUser, Credentials, User } from "./index";
import { pool } from "./db";
import { SignJWT, jwtVerify } from 'jose'

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
      const retid = await this.encrypt(user.id)
      console.log("retid", retid)
      const { payload } = await jwtVerify(retid, encodedKey);
      console.log("payload", payload)
      return { id: retid, name: user.name, role: user.role };
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
        role: data.role,
      };
    }
  }

  public async check(
  authHeader?: string,
  scopes?: string[]
): Promise<SessionUser> {
  if (!authHeader) {
    throw new Error("Unauthorized");
  }

  try {
    const token = authHeader.split(" ")[1];

    // console.log(token, encodedKey)

    const { payload } = await jwtVerify(token, encodedKey);
    if (typeof payload.id !== 'string') {
      throw new Error("Invalid token payload");
    }
    const uid = payload as unknown as SessionUser;

    const user = await this.getUserById(uid.id);
    if (!user) throw new Error("Unauthorized1");

    // console.log(scopes, user)
    if (scopes) {
      if (!user.role || !scopes.some(role => user.role.includes(role))) {
        throw new Error("Unauthorized2");
      }
    }

    return { id: user.id };
  } catch (err) {
    console.log("JWT ERROR:", err);
    throw new Error("Unauthorized3");
  }
}
}