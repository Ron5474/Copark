import { Ticket, NewTicket, ModifyTicketInput, TicketInput, TicketsByDay, ChallengeTicket} from "./schema";
import { pool } from "./db";
import { SignJWT, jwtVerify } from 'jose'
import { Vehicle } from "../types/express";

const internalKey = new TextEncoder().encode(process.env.MICROSERVICE_INTERNAL_SECRET)
const encodedKey = new TextEncoder().encode(process.env.JWT_SECRET)

export class TicketService {
  private async encrypt(userId: string): Promise<string> {
    return new SignJWT({ id: userId })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('30m')
      .sign(internalKey)
  }

  private async decrypt(token: string): Promise<string | undefined> {
    try {
      const { payload } = await jwtVerify(token, internalKey)

      return payload.id as string; // Extract the `id` from the payload
    } catch (error) {
      void error;
      // console.error('Failed to decrypt token:', error);
      return undefined; // Return undefined if the token is invalid or expired
    }
  }

  private async decryptUser(userJWT: string): Promise<string | undefined> {
    try {
      const { payload } = await jwtVerify(userJWT, encodedKey)

      return payload.id as string; // Extract the `id` from the payload
    } catch (error) {
      void error;
      // console.error('Failed to decrypt user JWT:', error);
      return undefined; // Return undefined if the token is invalid or expired
    }
  }

  public async getTickets(): Promise<Ticket[]> {
    const ticketQuery = `
        SELECT 
        id,
        vehicle,
        enforcer,
        data->>'issuedDate' AS issueddate,
        data->>'violation' AS violation,
        data->>'fine' AS fine,
        data->>'ticketStatus' AS ticketstatus,
        data->>'images' AS images,
        data->>'note' AS note
        FROM ticket
        WHERE data->>'ticketStatus' != 'deleted'
        ORDER BY data->>'issuedDate';
    `;

    const ticketResults = await pool.query(ticketQuery);

    const tickets: Ticket[] = [];

    for (const row of ticketResults.rows) {
      tickets.push({
        id: await this.encrypt(row.id),
        vehicle: row.vehicle,
        enforcer: await this.encrypt(row.enforcer),
        issuedDate: new Date(row.issueddate),
        violation: row.violation,
        fine: parseFloat(row.fine),
        ticketStatus: row.ticketstatus,
        images: row.images,
        note: row.note
      });

    }

    // console.log(tickets);
    return tickets;
  }

  public async createTicket(newTicket: NewTicket): Promise<Ticket> {
    const enforcerId = await this.decryptUser(newTicket.enforcer);
    const vehicleId = newTicket.vehicle;
    if (!enforcerId || !vehicleId) {
      throw new Error("Invalid enforcer or vehicle ID.");
    }

    const issuedDate = new Date().toISOString();
    const ticketStatus = 'unpaid';

    const insertQuery = `
      INSERT INTO ticket (vehicle, enforcer, data)
      VALUES ($1, $2, jsonb_build_object(
        'issuedDate', $3::TIMESTAMP,
        'violation', $4::TEXT,
        'fine', $5::NUMERIC,
        'ticketStatus', $6::TEXT,
        'images', $7::TEXT,
        'note', $8::TEXT
      ))
      RETURNING id, vehicle, enforcer, 
                data->>'issuedDate' AS issueddate,
                data->>'violation' AS violation,
                data->>'fine' AS fine,
                data->>'ticketStatus' AS ticketstatus,
                data->>'images' AS images,
                data->>'note' AS note;
    `;

    const result = await pool.query(insertQuery, [
      vehicleId,
      enforcerId,
      issuedDate,
      newTicket.violation,
      newTicket.fine,
      ticketStatus,
      newTicket.images || null,
      newTicket.note,
    ]);

    const row = result.rows[0];

    const ticket: Ticket = {
      id: await this.encrypt(row.id),
      vehicle: row.vehicle,
      enforcer: await this.encrypt(row.enforcer),
      issuedDate: new Date(row.issueddate),
      violation: row.violation,
      fine: parseFloat(row.fine),
      ticketStatus: row.ticketstatus,
      images: row.images,
      note: row.note,
    };

    return ticket;
  }

