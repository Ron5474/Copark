import { pool } from './db'
import { Vehicle, RegisterVehicleInput, UpdateVehicleInput } from './schema'

export class VehicleService {
  public async getMyVehicles(userId: string): Promise<Vehicle[]> {
    const result = await pool.query(
      `SELECT id, data FROM vehicle WHERE driver = $1`,
      [userId]
    )

    if (result.rows.length == 0) return []
    return result.rows.map(row => ({
      id: row.id,
      plate: row.data.plate,
      country: row.data.country,
      state: row.data.state,
      nickname: row.data.nickname
    }))
  }

  public async registerVehicle(userId: string, input: RegisterVehicleInput): Promise<Vehicle> {
    const result = await pool.query(
      `INSERT INTO vehicle (driver, data) VALUES ($1, $2) RETURNING id`,
      [userId, input]
    )

    return {
      id: result.rows[0].id,
      ...input
    }
  }

  public async updateVehicle(userId: string, input: UpdateVehicleInput): Promise<Vehicle> {
    const { id, ...patch } = input

    const existing = await pool.query(
      `SELECT data FROM vehicle WHERE id = $1 AND driver = $2`,
      [id, userId]
    )

    if (existing.rowCount === 0) throw new Error('Vehicle not found or not owned by user')

    const updated = {
      ...existing.rows[0].data,
      ...patch
    }

    await pool.query(
      `UPDATE vehicle SET data = $1 WHERE id = $2`,
      [updated, id]
    )

    return { id, ...updated }
  }

  public async findVehicleByPlate(plate: string): Promise<Vehicle | null> {
    const result = await pool.query(
      `SELECT id, data FROM vehicle WHERE data->>'plate' = $1`,
      [plate]
    )

    if (result.rowCount === 0) return null

    const row = result.rows[0]
    return {
      id: row.id,
      plate: row.data.plate,
      country: row.data.country,
      state: row.data.state,
      nickname: row.data.nickname
    }
  }
}
