
import { pool } from "./db";
import { SessionUser } from "../index";
import { AuthUser, Credentials, User, OauthLoginData} from "./index";
import { OauthUser } from "../index.d";

import { SignJWT, jwtVerify } from 'jose'

// console.log(process.env.JWT_SECRET);
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
      const retid = await this.encrypt(user.id)
      return { id: retid, name: user.name, role: user.role };
    } else {
      return undefined
    }
  }

  public async getOauthUser(data: OauthLoginData|SessionUser|undefined): Promise<OauthUser| undefined> {
    if (data === undefined) {
      throw new Error("Unauthorized");
    }

    if (data.type !== "OauthUserData") { 
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
      return {
        type: "OauthUser",
        id: user.id,
        picture: data.picture,
        sub: data.sub,
        name: user.data.name,
        role: user.data.role,
        email: user.data.email,
      }
    }
  }

  public async getDriverByID(driverID: string): Promise<AuthUser| undefined> {
    return this.getUserById(driverID)
  }

  public async encrypt(userId: string): Promise<string> {
    return new SignJWT({ id: userId })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('30m')
      .sign(internalKey)
  }

  // public async encryptNum(userId: number): Promise<string> {
  //   return new SignJWT({ id: userId })
  //     .setProtectedHeader({ alg: 'HS256' })
  //     .setIssuedAt()
  //     .setExpirationTime('5y')
  //     .sign(internalKey)
  // }

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

  public async getIDByEmail(email: string): Promise<string | null> {
    // "SELECT id FROM account WHERE data->>'email' = $1 AND data->>'deleted' IS NULL"
    const query = {
      text: "SELECT id FROM account WHERE data->>'email' = $1",
      values: [email],
    };

    const res = await pool.query(query);
    if (res.rows.length === 0) {
      return null;
    } else {
      const userId = res.rows[0].id;
      return this.encrypt(userId);
    }
  }

  public async check(authHeader?: string, scopes?: string[]): Promise<SessionUser|OauthUser> {
    if (!authHeader) {
      throw new Error("Unauthorized");
    }

    try {
      const token = authHeader.split(" ")[1];

      const { payload } = await jwtVerify(token, encodedKey);
      if (payload.id) {
        if (typeof payload.id !== 'string') {
          throw new Error("Invalid token payload");
        }
        const uid = payload as unknown as SessionUser;
        const user = await this.getUserById(uid.id);
        if (!user) throw new Error("Unauthorized1");

        if (scopes && scopes.length > 0) {
          if (!user.role || !scopes.some(role => user.role.includes (role))) {
            throw new Error("Unauthorized2");
          }
        }

        return {type: "SessionUser", id: user.id };
      } else {
        if (payload.name && payload.email && payload.picture && payload.sub) {
          const payloadObj = payload as unknown as OauthLoginData;
          const uid: OauthLoginData = {
            type: "OauthUserData",
            name: payloadObj.name,
            email: payloadObj.email,
            picture: payloadObj.picture,
            sub: payloadObj.sub
          };
          const user = await this.getOauthUser(uid);
          if (!user) throw new Error("Unauthorized1");
          if (scopes && scopes.length > 0) {
            if (!user.role || !scopes.some(role => user.role.includes (role))) {
              throw new Error("Unauthorized2");
            }
          }
          return {type: "OauthUser", id: user.id, name: uid.name, email: uid.email, picture: uid.picture, sub: uid.sub, role: user.role };
        } else {
          throw new Error("Invalid token payload");
        }
      }
    } catch (err) {
      void err;
      // console.log("Error in check:", err);
      throw new Error("Unauthorized3");
    }
  }

  public async activeDriver(userId: string|undefined): Promise<string| undefined> {
    if (userId === undefined) {
      throw new Error("Unauthorized");
    }
    const query = {
      text: "SELECT * FROM account WHERE id = $1 AND  data->>'onboardingStatus' = 'complete'",
      values: [userId]
    }

    const { rows } = await pool.query(query)

    if (rows.length > 0) {
      return rows[0].data.onboardingStatus
    } else {
      return undefined
    }
  }

  public async driverSignup(data: OauthLoginData|SessionUser|undefined): Promise<string| undefined> {
    if (data === undefined) {
      throw new Error("Unauthorized");
    }
    if ('id' in data) {
      throw new Error("Unauthorized");
    }
    try {
    const query = {
      text: `
      INSERT INTO account (data)
      SELECT jsonb_build_object(
        'name', $1::text,
        'email', $2::text,
        'picture', $3::text,
        'sub', $4::text,
        'role', jsonb_build_array('driver'),
        'onboardingStatus', 'tos',
        'created_at', now()
      )
      WHERE NOT EXISTS (
        SELECT 1
        FROM account
        WHERE data->>'sub' = $4::text
          OR (data->>'email' = $2::text
              AND data->'role' @> '["driver"]'::jsonb
             )
      )
      RETURNING id`,

      values: [
        data.name,
        data.email,
        data.picture,
        data.sub
      ]
    }
    
    const { rows } = await pool.query(query)
    
    if (rows.length > 0) {
      const userId = rows[0].id
      const retid = await this.encrypt(userId)
      return retid
    } else {
      const onboardingStatus = {
        text: "SELECT data->>'onboardingStatus' AS status FROM account WHERE data->>'email' = $1::text",
        values: [data.email]
      }

      const { rows } = await pool.query(onboardingStatus)

      switch (rows[0].status) {
        case "tos":
          return "tos"
        case "first-vehicle":
          return "first-vehicle"
        case "complete":
          return undefined
      }
    }
  } catch (err) {
    console.log("Error in driverSignup:", err);
    throw new Error("Unauthorized");
  }
  }

  public async decryptOauth(token: string): Promise<OauthLoginData|undefined> {
    try {
      const { payload } = await jwtVerify(token, encodedKey);
      if (payload.name && payload.email && payload.picture && payload.sub) {
        const uid = payload as unknown as OauthLoginData;
        return {type: "OauthUserData", name: uid.name, email: uid.email, picture: uid.picture, sub: uid.sub };
      } else {
        throw new Error("Invalid token payload");
      }
    } catch (err) {
      console.log("Error in decryptOauth:", err);
      return undefined;
    }
  }

  public async setOnBoardingState(userId: string|undefined, newState: string): Promise<void> {
    if (userId === undefined) {
      throw new Error("Unauthorized");
    }
    const query = {
      text: "UPDATE account SET data = jsonb_set(data, '{onboardingStatus}', $1::jsonb) WHERE id = $2",
      values: [JSON.stringify(newState), userId],
    };

    await pool.query(query);
  }
}