  public async modifyTicket(input: ModifyTicketInput): Promise<Ticket | null> {
    const { id, vehicle, ...updates } = input;
  
    const decryptedID = await this.decrypt(id);
    let decryptedVehicle = null;
    if (vehicle) {
      decryptedVehicle = vehicle
    }
  
    if (!decryptedID) {
      throw new Error("Invalid or missing ticket ID.");
    }
  
    // If no fields to update, throw an error.
    const entries = Object.entries(updates).filter(
      ([, value]) => value !== undefined
    );
  
    if (entries.length === 0 && !vehicle) {
      throw new Error("No fields provided to update.");
    }
  
    const getDataQuery = {
      text: `
        SELECT vehicle, enforcer, data FROM ticket WHERE id = $1
      `,
      values: [decryptedID],
    };
  
    const currentResult = await pool.query(getDataQuery);
  
    if (currentResult.rows.length === 0) {
      throw new Error("Ticket not found.");
    }
  
    const { vehicle: currentVehicle, enforcer, data: currentData } = currentResult.rows[0];
  
    const updatedData = { ...currentData };
  
    // Apply the updates to the `data` field.
    for (const [key, value] of entries) {
      updatedData[key] = value;
    }
  
    // Update `vehicle` if provided, otherwise keep the existing value.
    const updatedVehicle = decryptedVehicle ?? currentVehicle;
  
    // Convert the updated data to a JSON string for the update.
    const updatedDataJson = JSON.stringify(updatedData);
  
    // Update fields in the database.
    const query = {
      text: `
        UPDATE ticket
        SET vehicle = $1, data = $2
        WHERE id = $3
        RETURNING id, vehicle, data
      `,
      values: [updatedVehicle, updatedDataJson, decryptedID],
    };
  
    const result = await pool.query(query);
  
    const row = result.rows[0];
  
    return {
      id: await this.encrypt(row.id),
      vehicle: row.vehicle,
      enforcer: await this.encrypt(enforcer),
      ...row.data,
    } as Ticket;
  }
  
  public async deleteTicket(id: TicketInput): Promise<Ticket | null> {

    const decryptedID = await this.decrypt(id.id);

    const query = `
      UPDATE ticket
      SET data = jsonb_set(data, '{ticketStatus}', '"deleted"', true)
      WHERE id = $1
      RETURNING id, vehicle, enforcer, 
                data->>'issuedDate' AS issueddate,
                data->>'violation' AS violation,
                data->>'fine' AS fine,
                data->>'ticketStatus' AS ticketstatus,
                data->>'images' AS images
    `;

    const result = await pool.query(query, [decryptedID]);

    if (result.rows.length === 0) {
      throw new Error("No delete found.");
    }

    const row = result.rows[0];

    return {
      id: await this.encrypt(row.id),
      vehicle: row.vehicle,
      enforcer: await this.encrypt(row.enforcer),
      issuedDate: new Date(row.issueddate),
      violation: row.violation,
      fine: parseFloat(row.fine),
      ticketStatus: row.ticketstatus,
      images: row.images,
    } as Ticket;
  }

  public async getTicketsForVehicleID(vehicleIDs: Vehicle[]): Promise<Ticket[]> {

  // get tickets for vehicles
  const query = `
  SELECT id, vehicle, enforcer,
        data->>'issuedDate' AS issueddate,
        data->>'violation' AS violation,
        data->>'fine' AS fine,
        data->>'ticketStatus' AS ticketstatus,
        data->>'images' AS images
  FROM ticket
  WHERE vehicle = ANY($1::uuid[])
    AND data->>'ticketStatus' NOT IN ('deleted', 'paid')
  `;

  const {rows} = await pool.query(query, [vehicleIDs]);
  
  interface TicketRow {
    id: string;
    vehicle: string;
    enforcer: string;
    issueddate: string;
    violation: string;
    fine: string;
    ticketstatus: string;
    images: string | undefined;
  }

  return await Promise.all(rows.map(async (row: TicketRow): Promise<Ticket> => ({
    id: await this.encrypt(row.id),
    vehicle: row.vehicle,
    enforcer: await this.encrypt(row.enforcer),
    issuedDate: new Date(row.issueddate),
    violation: row.violation,
    fine: parseFloat(row.fine),
    ticketStatus: row.ticketstatus,
    images: row.images,
  })));
  }

  // public async getTicketsForUserJWT(userJWT: string): Promise<Ticket[] | undefined> {

  //   // get vehicles for user
  //   const userDecrypted = await this.decrypt(userJWT)
  //   const result = await pool.query(
  //     `SELECT id FROM vehicle WHERE driver = $1`,
  //     [userDecrypted]
  //   )

