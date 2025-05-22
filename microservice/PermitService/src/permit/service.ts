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
  NewZone,
  Permit,
  PermitsByDay
} from './schema'

export class PermitService {
  public async purchaseMyZonePermit(input: PurchaseZoneInput): Promise<Confirmation> {

    const totalMinutes = (input.duration?.hours || 0) * 60 + (input.duration?.minutes || 0)


    const { hourly } = await this.getZoneDetails(input.zone)
    const service = 0.50
    const subTotal = (hourly as number) / 60 * totalMinutes
    const total = service + subTotal
    const receipt = {
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
      purchaseDate,
      activeDate,
      expireDate,
      receipt,
      paymentMethod: input.paymentMethod,
    }

    const { rows } = await pool.query(`
      WITH selected_zone AS (
        SELECT id FROM type
        WHERE data->>'name' = 'zone'
        AND TRIM(LOWER(data->>'area')) = TRIM(LOWER($2))
        LIMIT 1
      )
      INSERT INTO permit (vehicle, type, data)
      SELECT $1, id, $3 FROM selected_zone
      RETURNING type, data
    `, [input.vehicle, input.zone, data])

    // TODO: Hit email api to send confirmation and receipt
    return {
      type: 'zone',
      area: input.zone,
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
      JOIN type t ON t.id = p.type
      WHERE p.vehicle = $1
        AND TRIM(LOWER(t.data->>'area')) = TRIM(LOWER($2))
        AND now() >= (p.data->>'activeDate')::timestamptz
        AND now() <= (p.data->>'expireDate')::timestamptz`,
      [input.vehicle, input.zone]
    )

    if (result.rowCount === 0) return { isValid: false, type: 'N/A', area: input.zone }

    const row = result.rows[0]
    return {
      isValid: true,
      type: row.data.type,
      area: row.data.type,
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
            type,
            data->>'activeDate' AS activeDate,
            data->>'expireDate' AS expireDate
          FROM permit
          WHERE vehicle = $1
          AND now() <= (data->>'activeDate')::timestamptz
        ),
        active AS (
          SELECT data->>'vehicle' AS vehicle,
            type,
            data->>'activeDate' AS activeDate,
            data->>'expireDate' AS expireDate
          FROM permit
          WHERE vehicle = $1
          AND now() >= (data->>'activeDate')::timestamptz
          AND now() <= (data->>'expireDate')::timestamptz
        ),
        expired AS (
          SELECT data->>'vehicle' AS vehicle,
            type,
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
        FROM type
        WHERE data->>'name' = 'zone'
        AND data->>'area' = $1
      `,
      [zone]
    )
    
    if (result.rowCount == 0) throw new Error(`Zone ${zone} not found`)
    return isWeekend ? result.rows[0].data.weekend : result.rows[0].data.weekday
  }

  public async getAllPermitsByDay(): Promise<PermitsByDay[]> {
    const permitQuery = `
      SELECT 
        id,
        vehicle,
        type,
        data->>'purchaseDate' AS purchasedate,
        data->>'activeDate' AS activedate,
        data->>'expiresDate' AS expiresdate,
        data->>'receipt' AS receipt,
        data->>'paymentMethod' AS paymentmethod,
        data->>'area' AS area
      FROM permit
      ORDER BY data->>'activedate';
    `;

    const permitResults = await pool.query(permitQuery);
    const permitsByDayMap: Record<string, Permit[]> = {};

    for (const row of permitResults.rows) {
      // console.log(row.purchasedate)
      const date = row.purchasedate.split('T')[0];
      // console.log('date', date)
      const permit: Permit = {
        vehicle: row.vehicle,
        type: row.type,
        area: row.area,
        activeDate: row.activedate,
        expireDate: row.expiresdate,
      };
      // console.log('permit', permit)

      if (!permitsByDayMap[date]) {
        permitsByDayMap[date] = [];
      }
      permitsByDayMap[date].push(permit);
    }

    const permitsByDay: PermitsByDay[] = Object.entries(permitsByDayMap).map(([date, permits]) => ({
      date,
      permits
    }));

    return permitsByDay;
  }

  public async createNewZone(input: NewZone): Promise<boolean> {
    const { rows } = await pool.query(`
      INSERT INTO zone (data)
      SELECT $1
      WHERE NOT EXISTS (
        SELECT 1 FROM zone
        WHERE data->>'zone' = $1->>'zone'
          AND data->>'location' = $1->>'location'
      )
      RETURNING id, data
    `, [input])
  
    return (rows.length !== 0)
  }
}
