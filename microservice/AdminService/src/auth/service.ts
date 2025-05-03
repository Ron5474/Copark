import { EnforcementUser } from "./index";
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
   
}