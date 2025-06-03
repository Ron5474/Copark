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
  permitId,
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
  public async purchaseMyZonePermit(input: PurchaseZoneInput, now = new Date().toISOString()): Promise<Confirmation> {

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


    const today = new Date()

    const purchaseDate = today.toISOString()
    const activeDate = today.toISOString()

    const durationMs = totalMinutes * 60 * 1000
    const expireDate = new Date(today.getTime() + durationMs).toISOString()

    const durationType = 'zone'

    const data = {
      purchaseDate,
      activeDate,
      expireDate,
      durationType,
      receipt,
      paymentMethod: input.paymentMethod,
      transactionId: input.transactionId,
    }

    const { rows } = await pool.query(`
      WITH selected_zone AS (
        SELECT id
        FROM type
        WHERE data->>'name' = 'zone'
        AND TRIM(LOWER(data->>'area')) = TRIM($2)
        LIMIT 1
      ),
      zone_exists_check AS (
        SELECT COUNT(*)::int AS count FROM selected_zone
      ),
      duplicate_check AS (
        SELECT COUNT(*)::int AS count FROM permit
        WHERE data->>'transactionId' = $4
      ),
      conflict_check AS (
        SELECT COUNT(*)::int AS count FROM permit
        WHERE vehicle = $1
          AND type = (SELECT id FROM selected_zone)::uuid
          AND (data->>'activeDate')::timestamptz <= $5
          AND (data->>'expireDate')::timestamptz > $5
      ),
      inserted AS (
        INSERT INTO permit (vehicle, type, data)
        SELECT $1, id, $3
        FROM selected_zone
        WHERE 
          (SELECT count FROM zone_exists_check) > 0 AND
          COALESCE((SELECT count FROM duplicate_check), 0) = 0 AND
          COALESCE((SELECT count FROM conflict_check), 0) = 0
        RETURNING type, data
      )
      SELECT 
        (SELECT count FROM duplicate_check) AS duplicate_count,
        (SELECT count FROM conflict_check) AS conflict_count,
        (SELECT count FROM zone_exists_check) AS zone_exists,
        (SELECT row_to_json(i) FROM inserted i) AS inserted_row
    `, [input.vehicleId, input.zone, data, input.transactionId, now])

    const result = rows[0]

    if (result.duplicate_count > 0) {
      throw new Error(`Permit for vehicle ${input.plate} already exists for zone ${input.zone} with transaction ID ${input.transactionId}`)
    }

    if (result.conflict_count > 0) {
      throw new Error(`Vehicle ${input.plate} already has an active permit of this type in zone ${input.zone}`)
    }

    // if (!result.zone_exists) {
    //   throw new Error(`Zone "${input.zone}" doesn't exist`)
    // }

    return {
      type: 'zone',
      area: input.zone,
      purchaseDate: result.inserted_row.data.purchaseDate,
      activeDate: result.inserted_row.data.activeDate,
      expireDate: result.inserted_row.data.expireDate,
      receipt: result.inserted_row.data.receipt,
      paymentMethod: result.inserted_row.data.paymentMethod,
    }
  }

  public async getValidPermit(vid: string, now = new Date().toISOString()): Promise<CheckedPermit[]> {
    const result = await pool.query(`
      SELECT t.data
      FROM permit p
      JOIN type t ON t.id = p.type
      WHERE p.vehicle = $1
        AND $2 >= (p.data->>'activeDate')::timestamptz
        AND $2 <= (p.data->>'expireDate')::timestamptz
    `, [vid, now])

    return result.rows.map(row => {
      return {
        type: row.data.name,
        area: row.data.area,
      }
    })
  }


  public async isValidPermitPolice(vid: string, now = new Date().toISOString()): Promise<IsValidPolice> {

    const result = await pool.query(`
        SELECT data
        FROM permit
        WHERE vehicle = $1
        AND $2 >= (data->>'activeDate')::timestamptz
        AND $2 <= (data->>'expireDate')::timestamptz
      `,
      [vid, now]
    )

    if (result.rowCount === 0) return { isValid: false }
    return { isValid: true }
  }

  public async getMyPermits(vid: Vehicle[], now = new Date().toISOString()): Promise<MyPermits> {

    const result = await pool.query(`
        WITH future AS (
          SELECT DISTINCT ON (p.id) p.vehicle,
            p.id AS id,
            t.data->>'name' AS type,
            t.data->>'area' AS area,
            p.data->>'durationType' AS "durationType",
            p.data->>'activeDate' AS "activeDate",
            p.data->>'expireDate' AS "expireDate"
          FROM permit p, type t 
          WHERE p.vehicle = ANY($1::uuid[]) AND 
          t.id = p.type 
          AND $2 < (p.data->>'activeDate')::timestamptz
        ),
        active AS (
          SELECT DISTINCT ON (p.id) p.vehicle,
            p.id AS id,
            t.data->>'name' AS type,
            t.data->>'area' AS area,
            p.data->>'durationType' AS "durationType",
            p.data->>'activeDate' AS "activeDate",
            p.data->>'expireDate' AS "expireDate"
          FROM permit p, type t 
          WHERE p.vehicle = ANY($1::uuid[]) AND 
          t.id = p.type 
          AND $2 >= (p.data->>'activeDate')::timestamptz
          AND $2 < (p.data->>'expireDate')::timestamptz
        ),
        expired AS (
          SELECT DISTINCT ON (p.id) p.vehicle,
            p.id AS id,
            t.data->>'name' AS type,
            t.data->>'area' AS area,
            p.data->>'durationType' AS "durationType",
            p.data->>'activeDate' AS "activeDate",
            p.data->>'expireDate' AS "expireDate"
          FROM permit p, type t 
          WHERE p.vehicle = ANY($1::uuid[]) AND 
          t.id = p.type 
          AND $2 >= (p.data->>'expireDate')::timestamptz
        )
        SELECT
          COALESCE((SELECT json_agg(future) FROM future), '[]') AS future,
          COALESCE((SELECT json_agg(active) FROM active), '[]') AS active,
          COALESCE((SELECT json_agg(expired) FROM expired), '[]') AS expired
      `,
      [vid, now]
    )

    return result.rows[0]
  }

  public async getZoneDetails(zone: string, currentDay = new Date().getDay()): Promise<ZoneDetails> {
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
        p.id,
        p.vehicle,
        p.type,
        p.data->>'purchaseDate' AS purchaseDate,
        p.data->>'activeDate' AS activeDate,
        p.data->>'expireDate' AS expireDate,
        p.data->>'receipt' AS receipt,
        p.data->>'paymentMethod' AS paymentMethod,
        t.data->>'name' AS area,
        p.data->>'durationType' as durationType
      FROM permit p
      JOIN type t ON t.id = p.type
      ORDER BY p.data->>'activeDate'
    `

    const permitResults = await pool.query(permitQuery)
    const permitsByDayMap: Record<string, Permit[]> = {}

    for (const row of permitResults.rows) {
      console.log('row: ', row)
      const date = row.purchasedate.split('T')[0]
      const permit: Permit = {
        vehicle: row.vehicle,
        type: row.type,
        area: row.area,
        durationType: row.durationtype,
        activeDate: row.activedate,
        expireDate: row.expiredate,
      }
      console.log('Permit in Row: ', permit)

      if (!permitsByDayMap[date]) {
        permitsByDayMap[date] = []
      }
      permitsByDayMap[date].push(permit)
      console.log('Permits by day  in loop after row: ', permitsByDayMap)
    }

    const permitsByDay: PermitsByDay[] = Object.entries(permitsByDayMap).map(([date, permits]) => ({
      date,
      permits
    }))
    // console.log('Permits By Day of 0: ', permitsByDay[1])
    return permitsByDay
  }

  public async createNewZone(input: NewZone): Promise<boolean> {
    const location = 'd731ac38-5a5f-4cea-be89-cfc8ce69f1d5' // TODO Don't hardcode this

    const { zone, ...inputWithoutZone } = input

    const data = {
      ...inputWithoutZone,
      name: 'zone',
      area: zone,
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
    `, [data, location, zone])

    return (rows.length !== 0)
  }

  public async updateZone(input: NewZone): Promise<boolean> {
    const location = 'd731ac38-5a5f-4cea-be89-cfc8ce69f1d5' // TODO: Don't hardcode this
  
    const { zone, ...inputWithoutZone } = input

    const data = {
      ...inputWithoutZone,
      name: 'zone',
      area: zone,
    }

    const { rowCount } = await pool.query(`
      UPDATE type
      SET data = $1
      WHERE location = $2
      AND data->>'area' = $3
      AND data->>'name' = 'zone'
    `, [data, location, zone])
  
    return (rowCount as number) > 0
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

  public async adminGetAllLotDetails(): Promise<LotGroup[]> {
    const query = `
      SELECT data
      FROM type
      WHERE data->>'name' = 'lot'
      ORDER BY data->>'area'
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
          name: `${area}`,
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

    const { lot, ...inputWithoutLot } = input

    const data = {
      ...inputWithoutLot,
      name: 'lot',
      area: lot,
    }

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
    `, [data, location, lot])

    return (rowCount as number) > 0
  }

  public async updateLot(input: NewLot): Promise<boolean> {
    const location = 'd731ac38-5a5f-4cea-be89-cfc8ce69f1d5' // TODO: Don't hardcode this

    const { lot, ...inputWithoutLot } = input

    const data = {
      ...inputWithoutLot,
      name: 'lot',
      area: lot,
    }

    const { rowCount } = await pool.query(`
      UPDATE type
      SET data = $1
      WHERE location = $2
      AND data->>'area' = $3
      AND data->>'name' = 'lot'
    `, [data, location, lot])

    return (rowCount as number) > 0
  }

  public async purchaseMyLotPermit(input: PurchaseLotInput, now = new Date()): Promise<Confirmation> {

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

    const localMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString()
    const expireDate = details?.expireDate ?? localMidnight

    const data = {
      purchaseDate,
      activeDate,
      expireDate,
      receipt,
      durationType: input.duration,
      paymentMethod: input.paymentMethod,
      transactionId: input.transactionId,
    }

    const { rows } = await pool.query(`
      WITH selected_lot AS (
        SELECT id
        FROM type
        WHERE data->>'name' = 'lot'
        AND TRIM(LOWER(data->>'area')) = TRIM(LOWER($2))
        LIMIT 1
      ),
      lot_exists_check AS (
        SELECT COUNT(*)::int AS count FROM selected_lot
      ),
      duplicate_check AS (
        SELECT COUNT(*)::int AS count FROM permit
        WHERE data->>'transactionId' = $4
      ),
      conflict_check AS (
        SELECT COUNT(*)::int AS count FROM permit
        WHERE vehicle = $1
          AND type = (SELECT id FROM selected_lot)
          AND (
            (data->>'expireDate')::timestamptz IS NULL
            OR (data->>'expireDate')::timestamptz > $5
          )
      ),
      inserted AS (
        INSERT INTO permit (vehicle, type, data)
        SELECT $1, id, $3
        FROM selected_lot
        WHERE 
          (SELECT count FROM duplicate_check) = 0 AND
          (SELECT count FROM conflict_check) = 0
        RETURNING type, data
      )
      SELECT 
        (SELECT count FROM duplicate_check) AS duplicate_count,
        (SELECT count FROM conflict_check) AS conflict_count,
        (SELECT count FROM lot_exists_check) AS lot_exists,
        (SELECT row_to_json(i) FROM inserted i) AS inserted_row
    `, [input.vehicleId, input.lot, data, input.transactionId, now.toISOString()])

    const result = rows[0]

    if (result.duplicate_count > 0) {
      throw new Error(`Permit for vehicle ${input.plate} already exists for lot ${input.lot} with transaction ID ${input.transactionId}`)
    }

    if (result.conflict_count > 0) {
      throw new Error(`Vehicle ${input.plate} already has an active permit of this type in lot ${input.lot}`)
    }

    // if (!result.lot_exists) {
    //   throw new Error(`Lot "${input.lot}" doesn't exist`)
    // }

    return {
      type: 'lot',
      area: input.lot,
      purchaseDate: rows[0].inserted_row.data.purchaseDate,
      activeDate: rows[0].inserted_row.data.activeDate,
      expireDate: rows[0].inserted_row.data.expireDate,
      receipt: rows[0].inserted_row.data.receipt,
      paymentMethod: rows[0].inserted_row.data.paymentMethod,
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
        p.data->>'durationType' as "durationType",
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

  public async getPermitStatsByZone(
    activeOnly = true,
    startDate?: string,
    endDate?: string
  ): Promise<{ area: string; totalPermits: number }[]> {
    const now = new Date().toISOString()
    const useRange = !!(startDate && endDate)

    const query = `
      SELECT 
        t.data->>'area' AS area,
        COUNT(p.*) AS total
      FROM type t
      LEFT JOIN permit p ON p.type = t.id
        AND (
          ($1::boolean IS FALSE 
            OR (p.data->>'activeDate')::timestamptz <= $2 
            AND (p.data->>'expireDate')::timestamptz >= $2)
          ${useRange ? `
            AND (p.data->>'purchaseDate')::timestamptz >= $3
            AND (p.data->>'purchaseDate')::timestamptz <= $4
          ` : ''}
        )
      WHERE t.data->>'name' = 'zone'
      GROUP BY t.data->>'area'
      ORDER BY (t.data->>'area')::int
    `

    const params: (boolean | string)[] = [activeOnly, now]
    if (useRange) {
      params.push(startDate, endDate)
    }

    const result = await pool.query(query, params)

    return result.rows.map(row => ({
      area: row.area,
      totalPermits: parseInt(row.total),
    }))
  }

  public async getPermitStatsByLot(
    activeOnly = true,
    startDate?: string,
    endDate?: string
  ): Promise<{ area: string; durationType: string; totalPermits: number }[]> {
    const now = new Date().toISOString()
    const useRange = !!(startDate && endDate)

    // const query = `
    //   SELECT 
    //     t.data->>'area' AS area,
    //     p.data->>'durationType' AS durationType,
    //     COUNT(*) AS total
    //   FROM permit p
    //   JOIN type t ON t.id = p.type
    //   WHERE t.data->>'name' = 'lot'
    //     AND (
    //       $1::boolean IS FALSE 
    //       OR (p.data->>'activeDate')::timestamptz <= $2 
    //       AND (p.data->>'expireDate')::timestamptz >= $2
    //     )
    //     ${useRange ? `
    //       AND (p.data->>'purchaseDate')::timestamptz >= $3
    //       AND (p.data->>'purchaseDate')::timestamptz <= $4
    //     ` : ''}
    //   GROUP BY t.data->>'area', p.data->>'durationType'
    //   ORDER BY t.data->>'area', p.data->>'durationType'
    // `
    const query = `
      WITH duration_types AS (
        SELECT DISTINCT p.data->>'durationType' AS durationType
        FROM permit p
        WHERE p.data ? 'durationType'
          AND p.data->>'durationType' <> 'zone'
      )
      SELECT 
        t.data->>'area' AS area,
        d.durationType,
        COUNT(p.*) AS total
      FROM type t
      CROSS JOIN duration_types d
      LEFT JOIN permit p ON 
        p.type = t.id
        AND p.data->>'durationType' = d.durationType
        AND (
          ($1::boolean IS FALSE 
            OR (p.data->>'activeDate')::timestamptz <= $2 
            AND (p.data->>'expireDate')::timestamptz >= $2)
          ${useRange ? `
            AND (p.data->>'purchaseDate')::timestamptz >= $3
            AND (p.data->>'purchaseDate')::timestamptz <= $4
          ` : ''}
        )
      WHERE t.data->>'name' = 'lot'
      GROUP BY t.data->>'area', d.durationType
      ORDER BY t.data->>'area', d.durationType
    `

    const params: (boolean | string)[] = [activeOnly, now]
    if (useRange) {
      params.push(startDate, endDate)
    }

    const result = await pool.query(query, params)
    // console.log("result", result)
    return result.rows.map(row => ({
      area: row.area,
      durationType: row.durationtype,
      totalPermits: parseInt(row.total),
    }))
  }

  public async generatePermitReport(timeRange: { numDays: number }): Promise<PermitReport> {
    const now = new Date()
    const startDate = new Date(now)
    startDate.setDate(now.getDate() - timeRange.numDays)
    const nowISO = now.toISOString()
    const startISO = startDate.toISOString()

    const totalQuery = `
      SELECT 
        COUNT(*) FILTER (
          WHERE (p.data->>'purchaseDate')::timestamptz >= $1
            AND (p.data->>'purchaseDate')::timestamptz <= $2
            AND (p.data->>'expireDate')::timestamptz < $2
        ) AS expired,
        COUNT(*) FILTER (
          WHERE (p.data->>'purchaseDate')::timestamptz >= $1
            AND (p.data->>'purchaseDate')::timestamptz <= $2
            AND (p.data->>'activeDate')::timestamptz <= $2
            AND (p.data->>'expireDate')::timestamptz >= $2
        ) AS active,
        COUNT(*) FILTER (
          WHERE (p.data->>'purchaseDate')::timestamptz >= $1
            AND (p.data->>'purchaseDate')::timestamptz <= $2
        ) AS total,
        COALESCE(SUM(
          CASE 
            WHEN (p.data->>'purchaseDate')::timestamptz >= $1
              AND (p.data->>'purchaseDate')::timestamptz <= $2
            THEN (p.data->'receipt'->>'total')::float
            ELSE 0
          END
        ), 0) AS revenue
      FROM permit p
    `

    const result = await pool.query(totalQuery, [startISO, nowISO])
    const row = result.rows[0]

    // Pass the time range to breakdowns as well
    const zoneBreakdown = await this.getPermitStatsByZone(false, startISO, nowISO)
    const lotBreakdown = await this.getPermitStatsByLot(false, startISO, nowISO)

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

  public async expirePermits(vehicleId: string, now = new Date().toISOString()): Promise<permitId[]> {
    // Vehicle ID has to be defined, it is a required argument in this function.
    // if (!vehicleId) {
    //   throw new Error('Vehicle ID is required');
    // }
    const result = await pool.query(
      `
      UPDATE permit
      SET data = jsonb_set(data, '{expireDate}', to_jsonb($2))
      WHERE vehicle = $1
        AND (data->>'expireDate')::timestamptz > $2
      RETURNING id
      `,
      [vehicleId, now]
    )

    if (result.rowCount === 0) {
      return []
    }

    return result.rows.map(row => ({
      id: row.id,
    }))
  }
}
