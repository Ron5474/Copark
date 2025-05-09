import { pool } from './db'
import { Permit/*, RegisterVehicleInput, UpdateVehicleInput*/ } from './schema'

export class PermitService {
  public async getMyPermits(userId: string): Promise<Permit[]> {
    const result = await pool.query(`
      SELECT id, vehicle, data
      FROM permit
      WHERE vehicle = $1`,
      [userId]
    )

    if (result.rows.length == 0) return []
    return result.rows.map(row => ({
      id: row.id,
      permitType: row.data.permitType,
      purchaseDate: row.data.purchaseDate,
      expiresDate: row.data.expiresDate,
    }))
  }
}
