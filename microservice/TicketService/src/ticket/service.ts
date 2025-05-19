import { Ticket, NewTicket, ModifyTicketInput, TicketInput } from "./schema";
import { pool } from "./db";
import { SignJWT, jwtVerify } from 'jose'
import { Vehicle } from "../types/express";
import { sendTicketIssuedEmail } from './emailClient'

const encodedKey = new TextEncoder().encode(process.env.MICROSERVICE_INTERNAL_SECRET)

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
    const enforcerToken = newTicket.enforcer;
    console.log("enforcer", enforcerToken)
    const enforcerId = await this.decrypt(enforcerToken);
    const vehicleId = newTicket.vehicle;

    if (!enforcerId || !vehicleId) {
      throw new Error("Invalid enforcer or vehicle ID.");
    }

    // Step 1: get driver ID
    const ownerRes = await fetch('http://localhost:4001/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${enforcerToken}`,
      },
      body: JSON.stringify({
        query: `
          query FindOwner($vehicle: String!) {
            findOwnerByVehicleID(vehicle: $vehicle) {
              id
            }
          }
        `,
        variables: { vehicle: vehicleId },
      }),
    });

    const ownerJson = await ownerRes.json();

    const driverId = ownerJson?.data?.findOwnerByVehicleID?.id;
    // Step 2: Insert ticket
    const issuedDate = new Date().toISOString();
    const ticketStatus = 'active';

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

    // Step 3: If driver exists, fetch their email and send email
    if (driverId) {
      const driverRes = await fetch('http://localhost:3010/api/v0/auth/driver/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${enforcerToken}`,
        },
        body: JSON.stringify({ id: driverId }),
      });
      console.log("driver res", driverRes.status)
      if (driverRes.ok) {
        const driver = await driverRes.json();

        // await sendTicketIssuedEmail({
        //   to: driver.email,
        //   subject: `Ticket Issued for Your Vehicle`,
        //   html: `
        //     <h3>Hello ${driver.name}</h3>
        //     <p><strong>Violation:</strong> ${ticket.violation}</p>
        //     <p>Please log in to <a href="https://copark.space/driver/en/dashboard">copark.space</a> to view and pay your ticket.</p>
        //   `,
        // });
        await sendTicketIssuedEmail({
          to: driver.email,
          subject: `A Parking Ticket Has Been Issued for Your Vehicle`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
              <h2 style="color: #D32F2F;"> Parking Violation Notice</h2>
              <p>Hello <strong>${driver.name}</strong>,</p>
              <p>Your vehicle has been issued a ticket for the following violation:</p>
              <ul>
                <li><strong>Violation:</strong> ${ticket.violation}</li>
                <li><strong>Fine:</strong> $${ticket.fine.toFixed(2)}</li>
                <li><strong>Date Issued:</strong> ${ticket.issuedDate.toLocaleDateString()}</li>
                ${ticket.note ? `<li><strong>Note:</strong> ${ticket.note}</li>` : ""}
              </ul>
              <p style="margin-top: 20px;">
                <strong>Early Payment Discount:</strong><br>
                If you pay this ticket within <strong>24 hours</strong>, you'll receive a <strong>20% discount</strong>.
              </p>
              <p>
                You can view and pay your ticket by logging in to your dashboard:
              </p>
              <p>
                <a href="https://copark.space/driver/en/dashboard" style="background-color: #1976D2; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px;">View Ticket</a>
              </p>
              <p>
                <strong>Want to Challenge This Ticket?</strong><br>
                If you believe this ticket was issued in error, you may submit a challenge request from your dashboard. Be sure to include any evidence or explanation to support your case.
              </p>
              <p style="margin-top: 30px;">Need help? Contact us at <a href="mailto:coparkspace@gmail.com">coparkspace@gmail.com</a>.</p>
              <p style="color: gray; font-size: 0.9em;">This is an automated message from CoPark.</p>
            </div>
          `
        });

      } else {
        console.warn("Driver email not sent: failed to fetch driver info.");
      }
    } else {
      console.info("No driver linked to vehicle — skipping email.");
    }

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

  public async getAllTicketsCount(): Promise<Record<string, Ticket[]>> {
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

    const ticketsByDay: Record<string, Ticket[]> = {};

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
      if (!ticketsByDay[date]) {
        ticketsByDay[date] = [];
      }
      ticketsByDay[date].push(ticket);
    }

    return ticketsByDay;
  }

  public async getTicketsIssuedByEnforcer(enforcerID: string): Promise<Ticket[] | undefined> {

    const enforcerDecrypted = await this.decrypt(enforcerID)
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
    )

    if (result.rowCount === 0) return []

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

    // console.log(tickets);
    return tickets;
  }
}