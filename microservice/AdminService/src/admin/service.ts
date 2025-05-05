import { User, UserInput, NewUser } from "./schema";
import { pool } from "./db";
import { SignJWT, jwtVerify } from 'jose'

const encodedKey = new TextEncoder().encode(process.env.MASTER_SECRET + 'apiexit')

export class AdminService {
  private async encrypt(userId: string): Promise<string> {
    return new SignJWT({ id: userId })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('30m')
      .sign(encodedKey)
  }

  private async decrypt(token: string): Promise<string | undefined> {
    try {
      const { payload } = await jwtVerify(token, encodedKey)

      return payload.id as string; // Extract the `id` from the payload
    } catch (error) {
      void error;
      // console.error('Failed to decrypt token:', error);
      return undefined; // Return undefined if the token is invalid or expired
    }
  }

  public async getEnforcers(): Promise<User[]> {
    const enforcementQuery = `
        SELECT id,
        data->>'name' AS name,
        data->>'email' AS email,
        data->>'accountStatus' AS accountStatus
        FROM account
        WHERE data->>'role' = '["enforcement"]'
        AND data->>'accountStatus' != 'deleted';
    `

    const enforcementResult = await pool.query(enforcementQuery);

    const enforcers: User[] = [];

    for (const row of enforcementResult.rows) {
      enforcers.push({
        id: await this.encrypt(row.id),
        name: row.name,
        accountStatus: row.accountstatus,
        email: row.email
      });
    }

    return enforcers;
  }

  public async getDrivers(): Promise<User[]> {
      const driverQuery = `
          SELECT id,
          data->>'name' AS name,
          data->>'email' AS email,
          data->>'accountStatus' AS accountStatus
          FROM account
          WHERE data->>'role' = '["driver"]'
          AND data->>'accountStatus' != 'deleted';
      `

      const driverResult = await pool.query(driverQuery);

      const drivers: User[] = [];

      for (const row of driverResult.rows) {
        drivers.push({
          id: await this.encrypt(row.id),
          name: row.name,
          accountStatus: row.accountstatus,
          email: row.email
        });
      }

      return drivers;
  }

  public async addEnforcer(enforcer: NewUser): Promise<User[]> {
    const insertQuery = `
    INSERT INTO account (data)
    VALUES (
      jsonb_build_object(
        'name', $1::text,
        'email', $2::text,
        'pwhash', crypt($3::text, gen_salt('bf')),
        'role', '["enforcement"]',
        'accountStatus', 'active'
      )
    )
    RETURNING id, data->>'name' AS name, data->>'email' AS email, data->>'accountStatus' AS accountStatus;
    `;

    // Generate a random password of length 8
    const generateRandomPassword = (): string => {
      return Math.random().toString(36).slice(-8);
    };

    const randomPassword = generateRandomPassword();

    const result = await pool.query(insertQuery, [enforcer.name, enforcer.email, randomPassword]);

    const enforcers: User[] = [];

    for (const row of result.rows) {
      enforcers.push({
        id: await this.encrypt(row.id),
        name: row.name,
        accountStatus: row.accountstatus,
        email: row.email,
        password: randomPassword
      });
    }

    return enforcers;
  }

  public async suspendUser(user: UserInput): Promise<User[]> {
    const updateQuery = `
      UPDATE account
      SET data = jsonb_set(data, '{accountStatus}', '"suspended"')
      WHERE id = $1
      RETURNING id, data->>'name' AS name, data->>'email' AS email, data->>'accountStatus' AS accountStatus;
    `;
  
    const result = await pool.query(updateQuery, [await this.decrypt(user.id)]);
  
    const Users: User[] = [];
  
    for (const row of result.rows) {
      Users.push({
        id: await this.encrypt(row.id),
        name: row.name,
        accountStatus: row.accountstatus,
        email: row.email,
      });
    }
  
    return Users;
  }

  public async reinstateUser(user: UserInput): Promise<User[]> {
    const updateQuery = `
      UPDATE account
      SET data = jsonb_set(data, '{accountStatus}', '"active"')
      WHERE id = $1
      RETURNING id, data->>'name' AS name, data->>'email' AS email, data->>'accountStatus' AS accountStatus;
    `;
  
    const result = await pool.query(updateQuery, [await this.decrypt(user.id)]);
  
    const Users: User[] = [];
  
    for (const row of result.rows) {
      Users.push({
        id: await this.encrypt(row.id),
        name: row.name,
        accountStatus: row.accountstatus,
        email: row.email,
      });
    }
  
    return Users;
  }
}