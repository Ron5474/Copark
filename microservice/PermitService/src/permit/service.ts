import { Vehicle } from 'src/types/express'
import { pool } from './db'
import {
  Confirmation,
  Receipt,
  PurchaseZoneInput,
  CheckedPermit,
  IsValidPolice,
  MyPermits,
  ZoneDetails,
  NewZone,
  Permit,
  PermitsByDay,
  // LotDetails,
  PurchaseLotInput,
  NewLot,
  LotGroup,
  Zone,
  ZoneInput,
  PermitReport,
} from './schema'


interface LotTypeDetails {
  price: number
  activeDate?: string
  expireDate?: string
}

interface LotDetails {
  daily?: LotTypeDetails
  quarterly?: LotTypeDetails
  yearly?: LotTypeDetails
}

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

  public async getValidPermit(vid: string): Promise<CheckedPermit[]> {
    const result = await pool.query(`
      SELECT t.data
      FROM permit p
      JOIN type t ON t.id = p.type
      WHERE p.vehicle = $1
        AND now() >= (p.data->>'activeDate')::timestamptz
        AND now() <= (p.data->>'expireDate')::timestamptz
    `, [vid])
  
    return result.rows.map(row => {
      return {
        type: row.data.name,
        area: row.data.area,
      }
    })
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

  public async getMyPermits(vid: Vehicle[]): Promise<MyPermits> {

    const result = await pool.query(`
        WITH future AS (
          SELECT DISTINCT ON (p.id) p.vehicle,
            p.id AS id,
            t.data->>'name' AS type,
            t.data->>'area' AS area,
            p.data->>'activeDate' AS "activeDate",
            p.data->>'expireDate' AS "expireDate"
          FROM permit p, type t 
          WHERE p.vehicle = ANY($1::uuid[]) AND 
          t.id = p.type 
          AND now() <= (p.data->>'activeDate')::timestamptz
        ),
        active AS (
          SELECT DISTINCT ON (p.id) p.vehicle,
            p.id AS id,
            t.data->>'name' AS type,
            t.data->>'area' AS area,
            p.data->>'activeDate' AS "activeDate",
            p.data->>'expireDate' AS "expireDate"
          FROM permit p, type t 
          WHERE p.vehicle = ANY($1::uuid[]) AND 
          t.id = p.type 
          AND now() >= (p.data->>'activeDate')::timestamptz
          AND now() <= (p.data->>'expireDate')::timestamptz
        ),
        expired AS (
          SELECT DISTINCT ON (p.id) p.vehicle,
            p.id AS id,
            t.data->>'name' AS type,
            t.data->>'area' AS area,
            p.data->>'activeDate' AS "activeDate",
            p.data->>'expireDate' AS "expireDate"
          FROM permit p, type t 
          WHERE p.vehicle = ANY($1::uuid[]) AND 
          t.id = p.type 
          AND now() >= (p.data->>'expireDate')::timestamptz
        )
        SELECT
          COALESCE((SELECT json_agg(future) FROM future), '[]') AS future,
          COALESCE((SELECT json_agg(active) FROM active), '[]') AS active,
          COALESCE((SELECT json_agg(expired) FROM expired), '[]') AS expired
      `,
      [vid]
    )
    // console.log(result.rows[0])

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
      ORDER BY data->>'activedate'
    `

    const permitResults = await pool.query(permitQuery)
    const permitsByDayMap: Record<string, Permit[]> = {}

    for (const row of permitResults.rows) {
      const date = row.purchasedate.split('T')[0]
      const permit: Permit = {
        vehicle: row.vehicle,
        type: row.type,
        area: row.area,
        activeDate: row.activeDate,
        expireDate: row.expireDate,
      }

      if (!permitsByDayMap[date]) {
        permitsByDayMap[date] = []
      }
      permitsByDayMap[date].push(permit)
    }

    const permitsByDay: PermitsByDay[] = Object.entries(permitsByDayMap).map(([date, permits]) => ({
      date,
      permits
    }))

    return permitsByDay
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
    `

    const result = await pool.query(query)
    const lotMap: Record<string, LotGroup> = {}

    for (const row of result.rows) {
      const data = row.data
      const area = data.area

      for (const permitType of ['daily', 'quarterly', 'yearly'] as const) {
        if (!lotMap[permitType]) {
          lotMap[permitType] = {
            id: permitType,
            title: permitType,
            lots: []
          }
        }

        lotMap[permitType].lots.push({
          name: `lot${area}`,
          price: `$${data[permitType].price}`,
          expireDate: new Date(data[permitType].expireDate).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        })
      }
    }

    return Object.values(lotMap)
  }



  public async createNewLot(input: NewLot): Promise<boolean> {
    const location = 'd731ac38-5a5f-4cea-be89-cfc8ce69f1d5' // TODO: Don't hardcode this
    const { rowCount } = await pool.query(`
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
  
    return (rowCount as number) > 0
  }

  public async updateLot(input: NewLot): Promise<boolean> {
    const location = 'd731ac38-5a5f-4cea-be89-cfc8ce69f1d5' // TODO: Don't hardcode this
  
    const { rowCount } = await pool.query(`
      UPDATE type
      SET data = $1
      WHERE location = $2
      AND data->>'area' = $3
      AND data->>'name' = 'lot'
    `, [input, location, input.lot])
  
    return (rowCount as number) > 0
  }

  public async purchaseMyLotPermit(input: PurchaseLotInput): Promise<Confirmation> {

    const today = new Date()

    const details = (await this.getLotDetails(input.lot))[input.duration as keyof LotDetails]
    const service = 0.50
    const subTotal = details?.price
    if (subTotal === undefined) throw new Error('Incorrect permit option')
    if (details?.expireDate && new Date(details.expireDate) < today) throw new Error('This permit type has expired')
    const total = service + (subTotal as number)
    const receipt = {
      service,
      subTotal,
      total
    } as Receipt

    // Stripe processing goes here

    const purchaseDate = today.toISOString()
    const beginDate = new Date(details?.activeDate || purchaseDate)
    const activeDate = today < beginDate ?
      beginDate.toISOString() :
      purchaseDate
    
    const now = new Date()
    const localMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString()
    const expireDate = details?.expireDate ?? localMidnight

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

  public async getAllPermits(activeOnly = true): Promise<Permit[]> {
    const now = new Date().toISOString()

    const result = await pool.query(`
      SELECT 
        t.data->>'name' AS type,
        t.data->>'area' AS area,
        p.data->>'purchaseDate' AS "purchaseDate",
        p.data->>'activeDate' AS "activeDate",
        p.data->>'expireDate' AS "expireDate"
      FROM permit p
      JOIN type t ON t.id = p.type
      ${activeOnly ? `
        WHERE (p.data->>'activeDate')::timestamptz <= $1
        AND (p.data->>'expireDate')::timestamptz >= $1
      ` : ''}
      ORDER BY (p.data->>'activeDate')::timestamptz ASC
    `, activeOnly ? [now] : [])

    return result.rows
  }

  public async getPermitStatsByZone(activeOnly = true): Promise<{ area: string; totalPermits: number }[]> {
    const now = new Date().toISOString()

    const result = await pool.query(`
      SELECT 
        t.data->>'area' AS area,
        COUNT(p.*) AS total
      FROM type t
      LEFT JOIN permit p ON p.type = t.id
        AND ($1::boolean IS FALSE 
          OR (p.data->>'activeDate')::timestamptz <= $2 
          AND (p.data->>'expireDate')::timestamptz >= $2)
      WHERE t.data->>'name' = 'zone'
      GROUP BY t.data->>'area'
      ORDER BY (t.data->>'area')::int
    `, [activeOnly, now])

    return result.rows.map(row => ({
      area: row.area,
      totalPermits: parseInt(row.total),
    }))
  }

  public async getPermitStatsByLot(activeOnly = true): Promise<{ area: string; totalPermits: number }[]> {
    const now = new Date().toISOString()

    const result = await pool.query(`
      SELECT 
        t.data->>'area' AS area,
        COUNT(p.*) AS total
      FROM type t
      LEFT JOIN permit p ON p.type = t.id
        AND ($1::boolean IS FALSE 
          OR (p.data->>'activeDate')::timestamptz <= $2 
          AND (p.data->>'expireDate')::timestamptz >= $2)
      WHERE t.data->>'name' = 'lot'
      GROUP BY t.data->>'area'
      ORDER BY t.data->>'area'
    `, [activeOnly, now])

    return result.rows.map(row => ({
      area: row.area,
      totalPermits: parseInt(row.total),
    }))
  }
  
  public async generatePermitReport(): Promise<PermitReport> {
    const now = new Date().toISOString()

    const totalQuery = `
      SELECT 
        COUNT(*) FILTER (WHERE (p.data->>'expireDate')::timestamptz < $1) AS expired,
        COUNT(*) FILTER (WHERE (p.data->>'activeDate')::timestamptz <= $1 AND (p.data->>'expireDate')::timestamptz >= $1) AS active,
        COUNT(*) AS total,
        COALESCE(SUM((p.data->'receipt'->>'total')::float), 0) AS revenue
      FROM permit p
    `

    const result = await pool.query(totalQuery, [now])
    const row = result.rows[0]

    const zoneBreakdown = await this.getPermitStatsByZone(false)
    const lotBreakdown = await this.getPermitStatsByLot(false)
    console.log("Revenue debug:", row.revenue, typeof row.revenue)

    return {
      totalPermits: parseInt(row.total),
      activePermits: parseInt(row.active),
      expiredPermits: parseInt(row.expired),
      totalRevenue: Math.round(parseFloat(row.revenue) * 100),
      zoneBreakdown,
      lotBreakdown
    }
  }

  public async updateZonePrice(zone: ZoneInput): Promise<Zone[]> {
    // Fetch the existing zone data
    const result = await pool.query(
      `
      SELECT id, data
      FROM type
      WHERE data->>'name' = 'zone'
      AND data->>'area' = $1
      LIMIT 1
      `,
      [zone.zone]
    )

    if (result.rowCount === 0) {
      throw new Error(`Zone ${zone.zone} not found`)
    }

    const row = result.rows[0]
    const data = row.data
    const weekday = data.weekday || {}

    if (zone.hourly !== undefined) {
      weekday.hourly = zone.hourly
    }
    if (zone.maxDuration !== undefined) {
      weekday.maxDuration = zone.maxDuration
    }
    if (zone.openTime !== undefined) {
      weekday.openTime = zone.openTime
    }
    if (zone.closeTime !== undefined) {
      weekday.closeTime = zone.closeTime
    }

    data.weekday = weekday

    await pool.query(
      `
      UPDATE type
      SET data = $1
      WHERE id = $2
      `,
      [data, row.id]
    )

    return [{
      zone: data.area,
      hourly: data.weekday?.hourly || 0,
      maxDuration: data.weekday?.maxDuration || { hours: 0, minutes: 0 },
      openTime: data.weekday?.openTime || '00:00',
      closeTime: data.weekday?.closeTime || '23:59'
    }]
  }
}
