import { pool } from './db'
import { Vehicle, RegisterVehicleInput, UpdateVehicleInput, VehicleID, createdVehicleInput, CreatedVehicle, OwnerID } from './schema'
import { jwtVerify } from 'jose'

const encodedKey = new TextEncoder().encode(process.env.MICROSERVICE_INTERNAL_SECRET)
// const emailEncodedKey = new TextEncoder().encode(process.env.MICROSERVICE_INTERNAL_SECRET)

export class VehicleService {

  private async decrypt(token: string, key=encodedKey): Promise<string | undefined> {
    try {
      const { payload } = await jwtVerify(token, key)

      return payload.id as string; // Extract the `id` from the payload
    } catch (error) {
      void error;
      console.error('Failed to decrypt token:', error);
      return undefined; // Return undefined if the token is invalid or expired
    }
  }

  public async getMyVehicles(userId: string): Promise<Vehicle[]> {
    // const userDecrypted = await this.decrypt(userId)
    

    const result = await pool.query(
      `SELECT id, data FROM vehicle WHERE driver = $1 AND data->>'deleted' IS NULL`,
      [userId]
    )

    if (result.rows.length == 0) return []

    const defaultVehicle = await this.getDefaultVehicleId(userId)

    return Promise.all(result.rows.map(async row => ({
      id: row.id,
      default: defaultVehicle == null ? false : defaultVehicle.id == row.id,
      plate: row.data.plate,
      country: row.data.country,
      state: row.data.state,
      nickname: row.data.nickname
    })))
  }

  public async findOwnerByVehicleID(vehicleId: string): Promise<OwnerID| null> {

    // const vehicleDecrypted = await this.decrypt(vehicleId)
    
    const result = await pool.query(
      `SELECT driver FROM vehicle WHERE id = $1`,
      [vehicleId]
    )

    if (result.rowCount === 0) return null

    const row = result.rows[0]
    return {
      id: row.driver,
    }
  }
  