  //   if (result.rowCount === 0) return []

  //   const vehicleIDs = await Promise.all(result.rows.map(async row => row.id));

  //   // get tickets for vehicles
  //   return await this.getTicketsForVehicleID(vehicleIDs);
  // }

  public async getAllTicketsCount(): Promise<TicketsByDay[]> {
    const ticketQuery = `
        SELECT 
        id,
        vehicle,
        enforcer,
        data->>'issuedDate' AS issueddate,
        data->>'violation' AS violation,
        data->>'fine' AS fine,
        data->>'ticketStatus' AS ticketstatus,
        data->>'images' AS images,
        data->>'note' AS note
        FROM ticket
        WHERE data->>'ticketStatus' != 'deleted'
        ORDER BY data->>'issuedDate';
    `;

    const ticketResults = await pool.query(ticketQuery);

    const ticketsMap = new Map<string, Ticket[]>();

    for (const row of ticketResults.rows) {
      const date = new Date(row.issueddate).toISOString().split('T')[0]; // YYYY-MM-DD
      const ticket: Ticket = {
        id: await this.encrypt(row.id),
        vehicle: row.vehicle,
        enforcer: await this.encrypt(row.enforcer),
        issuedDate: new Date(row.issueddate),
        violation: row.violation,
        fine: parseFloat(row.fine),
        ticketStatus: row.ticketstatus,
        images: row.images,
        note: row.note
      };
      if (!ticketsMap.has(date)) {
        ticketsMap.set(date, []);
      }
      const ticketsForDate = ticketsMap.get(date);
      if (ticketsForDate) {
        ticketsForDate.push(ticket);
      }
    }

    const result: TicketsByDay[] = [];
    for (const [date, tickets] of ticketsMap.entries()) {
      result.push({
        date,
        tickets,
      });
    }

    return result;
  }

  public async getTicketsPerDayFromEnforcer(enforcerID: string): Promise<TicketsByDay[]> {
    const enforcerDecrypted = await this.decrypt(enforcerID);
    const result = await pool.query(
      `
      SELECT 
        id,
        vehicle,
        enforcer,
        data->>'issuedDate' AS issueddate,
        data->>'violation' AS violation,
        data->>'fine' AS fine,
        data->>'ticketStatus' AS ticketstatus,
        data->>'images' AS images,
        data->>'note' AS note
      FROM ticket
      WHERE data->>'ticketStatus' != 'deleted'
        AND enforcer = $1
      ORDER BY data->>'issuedDate';
      `,
      [enforcerDecrypted]
    );

    // console.log(result.rows);

    const ticketsMap = new Map<string, Ticket[]>();

    for (const row of result.rows) {
      const date = new Date(row.issueddate).toISOString().split('T')[0]; // YYYY-MM-DD
      const ticket: Ticket = {
        id: await this.encrypt(row.id),
        vehicle: row.vehicle,
        enforcer: await this.encrypt(row.enforcer),
        issuedDate: new Date(row.issueddate),
        violation: row.violation,
        fine: parseFloat(row.fine),
        ticketStatus: row.ticketstatus,
        images: row.images,
        note: row.note
      };
      if (!ticketsMap.has(date)) {
        ticketsMap.set(date, []);
      }
      const ticketsForDate = ticketsMap.get(date);
      if (ticketsForDate) {
        ticketsForDate.push(ticket);
      }
    }

    const resultArr: TicketsByDay[] = [];
    for (const [date, tickets] of ticketsMap.entries()) {
      resultArr.push({
        date,
        tickets,
      });
    }

    // console.log(resultArr);
    return resultArr;
  }

  public async acceptTicketChallenge(ticketID: TicketInput): Promise<Ticket | null> {
    const decryptedID = await this.decrypt(ticketID.id);

    const query = `
      UPDATE ticket
      SET data = jsonb_set(data, '{ticketStatus}', '"accepted"', true)
      WHERE id = $1
      RETURNING id, vehicle, enforcer, 
                data->>'issuedDate' AS issueddate,
                data->>'violation' AS violation,
                data->>'fine' AS fine,
                data->>'ticketStatus' AS ticketstatus,
                data->>'images' AS images
    `;

    const result = await pool.query(query, [decryptedID]);

    if (result.rows.length === 0) {
      throw new Error("Ticket not found.");
    }

    const row = result.rows[0];

    return {
      id: await this.encrypt(row.id),
      vehicle: row.vehicle,
      enforcer: await this.encrypt(row.enforcer),
      issuedDate: new Date(row.issueddate),
      violation: row.violation,
      fine: parseFloat(row.fine),
      ticketStatus: row.ticketstatus,
      images: row.images,
    } as Ticket;
  }

