import { pool } from './db'
import { Vehicle, RegisterVehicleInput, UpdateVehicleInput, VehicleID } from './schema'
import { SignJWT, jwtVerify } from 'jose'

const encodedKey = new TextEncoder().encode(process.env.MICROSERVICE_INTERNAL_SECRET + 'apiexit')
const emailEncodedKey = new TextEncoder().encode(process.env.MICROSERVICE_INTERNAL_SECRET)

export class VehicleService {

  private async encrypt(userId: string, key=encodedKey): Promise<string> {
      return new SignJWT({ id: userId })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('30m')
        .sign(key)
    }

  private async decrypt(token: string, key=encodedKey): Promise<string | undefined> {
    try {
      const { payload } = await jwtVerify(token, key)

      return payload.id as string; // Extract the `id` from the payload
    } catch (error) {
      void error;
      // console.error('Failed to decrypt token:', error);
      return undefined; // Return undefined if the token is invalid or expired
    }
  }

  public async getMyVehicles(userId: string): Promise<Vehicle[]> {
    // const userDecrypted = await this.decrypt(userId)

    const result = await pool.query(
      `SELECT id, data FROM vehicle WHERE driver = $1`,
      [userId]
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
  
  public async getVehicleById(vehicleId: VehicleID): Promise<Vehicle | null> {

    const vehicleDecrypted = await this.decrypt(vehicleId.id)

    const result = await pool.query(
      `SELECT data FROM vehicle WHERE id = $1`,
      [vehicleDecrypted]
    )

    if (result.rowCount === 0) return null

    const row = result.rows[0]
    return {
      id: await this.encrypt(row.id),
      plate: row.data.plate,
      country: row.data.country,
      state: row.data.state,
      nickname: row.data.nickname
    }
  }

  public async getVehicleByUserId(userID: string): Promise<VehicleID[]> {

    // const userDecrypted = await this.decrypt(userID, emailEncodedKey)
    const userDecrypted = await this.decrypt(userID, encodedKey)

    const result = await pool.query(
      `SELECT id FROM vehicle WHERE driver = $1`,
      [userDecrypted]
    )

    if (result.rowCount === 0) return []

    return Promise.all(result.rows.map(async row => ({
      // id: await this.encrypt(row.id),
      id: row.id
    })))
  }

  public async registerVehicle(userId: string, input: RegisterVehicleInput): Promise<Vehicle> {
    // const userDecrypted = await this.decrypt(userId)
    const result = await pool.query(
      `INSERT INTO vehicle (driver, data) VALUES ($1, $2) RETURNING id`,
      [userId, input]
    )

    return {
      id: await this.encrypt(result.rows[0].id),
      ...input
    }
  }

  public async updateVehicle(userId: string, input: UpdateVehicleInput): Promise<Vehicle> {
    const { id, ...patch } = input

    const vehicleID = await this.decrypt(id)
    // const userIdDecrypted = await this.decrypt(userId)

    const existing = await pool.query(
      `SELECT data FROM vehicle WHERE id = $1 AND driver = $2`,
      [vehicleID, userId]
    )

    if (existing.rowCount === 0) throw new Error('Vehicle not found or not owned by user')

    const updated = {
      ...existing.rows[0].data,
      ...patch
    }

    await pool.query(
      `UPDATE vehicle SET data = $1 WHERE id = $2`,
      [updated, vehicleID]
    )

    // id is the encrypted vehicle id
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
