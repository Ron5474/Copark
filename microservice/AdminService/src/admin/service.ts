import { EnforcementUser, NewEnforcementUser } from "./index";
import { pool } from "./db";
import { SignJWT } from 'jose'

const encodedKey = new TextEncoder().encode(process.env.MASTER_SECRET + 'apiexit')

export class AdminService {

  private async encrypt(userId: string): Promise<string> {
    return new SignJWT({ id: userId })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('30m')
      .sign(encodedKey)
  }

  public async getEnforcers(): Promise<EnforcementUser[]> {

    const enforcementQuery = `
        SELECT id,
        data->>'name' AS name,
        data->>'email' AS email,
        data->>'accountStatus' AS accountStatus
        FROM account
        WHERE data->>'role' = 'enforcement';
    `

    const enforcementResult = await pool.query(enforcementQuery);

    const enforcers: EnforcementUser[] = [];

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

  public async addEnforcer(enforcer: NewEnforcementUser): Promise<EnforcementUser[]> {
    const insertQuery = `
        INSERT INTO account (data)
        VALUES (
            jsonb_build_object(
                'name', $1::text,
                'email', $2::text,
                'pwhash', crypt($3::text, gen_salt('bf')),
                'role', 'enforcement',
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

    const enforcers: EnforcementUser[] = [];

    for (const row of result.rows) {
        enforcers.push({
            id: await this.encrypt(row.id),
            name: row.name,
            accountStatus: row.accountstatus,
            email: row.email
        });
    }

    return enforcers;
  }
   
}