  public async rejectTicketChallenge(ticketID: TicketInput): Promise<Ticket | null> {
    const decryptedID = await this.decrypt(ticketID.id);

    const query = `
      UPDATE ticket
      SET data = jsonb_set(
        data - 'challengeReason',
        '{ticketStatus}',
        '"unpaid"',
        true
      )
      WHERE id = $1
      RETURNING id, vehicle, enforcer, 
                data->>'issuedDate' AS issueddate,
                data->>'violation' AS violation,
                data->>'fine' AS fine,
                data->>'ticketStatus' AS ticketstatus,
                data->>'images' AS images
    `;

    const result = await pool.query(query, [decryptedID]);

    if (result.rows.length === 0) {
      throw new Error("Ticket not found.");
    }

    const row = result.rows[0];

    return {
      id: await this.encrypt(row.id),
      vehicle: row.vehicle,
      enforcer: await this.encrypt(row.enforcer),
      issuedDate: new Date(row.issueddate),
      violation: row.violation,
      fine: parseFloat(row.fine),
      ticketStatus: row.ticketstatus,
      images: row.images,
    } as Ticket;
  }

  public async challengeTicket(ticketID: TicketInput, challengeReason: string): Promise<ChallengeTicket | null> {
    const decryptedID = await this.decrypt(ticketID.id);

    const query = `
      UPDATE ticket
      SET data = jsonb_set(
        jsonb_set(data, '{ticketStatus}', '"challenged"', true),
        '{challengeReason}',
        $2::text::jsonb,
        true
      )
      WHERE id = $1
      RETURNING id, vehicle, enforcer,
                data->>'issuedDate' AS issueddate,
                data->>'violation' AS violation,
                data->>'fine' AS fine,
                data->>'ticketStatus' AS ticketstatus,
                data->>'images' AS images,
                data->>'note' AS note,
                data->>'challengeReason' AS challengereason
    `;

    const result = await pool.query(query, [decryptedID, JSON.stringify(challengeReason)]);

    if (result.rows.length === 0) {
      throw new Error("Ticket not found.");
    }

    const row = result.rows[0];

    return {
      id: await this.encrypt(row.id),
      vehicle: row.vehicle,
      enforcer: await this.encrypt(row.enforcer),
      issuedDate: new Date(row.issueddate),
      violation: row.violation,
      fine: parseFloat(row.fine),
      ticketStatus: row.ticketstatus,
      images: row.images,
      note: row.note,
      challengeReason: row.challengereason
    };
  }

  public async getChallengedTickets(): Promise<ChallengeTicket[]> {
    const query = `
      SELECT 
        id,
        vehicle,
        enforcer,
        data->>'issuedDate' AS issueddate,
        data->>'violation' AS violation,
        data->>'fine' AS fine,
        data->>'ticketStatus' AS ticketstatus,
        data->>'images' AS images,
        data->>'note' AS note,
        data->>'challengeReason' AS challengereason
      FROM ticket
      WHERE data->>'ticketStatus' = 'challenged'
      ORDER BY data->>'issuedDate' DESC;
    `;

    const result = await pool.query(query);

    const tickets: ChallengeTicket[] = [];

    for (const row of result.rows) {
      tickets.push({
        id: await this.encrypt(row.id),
        vehicle: row.vehicle,
        enforcer: await this.encrypt(row.enforcer),
        issuedDate: new Date(row.issueddate),
        violation: row.violation,
        fine: parseFloat(row.fine),
        ticketStatus: row.ticketstatus,
        images: row.images,
        note: row.note,
        challengeReason: row.challengereason
      });
    }

    return tickets;
  }

