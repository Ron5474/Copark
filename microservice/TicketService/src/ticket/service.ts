import { Ticket, NewTicket, ModifyTicketInput, TicketInput } from "./schema";
import { pool } from "./db";
import { SignJWT, jwtVerify } from 'jose'
import e from "express";

const encodedKey = new TextEncoder().encode(process.env.MICROSERVICE_INTERNAL_SECRET + 'apiexit')

export class TicketService {
  private async encrypt(userId: string): Promise<string> {
    return new SignJWT({ id: userId })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('30m')
      .sign(encodedKey)
  }

  private async decrypt(token: string): Promise<string | undefined> {
    try {
      const { payload } = await jwtVerify(token, encodedKey)

      return payload.id as string; // Extract the `id` from the payload
    } catch (error) {
      void error;
      // console.error('Failed to decrypt token:', error);
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
        data->>'images' AS images
        FROM ticket
        WHERE data->>'ticketStatus' != 'deleted'
        ORDER BY data->>'issuedDate';
    `;

    const ticketResults = await pool.query(ticketQuery);

    const tickets: Ticket[] = [];

    for (const row of ticketResults.rows) {
      tickets.push({
        id: await this.encrypt(row.id),
        vehicle: await this.encrypt(row.vehicle),
        enforcer: await this.encrypt(row.enforcer),
        issuedDate: new Date(row.issueddate),
        violation: row.violation,
        fine: parseFloat(row.fine),
        ticketStatus: row.ticketstatus,
        images: row.images,
      });

    }

    // console.log(tickets);
    return tickets;
  }

  public async createTicket(newTicket: NewTicket): Promise<Ticket> {

    // console.log(newTicket);
    const enforcerId = await this.decrypt(newTicket.enforcer);
    const vehicleId = await this.decrypt(newTicket.vehicle);
    if (!enforcerId || !vehicleId) {
      throw new Error("Invalid enforcer or vehicle ID.");
    }
    //TODO: Check if the enforcerId and vehicleId are valid, will need services in enforcer and vehicle microservices

    const insertQuery = `
        INSERT INTO ticket (vehicle, enforcer, data)
        VALUES ($1, $2, jsonb_build_object(
            'issuedDate', $3::TIMESTAMP,
            'violation', $4::TEXT,
            'fine', $5::NUMERIC,
            'ticketStatus', $6::TEXT,
            'images', $7::TEXT
        ))
        RETURNING id, vehicle, enforcer, 
                  data->>'issuedDate' AS issueddate,
                  data->>'violation' AS violation,
                  data->>'fine' AS fine,
                  data->>'ticketStatus' AS ticketstatus,
                  data->>'images' AS images;
    `;

    const issuedDate = new Date().toISOString();
    const ticketStatus = 'active';

    const result = await pool.query(insertQuery, [
        vehicleId,
        enforcerId,
        issuedDate,
        newTicket.violation,
        newTicket.fine,
        ticketStatus,
        newTicket.images || null,
    ]);

    const row = result.rows[0];

    const ticket: Ticket = {
        id: await this.encrypt(row.id),
        vehicle: await this.encrypt(row.vehicle),
        enforcer: await this.encrypt(row.enforcer),
        issuedDate: new Date(row.issueddate),
        violation: row.violation,
        fine: parseFloat(row.fine),
        ticketStatus: row.ticketstatus,
        images: row.images,
    };

    // console.log(ticket.id);
    return ticket;
  }

  public async modifyTicket(input: ModifyTicketInput): Promise<Ticket | null> {
    const { id, vehicle, ...updates } = input;
  
    const decryptedID = await this.decrypt(id);
    let decryptedVehicle = null;
    if (vehicle) {
      decryptedVehicle = await this.decrypt(vehicle);
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
  
    let updatedData = { ...currentData };
  
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
      vehicle: await this.encrypt(row.vehicle),
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
      vehicle: await this.encrypt(row.vehicle),
      enforcer: await this.encrypt(row.enforcer),
      issuedDate: new Date(row.issueddate),
      violation: row.violation,
      fine: parseFloat(row.fine),
      ticketStatus: row.ticketstatus,
      images: row.images,
    } as Ticket;
  }

  public async getTicketsForVehicleID(vehicleIDs: string[]): Promise<Ticket[] | undefined> {


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

  const result = await pool.query(query, [vehicleIDs]);
  
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

  return await Promise.all(result.rows.map(async (row: TicketRow): Promise<Ticket> => ({
    id: await this.encrypt(row.id),
    vehicle: await this.encrypt(row.vehicle),
    enforcer: await this.encrypt(row.enforcer),
    issuedDate: new Date(row.issueddate),
    violation: row.violation,
    fine: parseFloat(row.fine),
    ticketStatus: row.ticketstatus,
    images: row.images,
  })));
  }
}