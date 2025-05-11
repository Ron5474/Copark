import { pool } from './db'
import { Receipt, PurchaseZoneInput, IsValid, IsValidPermitInput, IsValidPolice } from './schema'

export class PermitService {
  public async purchaseMyZonePermit(input: PurchaseZoneInput): Promise<Receipt> {

    const totalMinutes = (input.duration?.hours || 0) * 60 + (input.duration?.minutes || 0)


    // price service use here
    const price = 3.00 / 60 * totalMinutes


    // Stripe processing goes here


    const today = new Date()

    const purchaseDate = today.toISOString()
    const activeDate = today.toISOString()
    
    const durationMs = totalMinutes * 60 * 1000
    const expireDate = new Date(today.getTime() + durationMs).toISOString()

    const data = {
      permitType: 'zone',
      zone: input.zone,
      purchaseDate,
      activeDate,
      expireDate,
      price,
      paymentMethod: input.paymentMethod,
    }

    const { rows } = await pool.query(`
      INSERT INTO permit (vehicle, data)
      VALUES ($1, $2)
      RETURNING data`,
      [input.vehicle, data]
    )

    // if (rows.length == 0) throw new Error('Purchase unsuccessful')
    return {
      type: rows[0].data.permitType,
      zone: rows[0].data.zone,
      purchaseDate: rows[0].data.purchaseDate,
      activeDate: rows[0].data.activeDate,
      expireDate: rows[0].data.expireDate,
      price: rows[0].data.price,
    }
  }

  // public async isValidPermit(vehicleId: IsValidInput): Promise<IsValid> {

  //   const result = await pool.query(`
  //     SELECT data
  //     FROM permit
  //     WHERE vehicle = $1
  //     AND now() >= (data->>'activeDate')::timestamptz
  //     AND now() <= (data->>'expireDate')::timestamptz`,
  //     [vehicleId.vehicle]
  //   )

  //   if (result.rowCount === 0) return { isValid: false, type: 'N/A', zone: 'N/A' }

  //   const row = result.rows[0]
  //   return {
  //     isValid: true,
  //     type: row.data.type,
  //     zone: row.data.type,
  //   }
  // }

  public async isValidZonePermit(input: IsValidPermitInput): Promise<IsValid> {

    const result = await pool.query(`
      SELECT data
      FROM permit
      WHERE vehicle = $1
      AND data->>'zone' = $2
      AND now() >= (data->>'activeDate')::timestamptz
      AND now() <= (data->>'expireDate')::timestamptz`,
      [input.vehicle, input.zone]
    )

    if (result.rowCount === 0) return { isValid: false, type: 'N/A', zone: input.zone }

    const row = result.rows[0]
    return {
      isValid: true,
      type: row.data.type,
      zone: row.data.type,
    }
  }

  public async isValidPermitPolice(vid: string): Promise<IsValidPolice> {

    const result = await pool.query(`
        SELECT data
        FROM permit
        WHERE vehicle = $1
        AND now() >= (data->>'activeDate')::timestamptz
        AND now() <= (data->>'expireDate')::timestamptz
      `,
      [vid]
    )

    if (result.rowCount === 0) return { isValid: false }
    return { isValid: true }
  }

//   public async getMyPermits(vid: string): Promise<IsValid> {

//     // const result = await pool.query(`
//     //     WITH active AS (
//     //       SELECT f.member1 AS id, m.data->>'name' AS name
//     //       FROM friend f
//     //       JOIN member m ON m.id = f.member1
//     //       WHERE f.member2 = $1
//     //       AND (m.data->>'active')::boolean = true
//     //       AND (f.data->>'accepted')::boolean = false
//     //       AND (f.data->>'active')::boolean = true
//     //     ),
//     //     expired AS (
//     //       SELECT f.member2 AS id, m.data->>'name' AS name
//     //       FROM friend f
//     //       JOIN member m ON m.id = f.member2
//     //       WHERE f.member1 = $1
//     //       AND (m.data->>'active')::boolean = true
//     //       AND (f.data->>'accepted')::boolean = false
//     //       AND (f.data->>'active')::boolean = true
//     //     )
//     //     SELECT
//     //       COALESCE((SELECT json_agg(inbound) FROM inbound), '[]') AS inbound,
//     //       COALESCE((SELECT json_agg(outbound) FROM outbound), '[]') AS outbound;
//     //   `,
//     //   [vid]
//     // )

//     if (result.rowCount === 0) return { isValid: false, type: 'N/A', zone: input.zone }

//     const row = result.rows[0]
//     return {
//       isValid: true,
//       type: row.data.type,
//       zone: row.data.type,
//     }
//   }
}
