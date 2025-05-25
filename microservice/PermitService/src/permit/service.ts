import { pool } from './db'
import {
  Confirmation,
  Receipt,
  PurchaseZoneInput,
  IsValid,
  IsValidPolice,
  MyPermits,
  ZoneDetails,
  NewZone,
  Permit,
  PermitsByDay,
  LotDetails,
  PurchaseLotInput,
  NewLot,
  LotGroup,
  Zone,
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

  public async getValidPermit(vid: string): Promise<IsValid> {
    const result = await pool.query(`
      SELECT t.data
      FROM permit p
      JOIN type t ON t.id = p.type
      WHERE p.vehicle = $1
        AND now() >= (p.data->>'activeDate')::timestamptz
        AND now() <= (p.data->>'expireDate')::timestamptz`,
      [vid]
    )

    if (result.rowCount === 0) return { isValid: false, type: 'N/A', area: 'N/A'}

    const row = result.rows[0]
    return {
      isValid: true,
      type: row.data.name,
      area: row.data.area,
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
        data->>'purchaseDate' AS purchaseDate,
        data->>'activeDate' AS activeDate,
        data->>'expireDate' AS expireDate,
        data->>'receipt' AS receipt,
        data->>'paymentMethod' AS paymentMethod,
        data->>'area' AS area
      FROM permit
      ORDER BY data->>'activedate';
    `;

    const permitResults = await pool.query(permitQuery);
    const permitsByDayMap: Record<string, Permit[]> = {};

    for (const row of permitResults.rows) {
      const date = row.purchasedate.split('T')[0];
      const permit: Permit = {
        vehicle: row.vehicle,
        type: row.type,
        area: row.area,
        activeDate: row.activeDate,
        expireDate: row.expireDate,
      };

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
    const location = 'd731ac38-5a5f-4cea-be89-cfc8ce69f1d5' // TODO Don't hardcode this
    const data = {
      name: 'zone',
      area: input.zone,
      ...input
    }
    const { rows } = await pool.query(`
      INSERT INTO type (location, data)
      SELECT $2, $1
      WHERE NOT EXISTS (
        SELECT 1 FROM type
        WHERE location = $2
        AND data->>'area' = $3
        AND data->>'name' = 'zone'
      )
      RETURNING id, data
    `, [data, location, data.zone])
  
    return (rows.length !== 0)
  }

  public async getLotDetails(lot: string): Promise<LotDetails> {
    const result = await pool.query(`
        SELECT data
        FROM type
        WHERE data->>'name' = 'lot'
        AND data->>'area' = $1
      `,
      [lot]
    )
    
    if (result.rowCount == 0) throw new Error(`Lot type ${lot} not found`)
    return result.rows[0].data
  }

  // public async getAllLotDetails(): Promise<LotDetails[]> {
  //   const result = await pool.query(`
  //       SELECT data
  //       FROM type
  //       WHERE data->>'name' = 'lot'
  //     `,
  //     []
  //   )
    
  //   return result.rows.map((row) => row.data)
  // }
  public async getAllLotDetails(): Promise<LotGroup[]> {
    const query = `
      SELECT data
      FROM type
      WHERE data->>'name' = 'lot'
    `;

    const result = await pool.query(query);
    const lotMap: Record<string, LotGroup> = {};

    for (const row of result.rows) {
      const data = row.data;
      const area = data.area;

      for (const permitType of ['daily', 'quarterly', 'yearly'] as const) {
        if (!lotMap[permitType]) {
          lotMap[permitType] = {
            id: permitType,
            title: permitType,
            lots: []
          };
        }

        lotMap[permitType].lots.push({
          name: `lot${area}`,
          price: `$${data[permitType]}`,
        });
      }
    }

    return Object.values(lotMap);
  }



  public async createNewLot(input: NewLot): Promise<boolean> {
    const location = 'd731ac38-5a5f-4cea-be89-cfc8ce69f1d5' // TODO Don't hardcode this
    const { rows } = await pool.query(`
      INSERT INTO type (location, data)
      SELECT $2, $1
      WHERE NOT EXISTS (
        SELECT 1 FROM type
        WHERE location = $2
        AND data->>'area' = $3
        AND data->>'name' = 'lot'
      )
      RETURNING id, data
    `, [input, location, input.lot])
  
    return (rows.length !== 0)
  }

  public async purchaseMyLotPermit(input: PurchaseLotInput): Promise<Confirmation> {

    const details = await this.getLotDetails(input.lot)
    const service = 0.50
    let subTotal
    switch (input.duration) {
      case 'daily':
        subTotal = details.daily
        break
      case 'quarterly':
        subTotal = details.quarterly
        break
      case 'yearly':
        subTotal = details.yearly
        break
      default:
        throw new Error('Incorrect permit option')
    }
    if (subTotal === undefined) throw new Error(`Lot type ${input.lot} does not have ${input.duration} duration option`)
    const total = service + subTotal
    const receipt = {
      service,
      subTotal,
      total
    } as Receipt

    // Stripe processing goes here


    const today = new Date()

    const purchaseDate = today.toISOString()
    const activeDate = today.toISOString() // TODO allow purchases in advance
    
    const expireDate = new Date().toISOString() // TODO this needs to be a specific date/time based on lot details somehow

    const data = {
      purchaseDate,
      activeDate,
      expireDate,
      receipt,
      paymentMethod: input.paymentMethod,
    }

    const { rows } = await pool.query(`
      WITH selected_lot AS (
        SELECT id FROM type
        WHERE data->>'name' = 'lot'
        AND TRIM(LOWER(data->>'area')) = TRIM(LOWER($2))
        LIMIT 1
      )
      INSERT INTO permit (vehicle, type, data)
      SELECT $1, id, $3 FROM selected_lot
      RETURNING type, data
    `, [input.vehicle, input.lot, data])

    // TODO: Hit email api to send confirmation and receipt
    return {
      type: 'lot',
      area: input.lot,
      purchaseDate: rows[0].data.purchaseDate,
      activeDate: rows[0].data.activeDate,
      expireDate: rows[0].data.expireDate,
      receipt: rows[0].data.receipt,
      paymentMethod: rows[0].data.paymentMethod,
    }
  }

  public async getZones(): Promise<Zone[]> {
    const result = await pool.query(`
      SELECT data
      FROM type 
      WHERE data->>'name' = 'zone'
      ORDER BY (data->>'area')::int
    `)

    return result.rows.map(row => {
      const weekdayData = row.data.weekday || {}
      const duration = weekdayData.maxDuration || { hours: 0, minutes: 0 }
      
      return {
        zone: row.data.area,
        hourly: weekdayData.hourly || 0,
        maxDuration: {
          hours: duration.hours || 0,
          minutes: duration.minutes || 0
        },
        openTime: weekdayData.openTime || '00:00',
        closeTime: weekdayData.closeTime || '23:59'
      }
    })
  }
}
