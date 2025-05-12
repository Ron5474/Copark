import { SignJWT } from 'jose'
import { vehiclePool, ticketPool } from './db';

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

  public async getAllVehicles() {
    const result = await vehiclePool.query(
      `SELECT id, data FROM vehicle`
    )

    if (result.rows.length == 0) return []

    return Promise.all(result.rows.map(async row => ({
      id: await this.encrypt(row.id), 
      plate: row.data.plate,
      country: row.data.country,
      state: row.data.state,
      nickname: row.data.nickname
    })))
  }

  public async getAllTickets() {
    const result = await ticketPool.query(`
      SELECT 
        id,
        vehicle,
        enforcer,
        data->>'issuedDate' AS issueddate,
        data->>'violation' AS violation,
        data->>'fine' AS fine,
        data->>'ticketStatus' AS ticketstatus,
        data->>'images' AS images
      FROM ticket
      WHERE data->>'ticketStatus' != 'deleted'
      ORDER BY data->>'issuedDate'
    `)

    if (result.rows.length === 0) return []

    return Promise.all(result.rows.map(async row => ({
      id: await this.encrypt(row.id),
      vehicle: await this.encrypt(row.vehicle),
      enforcer: await this.encrypt(row.enforcer),
      issuedDate: new Date(row.issueddate),
      violation: row.violation,
      fine: parseFloat(row.fine),
      ticketStatus: row.ticketstatus,
      images: row.images
    })))
  }
}