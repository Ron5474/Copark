import { pool } from './db'
import {
  Confirmation,
  Receipt,
  PurchaseZoneInput,
  IsValid,
  IsValidPermitInput,
  IsValidPolice,
  MyPermits,
  ZoneDetails,
  Permit
} from './schema'

export class PermitService {
  public async purchaseMyZonePermit(input: PurchaseZoneInput): Promise<Confirmation> {

    const totalMinutes = (input.duration?.hours || 0) * 60 + (input.duration?.minutes || 0)


    // price service use here
    const service = 0.50
    const subTotal = 3.00 / 60 * totalMinutes
    const tax = (service + subTotal) * 0.0925
    const total = service + subTotal + tax
    const receipt = {
      tax,
      service,
      subTotal,
      total
    } as Receipt


    // Stripe processing goes here


    const today = new Date()

    const purchaseDate = today.toISOString()
    const activeDate = today.toISOString()
    
    const durationMs = totalMinutes * 60 * 1000
    const expireDate = new Date(today.getTime() + durationMs).toISOString()

    const data = {
      type: 'zone',
      purchaseDate,
      activeDate,
      expireDate,
      receipt,
      paymentMethod: input.paymentMethod,
    }

    const { rows } = await pool.query(`
      WITH selected_zone AS (
        SELECT id FROM zone
        WHERE TRIM(LOWER(data->>'zone')) = TRIM(LOWER($2))
        LIMIT 1
      )
      INSERT INTO permit (vehicle, zone, data)
      SELECT $1, id, $3 FROM selected_zone
      RETURNING zone, data
    `, [input.vehicle, input.zone, data])


    if (!rows.length) {
      throw new Error(`Zone ${input.zone} not found`)
    }

    return {
      type: rows[0].data.type,
      zone: rows[0].zone,
      purchaseDate: rows[0].data.purchaseDate,
      activeDate: rows[0].data.activeDate,
      expireDate: rows[0].data.expireDate,
      receipt: rows[0].data.receipt,
      paymentMethod: rows[0].data.paymentMethod,
    }
  }

  public async isValidZonePermit(input: IsValidPermitInput): Promise<IsValid> {

    const result = await pool.query(`
      SELECT p.data
      FROM permit p
      JOIN zone z ON z.id = p.zone
      WHERE p.vehicle = $1
        AND TRIM(LOWER(z.data->>'zone')) = TRIM(LOWER($2))
        AND now() >= (p.data->>'activeDate')::timestamptz
        AND now() <= (p.data->>'expireDate')::timestamptz`,
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

  public async getMyPermits(vid: string): Promise<MyPermits> {

    const result = await pool.query(`
        WITH future AS (
          SELECT data->>'vehicle' AS vehicle,
            data->>'type' AS type,
            "zone",
            data->>'activeDate' AS activeDate,
            data->>'expireDate' AS expireDate
          FROM permit
          WHERE vehicle = $1
          AND now() <= (data->>'activeDate')::timestamptz
        ),
        active AS (
          SELECT data->>'vehicle' AS vehicle,
            data->>'type' AS type,
            "zone",
            data->>'activeDate' AS activeDate,
            data->>'expireDate' AS expireDate
          FROM permit
          WHERE vehicle = $1
          AND now() >= (data->>'activeDate')::timestamptz
          AND now() <= (data->>'expireDate')::timestamptz
        ),
        expired AS (
          SELECT data->>'vehicle' AS vehicle,
            data->>'type' AS type,
            "zone",
            data->>'activeDate' AS activeDate,
            data->>'expireDate' AS expireDate
          FROM permit
          WHERE vehicle = $1
          AND now() >= (data->>'expireDate')::timestamptz
        )
        SELECT
          COALESCE((SELECT json_agg(future) FROM future), '[]') AS future,
          COALESCE((SELECT json_agg(active) FROM active), '[]') AS active,
          COALESCE((SELECT json_agg(expired) FROM expired), '[]') AS expired;
      `,
      [vid]
    )

    return result.rows[0]
  }

  public async getZoneDetails(zone: string, currentDay=new Date().getDay()): Promise<ZoneDetails> {
    const isWeekend = currentDay === 0 || currentDay === 6

    const result = await pool.query(`
        SELECT data
        FROM "zone"
        WHERE data->>'zone' = $1
      `,
      [zone]
    )
    
    if (result.rowCount == 0) throw new Error(`Zone does not exist: ${zone}`)
    return isWeekend ? result.rows[0].data.weekend : result.rows[0].data.weekday
  }

  public async getAllPermitsByDay(): Promise<Record<string, Permit[]>> {
    const permitQuery = `
      SELECT 
        id,
        vehicle,
        zone,
        data->>'type' AS type,
        data->>'purchaseDate' AS purchaseDate,
        data->>'activeDate' AS activeDate,
        data->>'expireDate' AS expireDate,
        data->>'receipt' AS receipt,
        data->>'paymentMethod' AS paymentMethod
      FROM permit
      ORDER BY data->>'activeDate';
    `;

    const permitResults = await pool.query(permitQuery);
    const permitsByDay: Record<string, Permit[]> = {};

    for (const row of permitResults.rows) {
      const date = new Date(row.activeDate).toISOString().split('T')[0]; // YYYY-MM-DD
      const permit = {
        id: row.id,
        vehicle: row.vehicle,
        zone: row.zone,
        type: row.type,
        purchaseDate: row.purchaseDate,
        activeDate: row.activeDate,
        expireDate: row.expireDate,
        receipt: row.receipt,
        paymentMethod: row.paymentMethod
      };
      if (!permitsByDay[date]) {
        permitsByDay[date] = [];
      }
      permitsByDay[date].push(permit);
    }

    return permitsByDay;
  }
}