  public async getVehicleById(vehicleId: VehicleID): Promise<Vehicle | null> {

    const result = await pool.query(
      `SELECT id, data FROM vehicle WHERE id = $1`,
      [vehicleId.id]
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

  public async getVehicleByUserId(userID: string): Promise<VehicleID[]> {
    const userDecrypted = await this.decrypt(userID)

    // const userDecrypted = await this.decrypt(userID, encodedKey)
    const result = await pool.query(
      `SELECT id FROM vehicle WHERE driver = $1`,
      [userDecrypted]
    )

    // console.log('result', result)

    if (result.rowCount === 0) return []

    console.log('result.rows', result.rows)

    return (result.rows.map(row => ({
      // id: await this.encrypt(row.id),
      id: row.id
    })))
  }

  // private async vehicleExists(plate: string): Promise<{ rowCount: number, rows: { id: string }[] } | null> {
  //   const res = await pool.query(
  //     `SELECT id FROM vehicle WHERE LOWER(data->>'plate') = LOWER($1) AND data->>'deleted' IS NULL`,
  //     [plate]
  //   )
  //   return {rowCount: res.rows.length, rows: res.rows};
  // }
  private async vehicleExists(plate: string, state: string, userID?: string): Promise<{ rowCount: number, rows: { id: string }[] }> {
    if (!userID) {
    const res = await pool.query(
      `SELECT id
        FROM vehicle
          WHERE LOWER(data->>'plate') = LOWER($1)
            AND LOWER(data->>'state') = LOWER($2)
            AND data->>'deleted' IS NULL`,
      [plate, state]
    );

    return {rowCount: res.rows.length, rows: res.rows};
  } else {
    const res = await pool.query(
      `SELECT id
        FROM vehicle
          WHERE LOWER(data->>'plate') = LOWER($1)
            AND LOWER(data->>'state') = LOWER($2)
            AND driver = $3
            AND data->>'deleted' IS NULL`,
      [plate, state, userID]
    );

    return {rowCount: res.rows.length, rows: res.rows};
  }
  }

  public async removeVehicle(plate: string, state: string, userId: string, token?: string): Promise<VehicleID> {
    const existing = await this.vehicleExists(plate, state, userId)
    if (existing.rowCount === 0) {
      throw new Error('Vehicle not found or not owned by user')
    }
    // if (!existing) {
    //   throw new Error('Vehicle not found or not owned by user')
    // }

    const vehicles = await this.getMyVehicles(userId)
    
    if ((vehicles.length) === 1) {
        // console.log('existing', existing)
        throw new Error('Cannot delete the only default vehicle. Please add another vehicle as default first.')
    } else {
      const defaultVehicle = await this.getDefaultVehicleId(userId)
      if (defaultVehicle?.plate === plate) {
        const removed = vehicles.filter(row => row.id !== defaultVehicle.id)
          await this.setDefaultVehicle({ id: removed[0].id }, userId)
      }
    }

    // check if the vehicle has pending tickets
    const pendingTickets = await fetch(`http://localhost:4002/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        query: `
          query GetPendingTickets($plate: String!, $state: String!) {
            pendingTickets(plate: $plate, state: $state) {
              id,
              vehicle
            }
          }
        `,
        variables: { plate, state }
      })
      
    });

    const pendingTicketsData = await pendingTickets.json();
    // console.log('Pending Tickets: ', pendingTicketsData)
    if (pendingTicketsData.data.pendingTickets.length > 0) {
      throw new Error('Vehicle cannot be removed because it has pending tickets');
    }
    
    // expire permits on this vehicle
    await fetch(`http://localhost:4003/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        query: `
          mutation ExpirePermits($vehicleId: String!) {
            expirePermits(vehicleId: $vehicleId) {
              id
            }
          }
        `,
        variables: { vehicleId: existing.rows[0].id }
      })
    });
    // const expirePermitsData = await expirePermits.json();
    // if (expirePermitsData.errors) {
    //   console.error('Error expiring permits: ', expirePermitsData.errors);
    //   throw new Error('Failed to expire permits. Please try again later.');
    // }
    

    const res = await pool.query(
      `UPDATE vehicle
        SET data = jsonb_set(data, '{deleted}', to_jsonb(NOW()))
          WHERE LOWER(data->>'plate') = LOWER($1)
            AND LOWER(data->>'state') = LOWER($2)
            AND driver = $3 RETURNING id`,
      [plate, state, userId]
    )
    // if (res.rowCount === 0) {
    //   throw new Error('Vehicle not found or not owned by user')
    // }
    const rows = res.rows[0]

    return { id: rows.id}
  }

  public async registerVehicle(input: RegisterVehicleInput, userId: string): Promise<Vehicle> {
    const existing = await this.vehicleExists(input.plate, input.state)

    if ((existing?.rowCount as number) > 0) {
      throw new Error('This license plate is already registered')
    }
    const result = await pool.query(
      `INSERT INTO vehicle (driver, data) VALUES ($1, $2) RETURNING id`,
      [
        userId,
        {
          ...input,
          plate: input.plate.toUpperCase()
        }
      ]
    )
 

    const vehicles = await pool.query(
      `SELECT COUNT(*) FROM vehicle WHERE driver = $1 AND data->>'deleted' IS NULL`,
      [userId]
    )
    if (parseInt(vehicles.rows[0].count) == 1) {
      await this.setDefaultVehicle({ id:  result.rows[0].id }, userId)
    }
    const defaultVehicle = await this.getDefaultVehicleId(userId)
    return {
      id: result.rows[0].id,
      default: defaultVehicle == null ? false : defaultVehicle.id == result.rows[0].id,
      ...input
    }
  }
  

  public async updateVehicle(input: UpdateVehicleInput, userId: string): Promise<Vehicle> {
    const { id: vehicleId, ...patch } = input
  
    const existing = await pool.query(
      `SELECT data FROM vehicle WHERE id = $1 AND driver = $2`,
      [vehicleId, userId]
    )
  
    if (existing.rowCount === 0) throw new Error('Vehicle not found or not owned by user')
  
    const updatedData = { ...existing.rows[0].data }
  
    if (!patch.nickname) {
      delete updatedData.nickname
    } else {
      updatedData.nickname = patch.nickname
    }
  
    await pool.query(
      `UPDATE vehicle SET data = $1 WHERE id = $2`,
      [updatedData, vehicleId]
    )
  
    return { id: vehicleId, ...updatedData }
  }

  public async getDefaultVehicle(userId: string): Promise<{
    id: string
    plate: string
    state: string
    nickname?: string
  } | null> {
    const result = await pool.query(
      `SELECT t1.vehicle AS vehicle, t2.data->>'plate' AS plate, t2.data->>'state' as state, t2.data->>'nickname' as nickname  FROM defaultVehicle t1, vehicle t2 WHERE t1.driver = $1 AND t1.vehicle = t2.id`,
      [userId]
    )

    if (result.rowCount === 0) return null

    const row = result.rows[0]
    return {
      id: row.vehicle,
      plate: row.plate,
      state: row.state,
      nickname: row.nickname
    }
  }

  private async getDefaultVehicleId(userId: string): Promise<{
    id: string
    plate: string
  } | null> {
    const result = await pool.query(
      `SELECT t1.vehicle AS vehicle, t2.data->>'plate' AS plate  FROM defaultVehicle t1, vehicle t2 WHERE t1.driver = $1 AND t1.vehicle = t2.id`,
      [userId]
    )

    if (result.rowCount === 0) return null

    const row = result.rows[0]
    return {
      id: row.vehicle,
      plate: row.plate
    }
  }

  public async setDefaultVehicle(vehicleID: VehicleID, userId: string): Promise<VehicleID> {
    const vehicleDecrypted = vehicleID.id

    const existing = await pool.query(
      `SELECT * FROM defaultVehicle WHERE driver = $1`,
      [userId]
    )

    if (existing.rowCount === 0) {
      await pool.query(
        `INSERT INTO defaultVehicle (driver, vehicle) VALUES ($1, $2)`,
        [userId, vehicleDecrypted]
      )

      return { id: vehicleID.id }
    }

    await pool.query(
      `UPDATE defaultVehicle SET vehicle = $1 WHERE driver = $2`,
      [vehicleDecrypted, userId]
    )

    return {id: vehicleID.id}
  }

  // public async findVehicleByPlate(plate: string): Promise<Vehicle | null> {
  //   const result = await pool.query(
  //     `SELECT id, data FROM vehicle WHERE data->>'plate' = $1 AND data->>'deleted' IS NULL`,
  //     [plate]
  //   )

  //   if (result.rowCount === 0) return null


  //   const row = result.rows[0]
  //   return {
  //     id: row.id,
  //     plate: row.data.plate,
  //     country: row.data.country,
  //     state: row.data.state,
  //     nickname: row.data.nickname
  //   }
  // }


  public async findVehicleByPlate(
    plate: string,
    state: string
  ): Promise<Vehicle | null> {
    console.log('Finding vehicle by plate:', plate, 'and state:', state);
    const result = await pool.query(
      `SELECT id, data
        FROM vehicle
        WHERE LOWER(data->>'plate') = LOWER($1)
          AND LOWER(data->>'state') = LOWER($2)
          AND data->>'deleted' IS NULL
      `,
      [plate, state]
    );

    if (result.rowCount === 0) return null;
    console.log('result', result)
    const row = result.rows[0];
    return {
      id:       row.id,
      plate:    row.data.plate,
      country:  row.data.country,
      state:    row.data.state,
      nickname: row.data.nickname
    };
  }

  public async createUnregisteredVehicle(input: createdVehicleInput): Promise<CreatedVehicle> {
    const result = await pool.query(
      `INSERT INTO vehicle (driver, data) VALUES ($1, $2) RETURNING id`,
      [null, JSON.stringify(input)]
    );

    return {
      id: result.rows[0].id,
      ...input,
    };
  }
}