  public async getAcceptedTickets(): Promise<Ticket[]> {
    const query = `
      SELECT 
        id,
        vehicle,
        enforcer,
        data->>'issuedDate' AS issueddate,
        data->>'violation' AS violation,
        data->>'fine' AS fine,
        data->>'ticketStatus' AS ticketstatus,
        data->>'images' AS images,
        data->>'note' AS note
      FROM ticket
      WHERE data->>'ticketStatus' = 'accepted'
      ORDER BY data->>'issuedDate' DESC;
    `;

    const result = await pool.query(query);

    const tickets: Ticket[] = [];

    for (const row of result.rows) {
      tickets.push({
        id: await this.encrypt(row.id),
        vehicle: row.vehicle,
        enforcer: await this.encrypt(row.enforcer),
        issuedDate: new Date(row.issueddate),
        violation: row.violation,
        fine: parseFloat(row.fine),
        ticketStatus: row.ticketstatus,
        images: row.images,
        note: row.note
      });
    }

    return tickets;
  }

  public async getUnpaidTicketsPerDay(): Promise<Ticket[]> {
    const query = `
      SELECT 
        id,
        vehicle,
        enforcer,
        data->>'issuedDate' AS issueddate,
        data->>'violation' AS violation,
        data->>'fine' AS fine,
        data->>'ticketStatus' AS ticketstatus,
        data->>'images' AS images,
        data->>'note' AS note
      FROM ticket
      WHERE data->>'ticketStatus' = 'unpaid'
      ORDER BY data->>'issuedDate' DESC;
    `;

    const result = await pool.query(query);

    const tickets: Ticket[] = [];

    for (const row of result.rows) {
      tickets.push({
        id: await this.encrypt(row.id),
        vehicle: row.vehicle,
        enforcer: await this.encrypt(row.enforcer),
        issuedDate: new Date(row.issueddate),
        violation: row.violation,
        fine: parseFloat(row.fine),
        ticketStatus: row.ticketstatus,
        images: row.images,
        note: row.note
      });
    }

    return tickets;
  }

  public async generateTicketReport(timeRange: { numDays: number }) {
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - timeRange.numDays);
    const nowISO = now.toISOString();
    const startISO = startDate.toISOString();
  
    const totalQuery = `
      SELECT 
        COUNT(*) FILTER (
          WHERE (data->>'issuedDate')::timestamptz >= $1
            AND (data->>'issuedDate')::timestamptz <= $2
        ) AS total,
        COUNT(*) FILTER (
          WHERE (data->>'issuedDate')::timestamptz >= $1
            AND (data->>'issuedDate')::timestamptz <= $2
            AND data->>'ticketStatus' = 'unpaid'
        ) AS unpaid,
        COUNT(*) FILTER (
          WHERE (data->>'issuedDate')::timestamptz >= $1
            AND (data->>'issuedDate')::timestamptz <= $2
            AND data->>'ticketStatus' = 'paid'
        ) AS paid,
        COALESCE(SUM(
          CASE 
            WHEN (data->>'issuedDate')::timestamptz >= $1
              AND (data->>'issuedDate')::timestamptz <= $2
              AND data->>'ticketStatus' = 'paid'
            THEN (data->>'fine')::float
            ELSE 0
          END
        ), 0) AS revenue
      FROM ticket
    `;
  
    const result = await pool.query(totalQuery, [startISO, nowISO]);
    const row = result.rows[0];
  
    // Example breakdown by violation type
    const violationBreakdownQuery = `
      SELECT 
        data->>'violation' AS violation,
        COUNT(*) AS count
      FROM ticket
      WHERE (data->>'issuedDate')::timestamptz >= $1
        AND (data->>'issuedDate')::timestamptz <= $2
      GROUP BY violation
      ORDER BY count DESC
    `;
    const violationBreakdown = (await pool.query(violationBreakdownQuery, [startISO, nowISO])).rows;
  
    // Example breakdown by enforcer
    const enforcerBreakdownQuery = `
      SELECT 
        enforcer,
        COUNT(*) AS count
      FROM ticket
      WHERE (data->>'issuedDate')::timestamptz >= $1
        AND (data->>'issuedDate')::timestamptz <= $2
      GROUP BY enforcer
      ORDER BY count DESC
    `;
    const enforcerBreakdown = (await pool.query(enforcerBreakdownQuery, [startISO, nowISO])).rows;
  
    return {
      totalTickets: parseInt(row.total),
      unpaidTickets: parseInt(row.unpaid),
      paidTickets: parseInt(row.paid),
      totalRevenue: Math.round(parseFloat(row.revenue) * 100),
      violationBreakdown,
      enforcerBreakdown,
    };
  }
}